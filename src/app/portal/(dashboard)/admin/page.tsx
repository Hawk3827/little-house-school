import React from 'react';
import prisma from '@/lib/prisma';
import AdminDashboardConsole from '@/components/AdminDashboardConsole';

export const revalidate = 0; // Always fetch fresh data

export default async function AdminDashboard() {
  // Fetch general stats
  const totalUsers = await prisma.user.count();
  const studentsCount = await prisma.user.count({ where: { role: 'STUDENT' } });
  const teachersCount = await prisma.user.count({ where: { role: 'TEACHER' } });
  
  const classes = await prisma.class.findMany({
    include: {
      teacher: true,
      enrollments: true,
    },
  });

  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    include: {
      profile: {
        include: {
          taughtClasses: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: { name: true },
      },
    },
  });

  const students = await prisma.user.findMany({
    where: { 
      role: 'STUDENT',
      profile: { isArchived: false }
    },
    include: {
      profile: {
        include: {
          enrollments: {
            include: { class: true }
          },
          monthlyReports: {
            orderBy: { createdAt: 'desc' },
            include: { uploadedBy: { select: { name: true } } }
          },
          studentActivityDocs: {
            orderBy: { createdAt: 'desc' },
            include: { uploadedBy: { select: { name: true } } }
          },
          studentGrades: {
            orderBy: { assessmentDate: 'desc' }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const archivedStudents = await prisma.user.findMany({
    where: { 
      role: 'STUDENT',
      profile: { isArchived: true }
    },
    include: {
      profile: {
        include: {
          enrollments: {
            include: { class: true }
          },
          monthlyReports: {
            orderBy: { createdAt: 'desc' },
            include: { uploadedBy: { select: { name: true } } }
          },
          studentActivityDocs: {
            orderBy: { createdAt: 'desc' },
            include: { uploadedBy: { select: { name: true } } }
          },
          studentGrades: {
            orderBy: { assessmentDate: 'desc' }
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  const admissions = await prisma.admission.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const galleryItems = await prisma.galleryItem.findMany({
    orderBy: { createdAt: 'desc' },
  });

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
