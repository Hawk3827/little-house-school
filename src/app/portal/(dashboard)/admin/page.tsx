import React from 'react';
import prisma from '@/lib/prisma';
import AdminDashboardConsole from '@/components/AdminDashboardConsole';

export const revalidate = 0; // Always fetch fresh data for admin

export default async function AdminDashboard() {
  // Execute all admin queries in parallel via Promise.all for maximum speed (~150ms total)
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
      include: {
        teacher: true,
        enrollments: true,
      },
    }),
    prisma.user.findMany({
      where: { role: 'TEACHER' },
      include: {
        profile: {
          include: {
            taughtClasses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
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
      include: {
        profile: {
          include: {
            enrollments: {
              include: { class: true },
            },
            monthlyReports: {
              orderBy: { createdAt: 'desc' },
              include: { uploadedBy: { select: { name: true } } },
            },
            studentActivityDocs: {
              orderBy: { createdAt: 'desc' },
              include: { uploadedBy: { select: { name: true } } },
            },
            studentGrades: {
              orderBy: { assessmentDate: 'desc' },
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
      include: {
        profile: {
          include: {
            enrollments: {
              include: { class: true },
            },
            monthlyReports: {
              orderBy: { createdAt: 'desc' },
              include: { uploadedBy: { select: { name: true } } },
            },
            studentActivityDocs: {
              orderBy: { createdAt: 'desc' },
              include: { uploadedBy: { select: { name: true } } },
            },
            studentGrades: {
              orderBy: { assessmentDate: 'desc' },
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
