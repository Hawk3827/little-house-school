'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, AlertCircle, Camera, Check, Zap } from 'lucide-react';
import { validateAndProcessUpload } from '@/lib/fileValidationAndCompression';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    address: string | null;
    photoUrl: string | null;
    admissionNo: string | null;
  } | null;
  onSuccess: () => void;
}

export default function EditStudentModal({ isOpen, onClose, student, onSuccess }: EditStudentModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync state with student prop
  useEffect(() => {
    if (student) {
      setName(student.name);
      setEmail(student.email);
      setPhone(student.phone || '');
      setAddress(student.address || '');
      setPhoto(null);
      setPhotoPreview(student.photoUrl);
      setCompressionInfo(null);
      setError('');
      setSuccess(false);
    }
  }, [student]);

  // Handle photo file change
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    setPhotoPreview(result.previewUrl);
    if (result.compressionRatio) {
      setCompressionInfo(`Optimized: ${(result.originalSize / 1024 / 1024).toFixed(1)}MB → ${(result.compressedSize / 1024).toFixed(0)}KB`);
    } else {
      setCompressionInfo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('id', student.id);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('address', address);
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await fetch('/api/admin/students', {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update student details.');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end overflow-hidden bg-black/40 backdrop-blur-[2px] animate-fadeIn" onClick={onClose}>
      <div className="bg-white max-w-xl w-full h-full border-l border-slate-200 shadow-2xl overflow-hidden text-left relative flex flex-col animate-slideInRight rounded-l-3xl rounded-r-none ml-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Modify Student Profile</h3>
            <p className="text-xs font-mono font-bold text-indigo-600 mt-0.5">{student.admissionNo || 'No Admission Number'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 text-xs text-red-700 font-medium flex items-start space-x-2 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 p-3 text-xs text-green-700 font-medium flex items-center space-x-2 rounded-xl animate-fadeIn">
              <Check className="h-4 w-4 text-green-600" />
              <span>Profile updated successfully! Refreshing...</span>
            </div>
          )}

          {/* Large Photo Preview & Upload */}
          <div className="flex flex-col items-center justify-center space-y-3 pb-2 border-b border-gray-50">
            <span className="block text-gray-400 uppercase tracking-wider text-[10px] font-bold">Student Photo</span>
            <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-100 shadow-md">
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt={name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-50 text-indigo-650 flex items-center justify-center font-bold text-2xl uppercase">
                  {name.slice(0, 2)}
                </div>
              )}
              <label 
                htmlFor="modal-photo" 
                className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-[10px] font-bold"
              >
                <Camera className="h-4 w-4 mb-0.5" />
                Change
              </label>
              <input 
                id="modal-photo" 
                type="file" 
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            {photo && (
              <div className="flex flex-col items-center space-y-1">
                <span className="text-[10px] text-indigo-650 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  New Photo Selected
                </span>
                {compressionInfo && (
                  <span className="text-[9px] text-indigo-700 font-mono">
                    {compressionInfo}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Profile fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="modal-name" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px] font-bold">Student Name</label>
              <input
                id="modal-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
              />
            </div>

            <div>
              <label htmlFor="modal-email" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px] font-bold">Email Address</label>
              <input
                id="modal-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="modal-phone" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px] font-bold">Contact Phone</label>
                <input
                  id="modal-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div>
                <label htmlFor="modal-address" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px] font-bold">Address</label>
                <input
                  id="modal-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                  placeholder="e.g. Imphal, Manipur"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-150 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
