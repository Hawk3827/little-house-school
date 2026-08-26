'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  FileSpreadsheet, 
  UserCheck, 
  Clock, 
  Key, 
  DollarSign, 
  Users, 
  Megaphone, 
  Camera, 
  Database,
  Activity,
  CheckCircle2,
  Lock,
  ArrowUpDown
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  adminEmail: string;
  adminName: string;
  actionType: string;
  category: string;
  targetName?: string;
  description: string;
  createdAt: string;
}

export default function AdminAuditLogManagement() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessForbidden, setAccessForbidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [limit, setLimit] = useState('100');

  const fetchAuditLogs = async () => {
    setLoading(true);
    setAccessForbidden(false);
    try {
      const res = await fetch(`/api/admin/audit-log?category=${selectedCategory}&limit=${limit}`);
      if (res.status === 403) {
        setAccessForbidden(true);
        setLogs([]);
      } else if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [selectedCategory, limit]);

  if (accessForbidden) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-amber-200 text-center space-y-4 max-w-xl mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-3xl flex items-center justify-center mx-auto font-mono text-2xl font-bold">
          🔐
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          The <strong>Admin Audit & Change Log</strong> is exclusive to Master Administrator <strong>hawk3827@admin</strong>. Other staff admin accounts do not have permission to view change records.
        </p>
      </div>
    );
  }

  // Filter logs by search query
  const filteredLogs = logs.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.adminName.toLowerCase().includes(q) ||
      item.adminEmail.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.targetName && item.targetName.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Admin Name', 'Admin Email', 'Action Type', 'Category', 'Target / Subject', 'Description'];
    const rows = filteredLogs.map((l) => [
      l.id,
      new Date(l.createdAt).toLocaleString('en-IN'),
      `"${l.adminName}"`,
      `"${l.adminEmail}"`,
      l.actionType,
      l.category,
      `"${l.targetName || ''}"`,
      `"${l.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `admin_change_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'SECURITY':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">🔐 SECURITY</span>;
      case 'FEE_PAYMENT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">💰 FEE RECORD</span>;
      case 'STUDENT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-100 text-sky-800 border border-sky-200">🎓 STUDENT ROSTER</span>;
      case 'TEACHER':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">👨‍🏫 FACULTY</span>;
      case 'ANNOUNCEMENT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">📢 ANNOUNCEMENT</span>;
      case 'GALLERY':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">🖼️ GALLERY</span>;
      case 'BACKUP':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">💾 BACKUP</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">⚙️ SYSTEM</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/50 flex items-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>STAFF & ADMIN ACCOUNTABILITY</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Admin Change & Audit Records
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Real-time record of all administrative changes made by other admins, staff officers, and teachers across student rosters, fee payments, security settings, and announcements.
          </p>
        </div>

        <div className="flex items-center space-x-3 z-10">
          <button
            type="button"
            onClick={fetchAuditLogs}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs flex items-center space-x-2 backdrop-blur-md border border-white/10 transition shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs flex items-center space-x-2 transition shadow-md"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by admin name, email, or change details..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'All Changes' },
            { id: 'SECURITY', label: '🔐 Security' },
            { id: 'FEE_PAYMENT', label: '💰 Fee Records' },
            { id: 'STUDENT', label: '🎓 Students' },
            { id: 'ANNOUNCEMENT', label: '📢 Notices' },
            { id: 'GALLERY', label: '🖼️ Gallery' },
            { id: 'BACKUP', label: '💾 Backups' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-mono font-bold text-slate-700 uppercase">
              Showing {filteredLogs.length} Administrative Change Entries
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
            <span>Show:</span>
            {['50', '100', 'all'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLimit(l)}
                className={`px-2 py-0.5 rounded ${limit === l ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-100'}`}
              >
                {l === 'all' ? 'All' : l}
              </button>
            ))}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <ShieldCheck className="h-10 w-10 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-600">No administrative changes match your filter query.</p>
          </div>
        ) : (
          <div className="max-h-[650px] overflow-y-auto overflow-x-auto scroll-smooth">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-mono uppercase tracking-wider border-b border-slate-800 shadow-md">
                <tr>
                  <th className="py-3 px-4 bg-slate-900">Timestamp</th>
                  <th className="py-3 px-4 bg-slate-900">Admin Staff Member</th>
                  <th className="py-3 px-4 bg-slate-900">Category</th>
                  <th className="py-3 px-4 bg-slate-900">Target / Subject</th>
                  <th className="py-3 px-4 bg-slate-900">Exact Change Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium bg-white">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                        <span>{log.adminName}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">{log.adminEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getCategoryBadge(log.category)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {log.targetName || 'System Record'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium max-w-md">
                      <span className="leading-relaxed">{log.description}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
