'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, Loader2, CheckCircle2, Upload, FileText, X, Sparkles, Image as ImageIcon, Zap } from 'lucide-react';
import { validateAndProcessUpload } from '@/lib/fileValidationAndCompression';

interface ClassItem {
  id: string;
  name: string;
}

export default function AdminAnnouncementForm({ classes }: { classes: ClassItem[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('ALL');
  const [classId, setClassId] = useState('');
  const [isTicker, setIsTicker] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [processingPhoto, setProcessingPhoto] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setProcessingPhoto(true);

    try {
      const result = await validateAndProcessUpload(file, {
        allowedTypes: ['image'],
        maxDimension: 1920,
        quality: 0.82
      });

      if ('error' in result) {
        setError(result.error);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setPhoto(result.file);
      setPhotoPreview(result.previewUrl);

      if (result.compressionRatio) {
        setCompressionInfo(`Auto-compressed from ${(result.originalSize / 1024 / 1024).toFixed(1)}MB to ${(result.compressedSize / 1024).toFixed(0)}KB (${result.compressionRatio}) for instant upload.`);
      } else {
        setCompressionInfo(null);
      }

      // Auto-populate a default title if empty
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    } catch (err: any) {
      setError(err.message || 'Error processing photo.');
    } finally {
      setProcessingPhoto(false);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setCompressionInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a short title for the moving line.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      // Short default content referencing the scanned notice
      formData.append('content', `Official scanned notice: ${title.trim()}`);
      formData.append('audience', audience);
      formData.append('isTicker', isTicker ? 'true' : 'false');
      formData.append('isPinned', isPinned ? 'true' : 'false');
      if (audience === 'STUDENTS' && classId) {
        formData.append('classId', classId);
      }
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload scanned notice.');
      }

      setSuccess(true);
      setTitle('');
      setAudience('ALL');
      setClassId('');
      setIsTicker(true);
      removePhoto();
      
      // Refresh the server data
      router.refresh();
      
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <span>Upload Scanned Notice / Circular</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Upload the scanned paper circular and type a short summary to show on the moving line.
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
          HOMEPAGE TICKER
        </span>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center space-x-2 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span>Scanned notice uploaded! It is now live on the homepage moving line.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-xs text-red-700 rounded-r-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Upload Scanned Document Photo */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            1. Upload Scanned Paper Notice / Circular Photo <span className="text-indigo-600 font-bold">*</span>
          </label>
          <p className="text-[11px] text-gray-500 font-light">
            Upload a photo or scanned copy of the official signed school notice (.jpg, .png, .webp).
          </p>

          {photoPreview ? (
            <div className="relative rounded-2xl border-2 border-indigo-200 p-3 bg-indigo-50/40 flex items-center space-x-4">
              <img
                src={photoPreview}
                alt="Notice Preview"
                className="h-28 w-28 object-contain rounded-xl border border-gray-200 shadow-md bg-white"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <span className="text-xs font-bold text-gray-900 truncate block">{photo?.name}</span>
                <span className="text-[11px] text-gray-500 font-mono block">
                  {photo?.size ? (photo.size / 1024).toFixed(1) + ' KB' : ''}
                </span>
                {compressionInfo && (
                  <span className="text-[10px] text-indigo-700 bg-indigo-100/70 border border-indigo-200 px-2 py-0.5 rounded-md font-semibold flex items-center space-x-1 w-fit">
                    <Zap className="h-3 w-3 text-indigo-600 animate-pulse" />
                    <span>{compressionInfo}</span>
                  </span>
                )}
                <span className="text-[10px] text-green-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Scanned notice ready to publish</span>
                </span>
              </div>
              <button
                type="button"
                onClick={removePhoto}
                className="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 transition"
                title="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition bg-gray-50/50 hover:bg-indigo-50/30 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3.5 bg-white group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 rounded-2xl shadow-sm border border-gray-100 transition">
                  <Upload className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-gray-800 group-hover:text-indigo-600">
                  {processingPhoto ? 'Optimizing & Compressing Photo...' : 'Click to select scanned notice photo / document image'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Standard formats: JPG, PNG, WEBP (Smartphone photos auto-compressed)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Short Summary / Moving Line Headline */}
        <div>
          <label htmlFor="ann-title" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            2. Short Notice Text for Moving Line <span className="text-indigo-600 font-bold">*</span>
          </label>
          <input
            id="ann-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-900"
            placeholder="e.g. Annual Sports Meet Schedule 2026 (Press to see full notice)"
          />
          <p className="text-[11px] text-gray-400 mt-1 font-light">
            This short text will roll across the moving line on the homepage.
          </p>
        </div>

        {/* Step 3: Audience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
          <div>
            <label htmlFor="ann-audience" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Audience Category
            </label>
            <select
              id="ann-audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="ALL">Everyone (Public & Homepage Ticker)</option>
              <option value="PARENTS">Parents Only</option>
              <option value="TEACHERS">Teachers Only</option>
              <option value="STUDENTS">Students Only</option>
            </select>
          </div>

          {audience === 'STUDENTS' && (
            <div>
              <label htmlFor="ann-class" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Specific Class (Optional)
              </label>
              <select
                id="ann-class"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Moving line checkbox & Pinned notice checkbox */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl">
            <input
              id="ticker-checkbox"
              type="checkbox"
              checked={isTicker}
              onChange={(e) => setIsTicker(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="ticker-checkbox" className="text-xs font-bold text-indigo-900 cursor-pointer select-none">
              Show on Homepage Moving Flash Line (Marquee)
            </label>
          </div>

          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
            <div className="flex items-center space-x-2.5">
              <span className="text-amber-600 font-bold text-sm">📌</span>
              <div>
                <label htmlFor="pin-checkbox" className="text-xs font-bold text-amber-950 cursor-pointer select-none block">
                  Pin Statically to Notice Bar (Without Moving)
                </label>
                <span className="text-[10px] text-amber-700 font-normal block">
                  Locks this notice fixed on the left while other notices continue scrolling beside it.
                </span>
              </div>
            </div>
            <input
              id="pin-checkbox"
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-amber-300 rounded cursor-pointer flex-shrink-0 ml-3"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl text-xs transition shadow-md disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading Scanned Notice...</span>
            </>
          ) : (
            <span>Publish Scanned Notice to Moving Line</span>
          )}
        </button>
      </form>
    </div>
  );
}
