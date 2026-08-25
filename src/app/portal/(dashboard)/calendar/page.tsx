import React from 'react';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import CalendarView from '@/components/CalendarView';
import EventCreatorForm from '@/components/EventCreatorForm';

export const revalidate = 0;

export default async function CalendarPage() {
  const session = await getSession();
  const isAdmin = session?.role === 'ADMIN';

  // Fetch all calendar events
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  });

  // Map to simple JSON payload compatible with client component
  const serializableEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date.toISOString(),
    type: e.type,
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School Event Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Keep track of examinations, parents meetings, school holidays, and sports events.
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Administrator Panel</h2>
          <p className="text-xs text-blue-700 mb-4">
            Use the form below to create calendar events. These will immediately display on the calendars of all parents, students, and teachers.
          </p>
          <EventCreatorForm />
        </div>
      )}

      {/* Main Calendar View */}
      <CalendarView initialEvents={serializableEvents} />
    </div>
  );
}
