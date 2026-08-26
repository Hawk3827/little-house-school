'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, User, Mail, Phone, MapPin, Lock, School, Image as ImageIcon, Zap } from 'lucide-react';
import { validateAndProcessUpload } from '@/lib/fileValidationAndCompression';

interface ClassItem {
  id: string;
  name: string;
}

export interface TeacherItem {
  id: string;
  email: string;
  role?: string;
  profile: {
    name: string;
    phone: string | null;
    address: string | null;
    photoUrl: string | null;
    taughtClasses?: { id: string; name: string }[];
  } | null;
}

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherItem | null;
  classes: ClassItem[];
  onSaved: () => void;
}

export default function EditTeacherModal({
  isOpen,
  onClose,
  teacher,
  classes,
  onSaved,
}: EditTeacherModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [classId, setClassId] = useState('none');
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (teacher) {
      setName(teacher.profile?.name || '');
      setEmail(teacher.email || '');
      setPhone(teacher.profile?.phone || '');
      setAddress(teacher.profile?.address || '');
      setPassword('');
      setPhoto(null);
      setPreviewUrl(teacher.profile?.photoUrl || null);
      setCompressionInfo(null);

      const assigned = teacher.profile?.taughtClasses?.[0]?.id;
      setClassId(assigned || 'none');
      setError('');
    }
  }, [teacher]);

  // Handle local file preview with auto-compression
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setError('');
    const result = await validateAndProcessUpload(file, {
      allowedTypes: ['image'],
      maxDimension: 1200,
      quality: 0.85
    });

    if ('error' in result) {
      setError(result.error);
      e.target.value = '';
      return;
    }

    setPhoto(result.file);
    setPreviewUrl(result.previewUrl);
    if (result.compressionRatio) {
      setCompressionInfo(`Optimized: ${(result.originalSize / 1024 / 1024).toFixed(1)}MB → ${(result.compressedSize / 1024).toFixed(0)}KB`);
    } else {
      setCompressionInfo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('id', teacher.id);
      formData.append('name', name.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('phone', phone.trim());
      formData.append('address', address.trim());
      formData.append('classId', classId);
      if (password.trim()) {
        formData.append('password', password.trim());
      }
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await fetch('/api/admin/teachers', {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update teacher.');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !teacher) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden text-left relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900">Edit Teacher Account</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Photo Preview & Upload */}
          <div className="flex items-center space-x-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200 flex-shrink-0 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {previewUrl ? (
                <img src={previewUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                name ? name.slice(0, 2).toUpperCase() : 'TC'
              )}
            </div>
            <div className="flex-1 space-y-1">
              <label className="block text-xs font-bold text-gray-700">Change Profile Photo</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              {compressionInfo && (
                <span className="text-[9px] text-indigo-700 font-mono block mt-0.5">
                  {compressionInfo}
                </span>
              )}
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Login Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-900"
              />
            </div>
          </div>

          {/* Password (Optional for resetting) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Reset Password (leave blank to keep current)
            </label>
            <input
              type="password"
              placeholder="New password (e.g. teacher123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-900"
            />
          </div>

          {/* Assigned Homeroom Class */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Assigned Homeroom Class
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-900 font-semibold"
            >
              <option value="none">-- No Class Assigned (Subject Faculty / Unassigned) --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Phone & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Address / City
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="New Delhi, India"
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-900"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Update Teacher</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
