import React from 'react';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import TeacherDashboardConsole from '@/components/TeacherDashboardConsole';
import { BookOpen, Calendar, Award } from 'lucide-react';

export const revalidate = 0; // Always fetch fresh data

export default async function TeacherDashboard() {
  const session = await getSession();

  if (!session) {
    return <div>Unauthorized.</div>;
  }

  // Fetch classes taught by this teacher with all enrollments
  const taughtClasses = await prisma.class.findMany({
    where: { teacherId: session.userId },
    include: {
      enrollments: {
        include: {
          student: {
            include: {
              user: true,
              attendance: {
                orderBy: { date: 'desc' },
                take: 15,
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
                orderBy: { assessmentDate: 'desc' },
                take: 15,
              },
            },
          },
        },
      },
    },
  });

  const mapStudent = (enr: any) => ({
    id: enr.student.id,
    name: enr.student.name,
    email: enr.student.user.email,
    admissionNo: enr.student.admissionNo,
    phone: enr.student.phone,
    address: enr.student.address,
    photoUrl: enr.student.photoUrl,
    isArchived: enr.student.isArchived,
    monthlyReports: enr.student.monthlyReports?.map((r: any) => ({
      id: r.id,
      month: r.month,
      totalDays: r.totalDays,
      daysPresent: r.daysPresent,
      daysAbsent: r.daysAbsent,
      conduct: r.conduct,
      remarks: r.remarks,
      attachmentUrl: r.attachmentUrl,
      attachmentName: r.attachmentName,
      teacherName: r.uploadedBy?.name || 'Class Teacher',
      updatedAt: r.updatedAt.toISOString(),
    })) || [],
    activityDocs: enr.student.studentActivityDocs?.map((d: any) => ({
      id: d.id,
      title: d.title,
      type: d.type,
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      fileType: d.fileType,
      remarks: d.remarks,
      activityDate: d.activityDate ? d.activityDate.toISOString() : null,
      teacherName: d.uploadedBy?.name || 'Class Teacher',
      createdAt: d.createdAt.toISOString(),
    })) || [],
    recentAttendance: enr.student.attendance.map((att: any) => ({
      date: att.date.toISOString(),
      status: att.status,
    })),
    recentGrades: enr.student.studentGrades.map((grd: any) => ({
      id: grd.id,
      subject: grd.subject,
      score: grd.score,
      maxScore: grd.maxScore,
      remarks: grd.remarks,
    })),
  });

  // Map database response separating active and archived students per class
  const formattedClasses = taughtClasses.map((cls) => {
    const activeEnrollments = cls.enrollments.filter((e) => !e.student.isArchived);
    const archivedEnrollments = cls.enrollments.filter((e) => e.student.isArchived);

    return {
      id: cls.id,
      name: cls.name,
      students: activeEnrollments.map(mapStudent),
      archivedStudents: archivedEnrollments.map(mapStudent),
    };
  });

  // Fetch simple performance overview metrics
  const studentsCount = formattedClasses.reduce((sum, cls) => sum + cls.students.length, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Console</h1>
        <p className="text-sm text-gray-500 mt-1">Homeroom Teacher: {session.name}</p>
      </div>

      {/* Main Console Components */}
      {formattedClasses.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No classes assigned yet</h3>
          <p className="mt-1 text-sm text-gray-500">Contact the school administrator to assign you to a class.</p>
        </div>
      ) : (
        <TeacherDashboardConsole classes={formattedClasses} teacherId={session.userId} />
      )}
    </div>
  );
}
