import React from 'react';
import prisma from '@/lib/prisma';
import AdminDashboardConsole from '@/components/AdminDashboardConsole';

export const revalidate = 0; // Always fetch fresh data for admin

export default async function AdminDashboard() {
  // Ultra-lightweight parallel queries: exclude heavy base64 monthly reports/documents from initial payload
  const [
    totalUsers,
    studentsCount,
    teachersCount,
    classes,
    teachers,
    announcements,
    students,
    archivedStudents,
    admissions,
    galleryItems,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.class.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        teacherId: true,
        teacher: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            studentId: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            photoUrl: true,
            taughtClasses: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        audience: true,
        isTicker: true,
        isPinned: true,
        imageUrl: true,
        createdAt: true,
        createdBy: {
          select: { name: true },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        role: 'STUDENT',
        profile: { isArchived: false },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            admissionNo: true,
            photoUrl: true,
            isArchived: true,
            enrollments: {
              select: {
                id: true,
                classId: true,
                class: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: {
        role: 'STUDENT',
        profile: { isArchived: true },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            admissionNo: true,
            photoUrl: true,
            isArchived: true,
            enrollments: {
              select: {
                id: true,
                classId: true,
                class: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.admission.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <AdminDashboardConsole
      studentsCount={studentsCount}
      teachersCount={teachersCount}
      classes={classes}
      teachers={teachers}
      students={students}
      archivedStudents={archivedStudents}
      admissions={admissions}
      announcements={announcements}
      galleryItems={galleryItems}
    />
  );
}
