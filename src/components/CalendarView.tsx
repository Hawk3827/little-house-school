'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';

interface SchoolEvent {
  id: string;
  title: string;
  description: string | null;
  date: Date | string;
  type: string;
}

interface CalendarViewProps {
  initialEvents: SchoolEvent[];
}

export default function CalendarView({ initialEvents }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get start/end details of the month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper for dates matching
  const getEventsForDay = (day: number) => {
    return initialEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Event styling helpers
  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'EXAM':
        return 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100';
      case 'HOLIDAY':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100';
      case 'SPORTS':
        return 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100';
      case 'MEETING':
        return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100';
    }
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case 'EXAM': return 'bg-red-500';
      case 'HOLIDAY': return 'bg-yellow-500';
      case 'SPORTS': return 'bg-green-500';
      case 'MEETING': return 'bg-blue-500';
      default: return 'bg-purple-500';
    }
  };

  // Generate blank calendar days for grid padding
  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(<div key={`blank-${i}`} className="h-24 bg-gray-50 border border-gray-100"></div>);
  }

  // Generate calendar days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day);
    const isToday =
      day === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();

    calendarCells.push(
      <div
        key={`day-${day}`}
        className={`h-24 bg-white border border-gray-100 p-1 flex flex-col transition hover:bg-gray-50 select-none overflow-hidden ${
          isToday ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/10' : ''
        }`}
      >
        <span
          className={`text-xs font-semibold h-6 w-6 flex items-center justify-center rounded-full mb-1 ${
            isToday
              ? 'bg-blue-600 text-white'
              : 'text-gray-700'
          }`}
        >
          {day}
        </span>
        <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin">
          {dayEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={`w-full text-left text-[10px] px-1.5 py-0.5 rounded border font-medium truncate flex items-center space-x-1 ${getEventBadgeColor(
                event.type
              )}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor(event.type)}`} />
              <span className="truncate">{event.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Calendar Grid */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {monthNames[month]} {year}
            </h2>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={prevMonth}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Calendar Weeks Header */}
        <div className="grid grid-cols-7 gap-px text-center mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-xs font-semibold text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          {calendarCells}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100 text-xs justify-center font-medium">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-gray-600">Exams</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-gray-600">Holidays</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-gray-600">Sports</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-600">Meetings</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-gray-600">Others</span>
          </span>
        </div>
      </div>

      {/* Details sidebar card */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col min-h-[300px]">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
            Event Details
          </h3>
          {selectedEvent ? (
            <div className="space-y-4 flex-1 flex flex-col">
              <div>
                <span
                  className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getEventBadgeColor(
                    selectedEvent.type
                  )}`}
                >
                  {selectedEvent.type}
                </span>
                <h4 className="text-base font-bold text-gray-900 mt-2">{selectedEvent.title}</h4>
              </div>
              <div className="text-xs text-gray-500">
                Date: {new Date(selectedEvent.date).toLocaleDateString(undefined, { dateStyle: 'full' })}
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs text-gray-600 leading-relaxed flex-1">
                {selectedEvent.description || 'No description provided.'}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-6 space-y-2">
              <Info className="h-8 w-8 text-gray-300" />
              <p className="text-sm">Click an event in the calendar to view its details here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
