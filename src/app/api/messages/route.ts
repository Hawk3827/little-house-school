import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const revalidate = 0;

// GET message list or chat logs
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatWith = searchParams.get('chatWith');

    // 1. Get messages for a specific conversation
    if (chatWith) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.userId, receiverId: chatWith },
            { senderId: chatWith, receiverId: session.userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });

      // Mark received messages as read
      await prisma.message.updateMany({
        where: {
          senderId: chatWith,
          receiverId: session.userId,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({ messages });
    }

    // 2. Get contact list with last message overview
    const userId = session.userId;
    const role = session.role;

    let contacts: any[] = [];

    if (role === 'TEACHER') {
      // Teachers talk to students in their classes and their parents
      const teacherClasses = await prisma.class.findMany({
        where: { teacherId: userId },
        include: {
          enrollments: {
            include: {
              student: {
                include: {
                  user: { select: { email: true } },
                  asStudentParents: {
                    include: {
                      parent: {
                        include: { user: { select: { email: true } } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Map unique students and unique parents
      const studentMap = new Map();
      const parentMap = new Map();

      for (const cls of teacherClasses) {
        for (const enr of cls.enrollments) {
          const student = enr.student;
          studentMap.set(student.id, {
            id: student.id,
            name: student.name,
            role: 'STUDENT',
            email: student.user.email,
          });

          for (const sp of student.asStudentParents) {
            const parent = sp.parent;
            parentMap.set(parent.id, {
              id: parent.id,
              name: `${parent.name} (Parent of ${student.name})`,
              role: 'PARENT',
              email: parent.user.email,
            });
          }
        }
      }

      contacts = Array.from(studentMap.values()).concat(Array.from(parentMap.values()));
    } else if (role === 'STUDENT' || role === 'PARENT') {
      // Students/parents talk to their homeroom teacher
      const studentId = role === 'STUDENT' ? userId : null;
      let targetStudentId = studentId;

      if (role === 'PARENT') {
        const link = await prisma.studentParent.findFirst({
          where: { parentId: userId },
        });
        targetStudentId = link?.studentId || null;
      }

      if (targetStudentId) {
        const enrollment = await prisma.enrollment.findFirst({
          where: { studentId: targetStudentId },
          include: {
            class: {
              include: {
                teacher: {
                  include: { user: { select: { email: true } } },
                },
              },
            },
          },
        });

        const teacher = enrollment?.class?.teacher;
        if (teacher) {
          contacts.push({
            id: teacher.id,
            name: `${teacher.name} (Homeroom Teacher)`,
            role: 'TEACHER',
            email: teacher.user.email,
          });
        }
      }
    }

    // Attach last message details to each contact
    const contactsWithLastMsg = await Promise.all(
      contacts.map(async (contact) => {
        const lastMsg = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: contact.id },
              { senderId: contact.id, receiverId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        const unreadCount = await prisma.message.count({
          where: {
            senderId: contact.id,
            receiverId: userId,
            read: false,
          },
        });

        return {
          ...contact,
          lastMessage: lastMsg ? lastMsg.content : null,
          lastMessageDate: lastMsg ? lastMsg.createdAt : null,
          unreadCount,
        };
      })
    );

    // Sort contacts by who messaged last
    contactsWithLastMsg.sort((a, b) => {
      const dateA = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
      const dateB = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ contacts: contactsWithLastMsg });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

import { parseSafeJson } from '@/lib/payloadGuard';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeText } from '@/lib/sanitize';

// POST new message
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Rate Limiting: Max 15 messages per minute per user
    const rateLimit = checkRateLimit(`msg_${session.userId}`, {
      maxAttempts: 15,
      windowMs: 60 * 1000,
      lockoutMs: 2 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `⚠️ Rate limit exceeded. Please wait ${rateLimit.retryAfterSeconds}s before sending another message.` },
        { status: 429 }
      );
    }

    const { data: body, errorResponse } = await parseSafeJson(request, 64 * 1024); // 64KB message limit
    if (errorResponse) return errorResponse;

    const { receiverId, content } = body || {};

    if (!receiverId || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'Receiver ID and message content are required.' },
        { status: 400 }
      );
    }

    const cleanContent = sanitizeText(content);

    const message = await prisma.message.create({
      data: {
        senderId: session.userId,
        receiverId,
        content: cleanContent,
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
