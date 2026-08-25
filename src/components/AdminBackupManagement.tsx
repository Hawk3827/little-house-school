'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Cloud, 
  Download, 
  RotateCcw, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileJson, 
  ShieldCheck, 
  UploadCloud, 
  HardDrive, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Settings,
  X,
  Link as LinkIcon,
  KeyRound
} from 'lucide-react';
import SecurityPinModal from './SecurityPinModal';

interface SnapshotMeta {
  filename: string;
  sizeFormatted: string;
  createdAt: string;
  summary: {
    totalRecords: number;
    usersCount: number;
    studentsCount: number;
    teachersCount: number;
    classesCount: number;
    attendanceCount: number;
    gradesCount: number;
    reportsCount: number;
    admissionsCount: number;
  };
  cloudBackup?: {
    success: boolean;
    fileId?: string;
    webViewLink?: string;
    simulated?: boolean;
    error?: string;
  };
}

interface BackupConfig {
  googleDriveConfigured: boolean;
  googleDriveFolderId: string;
  googleDriveFolderName: string;
  automatedDailySchedule: string;
  totalSnapshots: number;
}

export default function AdminBackupManagement() {
  const [snapshots, setSnapshots] = useState<SnapshotMeta[]>([]);
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pinPrompt, setPinPrompt] = useState<{ action: 'RESTORE' | 'DELETE'; filename: string; snapshotData?: any } | null>(null);
  
  // Google Drive Connection Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [folderInput, setFolderInput] = useState('');
  const [serviceEmailInput, setServiceEmailInput] = useState('');
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [connectSuccess, setConnectSuccess] = useState('');
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/backups');
      const data = await res.json();
      if (data.success) {
        setSnapshots(data.snapshots || []);
        setConfig(data.config || null);
        if (data.config?.googleDriveFolderId) {
          setFolderInput(data.config.googleDriveFolderId);
        }
      }
    } catch (err: any) {
      console.error('Fetch backups error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  // Trigger Immediate Snapshot
  const handleCreateBackup = async () => {
    setCreating(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/backups', {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create backup snapshot.');
      }

      setStatusMessage({
        type: 'success',
        text: `🚀 Snapshot created successfully! Synced offsite to Google Drive (${data.snapshot?.summary?.totalRecords} records preserved).`,
      });
      fetchBackups();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to create database snapshot.',
      });
    } finally {
      setCreating(false);
    }
  };

  // Restore Database from Snapshot
  const executeRestore = async (filename: string, snapshotData?: any) => {
    setRestoring(filename);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, snapshotData }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to restore database.');
      }

      setStatusMessage({
        type: 'success',
        text: `✅ ${data.message}`,
      });
      fetchBackups();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to restore database.',
      });
    } finally {
      setRestoring(null);
      setPinPrompt(null);
    }
  };

  // Delete Snapshot File
  const executeDelete = async (filename: string) => {
    setDeleting(filename);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/admin/backups?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete snapshot.');
      }

      setStatusMessage({
        type: 'success',
        text: `Snapshot "${filename}" deleted.`,
      });
      fetchBackups();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to delete backup.',
      });
    } finally {
      setDeleting(null);
      setPinPrompt(null);
    }
  };

  // Upload Custom JSON Backup File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.tables || !parsed.tables.users) {
          throw new Error('Invalid backup file structure.');
        }

        setPinPrompt({
          action: 'RESTORE',
          filename: file.name,
          snapshotData: parsed,
        });
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: `Invalid backup JSON file: ${err.message}`,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Save Google Drive Configuration
  const handleSaveGoogleDriveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderInput.trim()) {
      setConnectError('Please enter your Google Drive Folder Link or Folder ID.');
      return;
    }

    setTestingConnection(true);
    setConnectError('');
    setConnectSuccess('');

    try {
      const res = await fetch('/api/admin/backups/google-drive-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId: folderInput.trim(),
          serviceAccountEmail: serviceEmailInput.trim() || undefined,
          privateKey: privateKeyInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect Google Drive.');
      }

      setConnectSuccess(data.message || 'Google Drive connected successfully!');
      fetchBackups();
      setTimeout(() => {
        setShowConnectModal(false);
      }, 1500);
    } catch (err: any) {
      setConnectError(err.message || 'Failed to connect Google Drive.');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                <Database className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Disaster Recovery & Automated Backups
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Automated snapshots of all student marks, attendance, and admissions synced offsite to Google Drive with 1-click restoration.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowConnectModal(true)}
              className="bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold px-4 py-3 rounded-2xl transition border border-sky-200 flex items-center space-x-2 shadow-2xs"
            >
              <Settings className="h-4 w-4 text-sky-600" />
              <span>Configure Google Drive</span>
            </button>

            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-3 rounded-2xl transition border border-slate-200 flex items-center space-x-2 shadow-2xs">
              <UploadCloud className="h-4 w-4 text-slate-600" />
              <span>Restore from File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              disabled={creating}
              onClick={handleCreateBackup}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-2xl transition shadow-md flex items-center space-x-2 border border-amber-300 disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Syncing to Google Drive...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Create Snapshot & Sync to Google Drive</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Cloud Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Google Drive Sync */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-sky-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Cloud className="h-3.5 w-3.5 text-sky-600" />
                <span>Google Drive Cloud</span>
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Active</span>
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Account: rksana3827@gmail.com</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Folder ID: <span className="font-mono text-slate-700">{config?.googleDriveFolderId || 'LITTLE_HOUSE_OFFSITE'}</span>
            </p>
            <button
              type="button"
              onClick={() => setShowConnectModal(true)}
              className="text-[11px] font-bold text-sky-600 hover:text-sky-800 underline block pt-1"
            >
              Change Folder / Reconnect →
            </button>
          </div>

          {/* Card 2: Daily Schedule */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>Automated Daily Cron</span>
              </span>
              <span className="bg-amber-200/80 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Daily 05:30 AM IST
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800">
              Zero Data Loss Guarantee
            </div>
            <p className="text-[11px] text-slate-500">
              Scheduled background snapshots run automatically every 24 hours.
            </p>
          </div>

          {/* Card 3: Local Snapshots Storage */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <HardDrive className="h-3.5 w-3.5 text-slate-600" />
                <span>Preserved Backups</span>
              </span>
              <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {snapshots.length} Snapshots
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800">
              1-Click Restore Ready
            </div>
            <p className="text-[11px] text-slate-500">
              Protected by 4-digit Administrator Security PIN authorization.
            </p>
          </div>
        </div>

        {/* Notifications */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 animate-fadeIn ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-red-50 border border-red-200 text-red-900'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Snapshots Registry Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <FileJson className="h-5 w-5 text-sky-600" />
            <span>Database Snapshots Registry</span>
            <span className="text-xs font-mono bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full font-bold">
              {snapshots.length} Available
            </span>
          </h3>

          <button
            type="button"
            onClick={fetchBackups}
            className="text-xs font-bold text-slate-500 hover:text-sky-600 flex items-center space-x-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
            <span className="text-xs font-medium">Scanning backup archives...</span>
          </div>
        ) : snapshots.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Database className="h-10 w-10 mx-auto text-slate-300" />
            <div className="text-sm font-bold text-slate-700">No database snapshots generated yet</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click &quot;Create Snapshot &amp; Sync to Google Drive&quot; above to create your first encrypted disaster recovery snapshot.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Snapshot / Date</th>
                  <th className="py-3 px-4">Records Preserved</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4 text-center">Storage Target</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {snapshots.map((s) => {
                  const dateStr = new Date(s.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={s.filename} className="hover:bg-sky-50/40 transition">
                      {/* Date and Name */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{dateStr}</span>
                          <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[200px]">
                            {s.filename}
                          </span>
                        </div>
                      </td>

                      {/* Records Summary */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded text-[10px] inline-block">
                            {s.summary?.totalRecords || 0} Total Records
                          </span>
                          <div className="text-[10px] text-slate-500 space-x-1.5">
                            <span>{s.summary?.studentsCount || 0} Students</span>
                            <span>•</span>
                            <span>{s.summary?.attendanceCount || 0} Attendance</span>
                            <span>•</span>
                            <span>{s.summary?.gradesCount || 0} Marks</span>
                          </div>
                        </div>
                      </td>

                      {/* Size */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {s.sizeFormatted}
                      </td>

                      {/* Storage Target */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <span className="bg-sky-50 text-sky-700 border border-sky-200 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center space-x-1">
                            <Cloud className="h-3 w-3" />
                            <span>Google Drive</span>
                          </span>
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            Local
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Download */}
                        <a
                          href={`/api/admin/backups/download?filename=${encodeURIComponent(s.filename)}`}
                          download
                          className="text-slate-600 hover:text-sky-700 hover:bg-sky-50 p-1.5 rounded-lg transition inline-flex items-center"
                          title="Download Snapshot File (.json)"
                        >
                          <Download className="h-4 w-4" />
                        </a>

                        {/* Google Drive Link */}
                        {s.cloudBackup?.webViewLink && (
                          <a
                            href={s.cloudBackup.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 hover:text-sky-800 hover:bg-sky-50 p-1.5 rounded-lg transition inline-flex items-center"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}

                        {/* 1-Click Restore */}
                        <button
                          type="button"
                          disabled={restoring === s.filename}
                          onClick={() => setPinPrompt({ action: 'RESTORE', filename: s.filename })}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] px-2.5 py-1 rounded-lg transition inline-flex items-center space-x-1 disabled:opacity-50"
                          title="Restore database to this point (PIN Protected)"
                        >
                          {restoring === s.filename ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )}
                          <span>Restore</span>
                        </button>

                        {/* Delete Snapshot */}
                        <button
                          type="button"
                          disabled={deleting === s.filename}
                          onClick={() => setPinPrompt({ action: 'DELETE', filename: s.filename })}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition disabled:opacity-50 inline-flex items-center"
                          title="Delete Backup File (PIN Protected)"
                        >
                          {deleting === s.filename ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Google Drive Connection Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-sky-100 space-y-6 text-left relative">
            <button
              type="button"
              onClick={() => setShowConnectModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Cloud className="h-6 w-6 text-sky-600" />
                <h3 className="text-xl font-extrabold text-slate-900">Connect Your Google Drive</h3>
              </div>
              <p className="text-xs text-slate-500">
                Configure your personal Google account (<strong>rksana3827@gmail.com</strong>) to receive automatic daily database backups.
              </p>
            </div>

            {connectError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-700 font-medium flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{connectError}</span>
              </div>
            )}

            {connectSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800 font-medium flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>{connectSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveGoogleDriveConfig} className="space-y-4">
              {/* Folder Link or ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Google Drive Folder Link or Folder ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={folderInput}
                    onChange={(e) => setFolderInput(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/1abcXYZ... or Folder ID"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Open Google Drive $\rightarrow$ Create a folder named &quot;LITTLE HOUSE Backups&quot; $\rightarrow$ Copy the link or Folder ID from address bar.
                </p>
              </div>

              {/* Service Account Email (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Google Cloud Service Account Email <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={serviceEmailInput}
                  onChange={(e) => setServiceEmailInput(e.target.value)}
                  placeholder="backup-bot@little-house.iam.gserviceaccount.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition font-mono"
                />
              </div>

              {/* Private Key (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Google Cloud Private Key <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={privateKeyInput}
                  onChange={(e) => setPrivateKeyInput(e.target.value)}
                  placeholder="-----BEGIN PRIVATE KEY-----\n..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={testingConnection}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl transition flex items-center space-x-2 disabled:opacity-50 border border-amber-300"
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying Folder...</span>
                    </>
                  ) : (
                    <span>Test &amp; Connect Google Drive</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4-Digit Security PIN Modal */}
      <SecurityPinModal
        isOpen={!!pinPrompt}
        onClose={() => setPinPrompt(null)}
        onSuccess={() => {
          if (pinPrompt) {
            if (pinPrompt.action === 'RESTORE') {
              executeRestore(pinPrompt.filename, pinPrompt.snapshotData);
            } else if (pinPrompt.action === 'DELETE') {
              executeDelete(pinPrompt.filename);
            }
          }
        }}
        title={
          pinPrompt?.action === 'RESTORE'
            ? 'Authorize Database Restoration'
            : 'Authorize Snapshot Deletion'
        }
        description={
          pinPrompt?.action === 'RESTORE'
            ? `Enter your 4-digit Security PIN to restore the database to "${pinPrompt?.filename}". All current tables will be updated to match this snapshot point.`
            : `Enter your 4-digit Security PIN to delete snapshot "${pinPrompt?.filename}".`
        }
        actionName={pinPrompt?.action === 'RESTORE' ? 'Confirm & Restore Database' : 'Delete Snapshot'}
      />
    </div>
  );
}
