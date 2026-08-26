'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Smartphone, 
  Monitor, 
  Tablet, 
  MapPin, 
  Clock, 
  Eye, 
  TrendingUp, 
  Activity, 
  Loader2, 
  Globe, 
  Repeat, 
  Calendar, 
  Filter,
  RefreshCw,
  FileText,
  X,
  Trash2
} from 'lucide-react';

interface AnalyticsSummary {
  totalVisitors: number;
  totalPageviews: number;
  todayVisitors: number;
  avgDurationSeconds: number;
  avgDurationFormatted: string;
}

interface DeviceBreakdown {
  type: string;
  count: number;
  percentage: number;
}

interface LocationItem {
  city: string;
  region: string;
  country: string;
  count: number;
  pageviewsCount?: number;
  percentage: number;
}

interface PageItem {
  path: string;
  title: string;
  views: number;
  avgDurationSecs: number;
  percentage: number;
}

interface RecentActivity {
  id: string;
  sessionId: string;
  location: string;
  deviceType: string;
  deviceOs: string;
  browser: string;
  pagePath: string;
  pageTitle: string;
  durationSeconds: number;
  visitCount: number;
  isNewVisitor: boolean;
  createdAt: string;
}

export default function AdminAnalyticsManagement() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceBreakdown[]>([]);
  const [osCounts, setOsCounts] = useState<Record<string, number>>({});
  const [browserCounts, setBrowserCounts] = useState<Record<string, number>>({});
  const [locationBreakdown, setLocationBreakdown] = useState<LocationItem[]>([]);
  const [frequencyCounts, setFrequencyCounts] = useState<{ firstTime: number; returning2to3: number; frequent4to10: number; loyal10Plus: number }>({
    firstTime: 0,
    returning2to3: 0,
    frequent4to10: 0,
    loyal10Plus: 0,
  });
  const [popularPages, setPopularPages] = useState<PageItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Date, Month & Limit Filter State
  const [filterPreset, setFilterPreset] = useState<'ALL_TIME' | 'TODAY' | 'YESTERDAY' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM'>('ALL_TIME');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hitLimit, setHitLimit] = useState<string>('500');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('limit', hitLimit);

      if (filterPreset !== 'CUSTOM') {
        params.append('preset', filterPreset);
      } else {
        if (selectedMonth) params.append('month', selectedMonth);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
      }

      const res = await fetch(`/api/admin/analytics?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary || null);
        setDeviceBreakdown(data.deviceBreakdown || []);
        setOsCounts(data.osCounts || {});
        setBrowserCounts(data.browserCounts || {});
        setLocationBreakdown(data.locationBreakdown || []);
        setFrequencyCounts(data.frequencyCounts || { firstTime: 0, returning2to3: 0, frequent4to10: 0, loyal10Plus: 0 });
        setPopularPages(data.popularPages || []);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [filterPreset, selectedMonth, startDate, endDate, hitLimit]);

  const handleResetFilters = () => {
    setFilterPreset('ALL_TIME');
    setSelectedMonth('');
    setStartDate('');
    setEndDate('');
  };

  const [purging, setPurging] = useState(false);

  const handlePurgeOldAnalytics = async () => {
    if (!confirm('Are you sure you want to delete all visitor analytics records older than 2 days (48 hours)?')) {
      return;
    }

    try {
      setPurging(true);
      const res = await fetch('/api/admin/analytics/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 2 }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Analytics older than 2 days successfully purged!');
        fetchAnalyticsData();
      } else {
        alert(data.error || 'Failed to purge analytics.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred while purging analytics.');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-6 text-left select-none">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-950 text-white p-6 sm:p-8 rounded-[32px] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full uppercase">
            REAL-TIME WEBSITE TELEMETRY & TRAFFIC ENGINE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Website Traffic & Visitor Analytics
          </h2>
          <p className="text-xs text-sky-200/90 max-w-xl leading-relaxed">
            Track visitor volume, session duration, device types, return frequency, and geographic locations in real-time. Automated 2-day data retention actively purges logs older than 48 hours.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <button
            onClick={handlePurgeOldAnalytics}
            disabled={purging}
            title="Delete all analytics logs older than 2 days (48 hours)"
            className="px-3.5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold text-xs rounded-2xl transition flex items-center space-x-1.5 backdrop-blur-sm disabled:opacity-50"
          >
            {purging ? <Loader2 className="h-4 w-4 animate-spin text-rose-300" /> : <Trash2 className="h-4 w-4 text-rose-300" />}
            <span>{purging ? 'Purging...' : 'Purge >2 Days'}</span>
          </button>

          <button
            onClick={fetchAnalyticsData}
            disabled={loading}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-2xl transition flex items-center space-x-1.5 shadow-lg active:scale-95 border border-amber-300 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : <Activity className="h-4 w-4 text-slate-950" />}
            <span>{loading ? 'Refreshing...' : 'Refresh Live Traffic'}</span>
          </button>
        </div>
      </div>

      {/* DATE & MONTH RANGE FILTER TOOLBAR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-sky-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-sky-600" />
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Filter Traffic by Date & Month:</span>
          </div>

          {(filterPreset !== 'ALL_TIME' || selectedMonth || startDate || endDate) && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1 self-start sm:self-auto bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition"
            >
              <X className="h-3 w-3" />
              <span>Reset Date Filters</span>
            </button>
          )}
        </div>

        {/* Filter Presets Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          <button
            type="button"
            onClick={() => { setFilterPreset('ALL_TIME'); setSelectedMonth(''); setStartDate(''); setEndDate(''); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 flex-shrink-0 border ${
              filterPreset === 'ALL_TIME'
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>🌐 All Time</span>
          </button>

          <button
            type="button"
            onClick={() => { setFilterPreset('TODAY'); setSelectedMonth(''); setStartDate(''); setEndDate(''); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 flex-shrink-0 border ${
              filterPreset === 'TODAY'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>⚡ Today</span>
          </button>

          <button
            type="button"
            onClick={() => { setFilterPreset('YESTERDAY'); setSelectedMonth(''); setStartDate(''); setEndDate(''); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 flex-shrink-0 border ${
              filterPreset === 'YESTERDAY'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>📆 Yesterday</span>
          </button>

          <button
            type="button"
            onClick={() => { setFilterPreset('THIS_MONTH'); setSelectedMonth(''); setStartDate(''); setEndDate(''); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 flex-shrink-0 border ${
              filterPreset === 'THIS_MONTH'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>🗓️ This Month</span>
          </button>

          <button
            type="button"
            onClick={() => { setFilterPreset('LAST_MONTH'); setSelectedMonth(''); setStartDate(''); setEndDate(''); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 flex-shrink-0 border ${
              filterPreset === 'LAST_MONTH'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>📅 Last Month</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterPreset('CUSTOM')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 flex-shrink-0 border ${
              filterPreset === 'CUSTOM'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>📅 Custom Date & Month</span>
          </button>
        </div>

        {/* Custom Month / Date Picker Panel */}
        {filterPreset === 'CUSTOM' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            {/* Select Specific Month */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Select Specific Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setStartDate('');
                  setEndDate('');
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSelectedMonth('');
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSelectedMonth('');
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Visitors */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Unique Visitors</span>
            <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {summary ? summary.totalVisitors.toLocaleString('en-IN') : '0'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Unique visitor sessions tracked</p>
          </div>
        </div>

        {/* Card 2: Today's Visitors */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Today&apos;s Active Visitors</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {summary ? summary.todayVisitors.toLocaleString('en-IN') : '0'}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Visited website in past 24 hours</p>
          </div>
        </div>

        {/* Card 3: Avg Session Duration */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-wider">Avg Session Duration</span>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {summary ? summary.avgDurationFormatted : '0s'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Time spent exploring website per visit</p>
          </div>
        </div>

        {/* Card 4: Total Pageviews */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wider">Total Pageviews</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Eye className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {summary ? summary.totalPageviews.toLocaleString('en-IN') : '0'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Total page hits across all sections</p>
          </div>
        </div>
      </div>

      {/* Row 2: Device Breakdown & Location Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Device & System Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded uppercase">
                HARDWARE & BROWSER SPECS
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">Device & Browser Breakdown</h3>
            </div>
            <Smartphone className="h-5 w-5 text-sky-600" />
          </div>

          <div className="space-y-4">
            {/* Device Types */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Device Type:</span>
              <div className="grid grid-cols-3 gap-3">
                {deviceBreakdown.map((d) => (
                  <div key={d.type} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center space-x-1">
                        {d.type === 'Mobile' ? <Smartphone className="h-3.5 w-3.5 text-sky-600" /> : d.type === 'Desktop' ? <Monitor className="h-3.5 w-3.5 text-purple-600" /> : <Tablet className="h-3.5 w-3.5 text-amber-600" />}
                        <span>{d.type}</span>
                      </span>
                      <span className="font-bold text-slate-900">{d.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${d.type === 'Mobile' ? 'bg-sky-500' : d.type === 'Desktop' ? 'bg-purple-500' : 'bg-amber-500'}`}
                        style={{ width: `${d.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operating Systems & Browsers */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Operating Systems:</span>
                <div className="space-y-1.5">
                  {Object.entries(osCounts).map(([os, count]) => (
                    <div key={os} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl text-slate-700 font-medium">
                      <span>{os}</span>
                      <span className="font-mono font-bold text-slate-900">{count} hits</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Web Browsers:</span>
                <div className="space-y-1.5">
                  {Object.entries(browserCounts).map(([b, count]) => (
                    <div key={b} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl text-slate-700 font-medium">
                      <span>{b}</span>
                      <span className="font-mono font-bold text-slate-900">{count} hits</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Location Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                GEOGRAPHIC LOCATION RADAR
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">Visitor Location Breakdown</h3>
            </div>
            <MapPin className="h-5 w-5 text-emerald-600" />
          </div>

          {locationBreakdown.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Globe className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Waiting for location telemetry...</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scroll-smooth">
              {locationBreakdown.map((l, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-mono font-extrabold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">{l.city}, {l.region}</div>
                      <span className="text-[10px] font-mono text-slate-500">{l.country}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-xs text-emerald-700">{l.count} {l.count === 1 ? 'Visitor' : 'Visitors'}</span>
                    <div className="text-[10px] font-mono text-slate-500">{l.pageviewsCount || l.count} Pageviews ({l.percentage}%)</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Visit Frequency & Most Popular Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Return Visitor Loyalty / Frequency */}
        <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded uppercase">
                VISIT FREQUENCY & LOYALTY
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">Visitor Return Frequency</h3>
            </div>
            <Repeat className="h-5 w-5 text-purple-600" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-sky-800 uppercase">First-Time Visitors (1x)</span>
              <div className="text-2xl font-black text-slate-900">{frequencyCounts.firstTime}</div>
              <p className="text-[10px] text-slate-500">First time visiting school website</p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">Returning Visitors (2-3x)</span>
              <div className="text-2xl font-black text-slate-900">{frequencyCounts.returning2to3}</div>
              <p className="text-[10px] text-slate-500">Returned 2 to 3 times</p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-800 uppercase">Frequent Visitors (4-10x)</span>
              <div className="text-2xl font-black text-slate-900">{frequencyCounts.frequent4to10}</div>
              <p className="text-[10px] text-slate-500">Returned 4 to 10 times</p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-purple-800 uppercase">Loyal Parents / Staff (10x+)</span>
              <div className="text-2xl font-black text-slate-900">{frequencyCounts.loyal10Plus}</div>
              <p className="text-[10px] text-slate-500">Frequent portal & fee users</p>
            </div>
          </div>
        </div>

        {/* Most Popular Pages Ranking */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded uppercase">
                PAGE TRAFFIC RANKING
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">Most Visited Pages</h3>
            </div>
            <FileText className="h-5 w-5 text-amber-600" />
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scroll-smooth">
            {popularPages.map((pg, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-extrabold text-xs text-slate-900 flex items-center space-x-2">
                    <span className="font-mono text-amber-600 font-black">#{idx + 1}</span>
                    <span>{pg.path}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{pg.title}</span>
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-xs text-slate-900">{pg.views} Pageviews</span>
                  <div className="text-[10px] font-mono text-emerald-700">Avg {pg.avgDurationSecs}s spent</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Real-Time Live Activity Log Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded uppercase">
              REAL-TIME TRAFFIC FEED
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">Live Visitor Telemetry Feed</h3>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs self-start sm:self-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Show History:</span>
            {(['100', '250', '500', 'all'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setHitLimit(l)}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-xl transition ${
                  hitLimit === l
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {l === 'all' ? '⚡ All Hits' : `${l} Hits`}
              </button>
            ))}
          </div>
        </div>

        {recentActivity.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Activity className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium">No visitor activity recorded for selected date filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="max-h-[650px] overflow-y-auto overflow-x-auto rounded-2xl border border-slate-200 scroll-smooth">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-mono uppercase tracking-wider border-b border-slate-800 shadow-md">
                  <tr>
                    <th className="py-3 px-4 bg-slate-900">Timestamp</th>
                    <th className="py-3 px-4 bg-slate-900">Location</th>
                    <th className="py-3 px-4 bg-slate-900">Device & OS</th>
                    <th className="py-3 px-4 bg-slate-900">Browser</th>
                    <th className="py-3 px-4 bg-slate-900">Page Visited</th>
                    <th className="py-3 px-4 bg-slate-900">Duration Spent</th>
                    <th className="py-3 px-4 bg-slate-900">Visit Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium bg-white">
                  {recentActivity.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-slate-900 flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{a.location}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{a.deviceType} ({a.deviceOs})</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {a.browser}
                      </td>
                      <td className="py-3 px-4 font-mono text-sky-800 font-bold whitespace-nowrap">
                        {a.pagePath}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700 whitespace-nowrap">
                        {a.durationSeconds}s
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${a.visitCount > 1 ? 'bg-purple-100 text-purple-800' : 'bg-sky-100 text-sky-800'}`}>
                          {a.visitCount > 1 ? `${a.visitCount}x Return` : '1st Visit'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1 pt-1">
              <span>Showing <strong>{recentActivity.length}</strong> recent visitor log entries</span>
              <span>👇 Scroll inside table to view older visitor history</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
