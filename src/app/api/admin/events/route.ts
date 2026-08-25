import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { title, description, date, type } = await request.json();

    if (!title || !date || !type) {
      return NextResponse.json(
        { error: 'Title, date, and type are required.' },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        type,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Create calendar event error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
