'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { validateAndProcessUpload } from '@/lib/fileValidationAndCompression';

interface ClassItem {
  id: string;
  name: string;
}

export default function AdminStudentEnrollForm({ classes }: { classes: ClassItem[] }) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('student123'); // Default password
  const [classId, setClassId] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any | null>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (result.compressionRatio) {
      setCompressionInfo(`Optimized: ${(result.originalSize / 1024 / 1024).toFixed(1)}MB → ${(result.compressedSize / 1024).toFixed(0)}KB (${result.compressionRatio})`);
    } else {
      setCompressionInfo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) {
      setError('Please select a class.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessData(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('classId', classId);
      formData.append('phone', phone);
      formData.append('address', address);
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await fetch('/api/admin/students', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enroll student.');
      }

      setSuccessData(data.student);
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setPhoto(null);
      
      // Reset file input element if found
      const fileInput = document.getElementById('student-photo') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4 text-left">
      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
        <UserPlus className="h-5 w-5 text-indigo-600" />
        <span>Offline Student Enrollment</span>
      </h3>

      {successData && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl space-y-2 animate-fadeIn">
          <div className="flex items-center space-x-2 text-green-700 font-bold text-sm">
            <CheckCircle2 className="h-5 w-5" />
            <span>Student Registered Successfully!</span>
          </div>
          <div className="text-xs text-green-600 font-medium space-y-1">
            <p>🎓 <strong className="text-green-800">Admission Number:</strong> {successData.admissionNo}</p>
            <p>👤 <strong>Name:</strong> {successData.name}</p>
            <p>📧 <strong>Email (Login):</strong> {successData.email}</p>
            <p>🔑 <strong>Password:</strong> student123</p>
            <p>🏫 <strong>Enrolled Class:</strong> {successData.className}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessData(null)}
            className="text-[10px] text-green-700 font-bold underline hover:text-green-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 text-xs text-red-700 font-medium flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="student-name" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px]">Student Full Name</label>
            <input
              id="student-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label htmlFor="student-email" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px]">Email Address (Login ID)</label>
            <input
              id="student-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
              placeholder="e.g. johndoe@school.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="student-class" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px]">Assign Class</label>
            <select
              id="student-class"
              required
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
            >
              <option value="">-- Choose Class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="student-password" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px]">Login Password</label>
            <input
              id="student-password"
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-850"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="student-phone" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px]">Parent Contact Number</label>
            <input
              id="student-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
              placeholder="e.g. 9876543210"
            />
          </div>

          <div>
            <label htmlFor="student-address" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px]">Home Address</label>
            <input
              id="student-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
              placeholder="e.g. Imphal, Manipur"
            />
          </div>
        </div>

        <div>
          <label htmlFor="student-photo" className="block text-gray-700 uppercase tracking-wider mb-1 text-[10px] font-bold">Student Photo (Optional)</label>
          <div className="space-y-1.5">
            <input
              id="student-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
            />
            {photo && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[200px]">{photo.name}</span>
                </span>
                {compressionInfo && (
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-mono font-medium flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-indigo-600 animate-pulse" />
                    <span>{compressionInfo}</span>
                  </span>
                )}
              </div>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 font-mono">JPG, PNG, WEBP (Smartphone photos auto-compressed)</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Registering Student...</span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Enroll Student</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
