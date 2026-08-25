'use client';

import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  Tag, 
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  Film,
  Play,
  Link as LinkIcon,
  Video,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import GalleryPhotoLightbox from '@/components/GalleryPhotoLightbox';
import { validateAndProcessUpload } from '@/lib/fileValidationAndCompression';

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  mediaType?: string | null; // 'PHOTO' | 'VIDEO'
  videoUrl?: string | null;
  category?: string | null;
  description?: string | null;
  createdAt: Date | string;
}

interface AdminGalleryManagementProps {
  initialItems: GalleryItem[];
}

export default function AdminGalleryManagement({ initialItems }: AdminGalleryManagementProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [mediaType, setMediaType] = useState<'PHOTO' | 'VIDEO'>('PHOTO');
  const [videoSourceType, setVideoSourceType] = useState<'FILE' | 'LINK'>('FILE');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Campus Events');
  const [description, setDescription] = useState('');
  const [videoLink, setVideoLink] = useState('');
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Lightbox preview state
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const categories = [
    'Campus Events',
    'Sports & Athletics',
    'Classrooms & Academics',
    'Cultural Celebrations',
    'Infrastructure & Facilities',
    'Art & Creative Work'
  ];

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setProcessingPhoto(true);

    try {
      const result = await validateAndProcessUpload(file, {
        allowedTypes: ['image'],
        maxDimension: 1920,
        quality: 0.82
      });

      if ('error' in result) {
        setErrorMsg(result.error);
        if (photoInputRef.current) photoInputRef.current.value = '';
        return;
      }

      setPhotoFile(result.file);
      setPhotoPreview(result.previewUrl);

      if (result.compressionRatio) {
        setCompressionInfo(`Optimized: ${(result.originalSize / 1024 / 1024).toFixed(1)}MB → ${(result.compressedSize / 1024).toFixed(0)}KB (${result.compressionRatio})`);
      } else {
        setCompressionInfo(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error selecting photo.');
    } finally {
      setProcessingPhoto(false);
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');

    const result = await validateAndProcessUpload(file, {
      allowedTypes: ['video'],
      maxSizeMB: 100
    });

    if ('error' in result) {
      setErrorMsg(result.error);
      if (videoInputRef.current) videoInputRef.current.value = '';
      return;
    }

    setVideoFile(result.file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please provide a title for the media item.');
      return;
    }

    if (mediaType === 'PHOTO' && !photoFile) {
      setErrorMsg('Please select a photo to upload.');
      return;
    }

    if (mediaType === 'VIDEO') {
      if (videoSourceType === 'FILE' && !videoFile) {
        setErrorMsg('Please select a video file to upload.');
        return;
      }
      if (videoSourceType === 'LINK' && !videoLink.trim()) {
        setErrorMsg('Please provide a valid YouTube or video link.');
        return;
      }
    }

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('mediaType', mediaType);

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      if (mediaType === 'VIDEO') {
        if (videoSourceType === 'FILE' && videoFile) {
          formData.append('video', videoFile);
        } else if (videoSourceType === 'LINK') {
          formData.append('videoLink', videoLink);
        }
      }

      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload media');
      }

      setItems([data.item, ...items]);
      setSuccessMsg(`${mediaType === 'VIDEO' ? 'Video' : 'Photo'} published successfully to the school gallery!`);
      setTitle('');
      setDescription('');
      setVideoLink('');
      setPhotoFile(null);
      setPhotoPreview(null);
      setVideoFile(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading media');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${itemTitle}" from the public gallery?`)) {
      return;
    }

    setDeletingId(id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete media');
      }

      setItems(items.filter(item => item.id !== id));
      setSuccessMsg('Media item removed from the gallery.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting media');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Lightbox for zooming / video playback */}
      {lightboxItem && (
        <GalleryPhotoLightbox
          isOpen={true}
          photoUrl={lightboxItem.imageUrl}
          mediaType={lightboxItem.mediaType || 'PHOTO'}
          videoUrl={lightboxItem.videoUrl}
          title={lightboxItem.title}
          category={lightboxItem.category}
          description={lightboxItem.description}
          date={lightboxItem.createdAt}
          onClose={() => setLightboxItem(null)}
        />
      )}

      {/* Upload Form Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Camera className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Upload Photo or Video to Website Gallery</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Photos and videos uploaded here will immediately appear on the public <Link href="/gallery" target="_blank" className="text-indigo-600 font-semibold hover:underline inline-flex items-center space-x-0.5"><span>Campus Life Gallery</span><ExternalLink className="h-3 w-3 inline ml-0.5" /></Link> webpage.
            </p>
          </div>

          <Link
            href="/gallery"
            target="_blank"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition self-start sm:self-auto"
          >
            <span>View Live Webpage</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Media Type Selector Tabs */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setMediaType('PHOTO')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
              mediaType === 'PHOTO'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setMediaType('VIDEO')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
              mediaType === 'VIDEO'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Film className="h-4 w-4 text-amber-300" />
            <span>Upload Video / Reel</span>
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs text-red-700 font-medium flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 border border-green-200 p-3.5 rounded-xl text-xs text-green-700 font-medium flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {mediaType === 'VIDEO' ? 'Video Title *' : 'Photo Title *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={mediaType === 'VIDEO' ? 'e.g. Annual Day Dance Performance & Highlights' : 'e.g. Annual Sports Meet 2026 Celebration'}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Caption / Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Glimpses of students celebrating our annual cultural exhibition and achievements."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
            />
          </div>

          {/* VIDEO SPECIFIC INPUTS */}
          {mediaType === 'VIDEO' ? (
            <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-4">
              <div className="flex items-center space-x-3 text-xs font-bold text-gray-700">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="videoSource"
                    checked={videoSourceType === 'FILE'}
                    onChange={() => setVideoSourceType('FILE')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Upload Video File (MP4, MOV, WebM)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="videoSource"
                    checked={videoSourceType === 'LINK'}
                    onChange={() => setVideoSourceType('LINK')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>YouTube / Stream Video Link</span>
                </label>
              </div>

              {videoSourceType === 'FILE' ? (
                <div>
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="hidden"
                    id="admin-video-file-input"
                  />
                  <label
                    htmlFor="admin-video-file-input"
                    className="cursor-pointer inline-flex items-center space-x-2 bg-white hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-indigo-500 px-5 py-3 rounded-2xl text-xs font-bold text-gray-700 transition"
                  >
                    <Video className="h-4 w-4 text-indigo-600" />
                    <span>{videoFile ? 'Change Video File' : 'Browse Video File to Upload'}</span>
                  </label>

                  {videoFile && (
                    <span className="ml-3 text-xs text-gray-700 font-mono">
                      {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-800"
                  />
                </div>
              )}

              {/* Optional Poster Thumbnail Upload for Video */}
              <div className="pt-3 border-t border-gray-200">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  Optional Video Cover Poster (JPG/PNG/WEBP)
                </label>
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoSelect}
                  className="text-xs text-gray-600"
                />
              </div>
            </div>
          ) : (
            /* PHOTO SPECIFIC INPUT */
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Select Photo to Publish *
              </label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  id="gallery-photo-input"
                />

                <label
                  htmlFor="gallery-photo-input"
                  className="cursor-pointer inline-flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-indigo-500 px-5 py-3 rounded-2xl text-xs font-bold text-gray-700 transition"
                >
                  <Upload className="h-4 w-4 text-indigo-600" />
                  <span>{processingPhoto ? 'Compressing Photo...' : (photoFile ? 'Choose Different Image' : 'Browse / Upload Image')}</span>
                </label>

                {photoFile && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs text-gray-600 font-mono">
                      {photoFile.name} ({(photoFile.size / 1024).toFixed(0)} KB)
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
              <p className="text-[10px] text-gray-400 mt-1 font-mono">Supported formats: JPG, PNG, WEBP (Smartphone 50MP photos auto-compressed)</p>

              {/* Live Thumbnail Preview */}
              {photoPreview && (
                <div className="mt-4 relative inline-block rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={photoPreview}
                    alt="Upload Preview"
                    className="h-40 w-auto object-cover rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      setCompressionInfo(null);
                      if (photoInputRef.current) photoInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition"
                    title="Remove chosen image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Publishing {mediaType === 'VIDEO' ? 'Video' : 'Photo'} to Gallery...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Publish {mediaType === 'VIDEO' ? 'Video' : 'Photo'} to Gallery</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Existing Gallery Roster */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Published School Gallery Items</h3>
            <p className="text-xs text-gray-500 mt-1">
              Currently displaying {items.length} item{items.length !== 1 ? 's' : ''} on the live website.
            </p>
          </div>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
            {items.length} Live Items
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <ImageIcon className="h-10 w-10 text-gray-400 mx-auto" />
            <h4 className="text-sm font-bold text-gray-700">No Media Uploaded Yet</h4>
            <p className="text-xs text-gray-400">Use the form above to upload your first school photo or video.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item) => {
              const isItemVideo = item.mediaType === 'VIDEO';

              return (
                <div 
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  {/* Media Thumbnail */}
                  <div className="relative h-48 bg-gray-900 overflow-hidden">
                    <img
                      src={item.imageUrl || '/hero-bg.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    
                    {/* Category & Media Badge */}
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      {isItemVideo ? (
                        <span className="text-[9px] font-bold text-amber-300 bg-black/80 backdrop-blur-xs border border-amber-500/40 px-2.5 py-0.5 rounded-full uppercase flex items-center space-x-1">
                          <Play className="h-2.5 w-2.5 fill-amber-300" />
                          <span>VIDEO</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-indigo-300 bg-black/80 backdrop-blur-xs border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase">
                          {item.category || 'PHOTO'}
                        </span>
                      )}
                    </div>

                    {/* Centered Play overlay for videos */}
                    {isItemVideo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="h-12 w-12 rounded-full bg-black/60 border border-amber-400/80 text-amber-300 flex items-center justify-center pl-0.5 group-hover:scale-110 transition">
                          <Play className="h-5 w-5 fill-current" />
                        </div>
                      </div>
                    )}

                    {/* Zoom / Play Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setLightboxItem(item)}
                      className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition bg-black/40"
                      title={isItemVideo ? 'Play video full screen' : 'View photo full screen'}
                    >
                      <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40">
                        {isItemVideo ? <Play className="h-5 w-5 fill-white" /> : <Eye className="h-5 w-5" />}
                      </div>
                    </button>
                  </div>

                  {/* Details & Delete */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm tracking-tight line-clamp-1">{item.title}</h4>
                      {item.description ? (
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1 font-light leading-relaxed">{item.description}</p>
                      ) : (
                        <p className="text-xs text-gray-400 italic mt-1">No description provided</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                      <span>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      
                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item.id, item.title)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition flex items-center space-x-1 font-semibold"
                        title="Delete item"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
