'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';

export default function EventCreatorForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('MEETING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          date,
          type,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create calendar event.');
      }

      setSuccess(true);
      setTitle('');
      setDescription('');
      setDate('');
      setType('MEETING');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-blue-200/60 p-4 space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 text-xs text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-3 text-xs text-green-700">
          Calendar event created successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Title */}
        <div className="md:col-span-2 space-y-1">
          <label htmlFor="title" className="block text-xs font-semibold text-gray-700">
            Event Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Science Fair Exhibition"
          />
        </div>

        {/* Date */}
        <div className="space-y-1">
          <label htmlFor="date" className="block text-xs font-semibold text-gray-700">
            Date
          </label>
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Type */}
        <div className="space-y-1">
          <label htmlFor="type" className="block text-xs font-semibold text-gray-700">
            Event Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="block w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="EXAM">EXAM</option>
            <option value="HOLIDAY">HOLIDAY</option>
            <option value="SPORTS">SPORTS</option>
            <option value="MEETING">MEETING</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label htmlFor="description" className="block text-xs font-semibold text-gray-700">
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 leading-normal"
          placeholder="Provide more context (room location, guidelines, etc.)"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              <span>Create Event</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
