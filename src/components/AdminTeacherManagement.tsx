'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, 
  UserCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  X, 
  Edit3, 
  Trash2, 
  School, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  ShieldCheck,
  UploadCloud
} from 'lucide-react';
import EditTeacherModal, { TeacherItem } from './EditTeacherModal';
import StudentPhotoLightbox from './StudentPhotoLightbox';

interface ClassItem {
  id: string;
  name: string;
}

export default function AdminTeacherManagement({
  teachers,
  classes,
}: {
  teachers: TeacherItem[];
  classes: ClassItem[];
}) {
  const router = useRouter();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('teacher123');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [classId, setClassId] = useState('none');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Table Search & Modal State
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<TeacherItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string | null; name: string } | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('password', password.trim());
      formData.append('phone', phone.trim());
      formData.append('address', address.trim());
      formData.append('classId', classId);
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await fetch('/api/admin/teachers', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add teacher.');
      }

      setSuccessMsg(`Teacher account for "${name}" created successfully! Portal login credentials have been activated.`);
      setName('');
      setEmail('');
      setPassword('teacher123');
      setPhone('');
      setAddress('');
      setClassId('none');
      setPhoto(null);
      setPhotoPreview(null);

      const fileInput = document.getElementById('teacher-photo-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id: string, teacherName: string) => {
    if (!confirm(`Are you sure you want to delete teacher "${teacherName}"? This will revoke their portal access.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/teachers?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete teacher.');
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting teacher.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter teachers list
  const filteredTeachers = useMemo(() => {
    if (!searchTerm.trim()) return teachers;
    const q = searchTerm.toLowerCase().trim();
    return teachers.filter((t) => {
      const teacherName = t.profile?.name?.toLowerCase() || '';
      const teacherEmail = t.email?.toLowerCase() || '';
      const teacherPhone = t.profile?.phone?.toLowerCase() || '';
      const className = t.profile?.taughtClasses?.[0]?.name?.toLowerCase() || '';
      return (
        teacherName.includes(q) ||
        teacherEmail.includes(q) ||
        teacherPhone.includes(q) ||
        className.includes(q)
      );
    });
  }, [teachers, searchTerm]);

  return (
    <div className="space-y-8">
      {/* 1. Add Faculty Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-900">Add Faculty / Teacher with Portal Access</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Create teacher accounts with login access to the Teacher Portal to manage attendance, submit monthly reports, and evaluate students.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs text-red-700 font-medium flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 border border-green-200 p-3.5 rounded-xl text-xs text-green-700 font-medium flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAddTeacher} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mrs. Priya Sen"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Login Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya.sen@littlehouse.edu"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
              />
            </div>

            {/* Initial Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Initial Password *
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Default: teacher123"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Assign Homeroom Class */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Assign Homeroom Class
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
              >
                <option value="none">-- No Class Assigned (Subject Faculty) --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
              />
            </div>

            {/* Residential Address / City */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Residential Address / City
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="New Delhi, India"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
              />
            </div>
          </div>

          {/* Teacher Photo Upload */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200 flex-shrink-0 flex items-center justify-center text-indigo-700 font-bold">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <UserCheck className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <label className="block text-xs font-bold text-gray-700">Teacher Profile Photo (Optional)</label>
              <input
                id="teacher-photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Create Teacher & Grant Portal Access</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Teachers Directory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">Faculty Directory & Portal Access Control</h3>
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                {filteredTeachers.length} Active Faculty
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              List of all teachers authorized to sign in to the Little House Teacher Portal.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search faculty..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition placeholder-gray-400 text-gray-800 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Teachers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase">
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Login Email</th>
                <th className="py-3 px-4">Assigned Class</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Portal Access</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-600">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400 font-light">
                    {searchTerm ? `No faculty found matching "${searchTerm}".` : 'No teachers registered yet.'}
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => {
                  const teacherName = teacher.profile?.name || 'Unnamed User';
                  const assignedClass = teacher.profile?.taughtClasses?.[0];
                  const isAdmin = (teacher as any).role === 'ADMIN';

                  return (
                    <tr key={teacher.id} className={`transition-colors ${isAdmin ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-gray-50'}`}>
                      {/* Name & Photo */}
                      <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setPreviewPhoto({
                            url: teacher.profile?.photoUrl || null,
                            name: teacherName,
                          })}
                          className="relative group focus:outline-none cursor-pointer flex-shrink-0"
                          title="Click to view full photo"
                        >
                          {teacher.profile?.photoUrl ? (
                            <img
                              src={teacher.profile.photoUrl}
                              alt={teacherName}
                              className={`w-9 h-9 rounded-full object-cover border transition ${isAdmin ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-200 group-hover:ring-2 group-hover:ring-indigo-500'}`}
                            />
                          ) : (
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase border transition ${isAdmin ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-indigo-50 text-indigo-600 border-indigo-150 group-hover:ring-2 group-hover:ring-indigo-500'}`}>
                              {isAdmin ? '👑' : teacherName.slice(0, 2)}
                            </div>
                          )}
                        </button>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 flex items-center space-x-1.5">
                            <span>{teacherName}</span>
                            {isAdmin && <span className="text-xs" title="System Administrator">👑</span>}
                          </span>
                          {isAdmin && (
                            <span className="text-[10px] font-mono font-bold text-purple-700">Administrator Account</span>
                          )}
                        </div>
                      </td>

                      {/* Login Email */}
                      <td className="py-3.5 px-4 text-xs font-mono text-gray-700">
                        {teacher.email}
                      </td>

                      {/* Assigned Class / Role */}
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="bg-amber-100 text-amber-950 text-xs px-2.5 py-1 rounded-full font-black border border-amber-300 inline-flex items-center space-x-1 shadow-2xs">
                            <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                            <span>👑 SYSTEM ADMIN</span>
                          </span>
                        ) : assignedClass ? (
                          <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-bold border border-purple-100 inline-flex items-center space-x-1">
                            <School className="h-3 w-3" />
                            <span>{assignedClass.name}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-xs text-gray-600">
                        {teacher.profile?.phone || '-'}
                      </td>

                      {/* Portal Access Badge */}
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold inline-flex items-center space-x-1">
                            <Lock className="h-3 w-3 text-purple-700" />
                            <span>Admin Access (Read-Only)</span>
                          </span>
                        ) : (
                          <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center space-x-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Active Access</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isAdmin ? (
                          <span 
                            title="Admin credentials are read-only and cannot be modified by other admins on the portal."
                            className="text-slate-400 font-mono text-[11px] font-bold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl inline-flex items-center space-x-1 cursor-not-allowed select-none"
                          >
                            <Lock className="h-3.5 w-3.5 text-slate-400" />
                            <span>Read-Only</span>
                          </span>
                        ) : (
                          <div className="space-x-2">
                            <button
                              onClick={() => setEditingTeacher(teacher)}
                              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1.5 rounded-lg transition inline-flex items-center"
                              title="Edit Teacher details"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(teacher.id, teacherName)}
                              disabled={deletingId === teacher.id}
                              className="text-red-500 hover:text-red-750 hover:bg-red-50 p-1.5 rounded-lg transition disabled:opacity-50 inline-flex items-center"
                              title="Revoke Access & Delete Teacher"
                            >
                              {deletingId === teacher.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Teacher Modal */}
      <EditTeacherModal
        isOpen={!!editingTeacher}
        onClose={() => setEditingTeacher(null)}
        teacher={editingTeacher}
        classes={classes}
        onSaved={() => {
          router.refresh();
        }}
      />

      {/* Photo Lightbox */}
      <StudentPhotoLightbox
        isOpen={!!previewPhoto}
        onClose={() => setPreviewPhoto(null)}
        photoUrl={previewPhoto?.url || null}
        name={previewPhoto?.name || ''}
      />
    </div>
  );
}
