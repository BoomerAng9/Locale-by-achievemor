/**
 * System Logs Viewer Component
 * Real-time view of the "Nervous System" audit trail
 */

import React, { useState, useEffect } from 'react';
import { getRecentLogs } from '../../lib/firestore/logger';
import type { SystemLog, LogSource, LogSeverity } from '../../lib/firestore/schema';

const SEVERITY_COLORS: Record<LogSeverity, string> = {
  debug: 'text-gray-500',
  info: 'text-locale-blue',
  warn: 'text-yellow-500',
  error: 'text-red-500',
  critical: 'text-red-600 font-bold',
};

const SOURCE_ICONS: Record<LogSource, string> = {
  stripe: '💳',
  auth: '🔐',
  admin: '⚙️',
  verification: '✅',
  ai: '🤖',
  system: '🖥️',
};

interface SystemLogsViewerProps {
  maxLogs?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const SystemLogsViewer: React.FC<SystemLogsViewerProps> = ({
  maxLogs = 50,
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LogSource | 'all'>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const filterSource = filter === 'all' ? undefined : filter;
      const data = await getRecentLogs(filterSource, maxLogs);
      setLogs(data);
      setError(null);
    } catch (err) {
      console.error('[SystemLogs] Fetch error:', err);
      setError('Failed to load system logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    if (autoRefresh) {
      const interval = setInterval(fetchLogs, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [filter, maxLogs, autoRefresh, refreshInterval]);

  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date);
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-carbon-900 rounded-2xl border border-carbon-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-carbon-700 bg-carbon-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-locale-blue/20 flex items-center justify-center">
            <span className="text-lg">📋</span>
          </div>
          <div>
            <h3 className="text-white font-bold">System Logs</h3>
            <p className="text-xs text-gray-500">Nervous System Audit Trail</p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as LogSource | 'all')}
            className="bg-carbon-900 border border-carbon-600 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-locale-blue"
          >
            <option value="all">All Sources</option>
            <option value="stripe">💳 Stripe</option>
            <option value="auth">🔐 Auth</option>
            <option value="verification">✅ Verification</option>
            <option value="ai">🤖 AI</option>
            <option value="admin">⚙️ Admin</option>
            <option value="system">🖥️ System</option>
          </select>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 bg-carbon-700 hover:bg-carbon-600 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Refresh logs"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Logs Container */}
      <div className="max-h-[500px] overflow-y-auto">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchLogs}
              className="px-4 py-2 bg-carbon-700 hover:bg-carbon-600 text-white rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        ) : loading && logs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-locale-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No logs found</p>
            <p className="text-xs text-gray-600 mt-2">
              Events will appear here as they occur in the system.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-carbon-800">
            {logs.map((log) => (
              <div
                key={log.id}
                className="px-6 py-3 hover:bg-carbon-800/50 transition-colors cursor-pointer"
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id || null)}
              >
                <div className="flex items-center gap-4">
                  {/* Source Icon */}
                  <span className="text-lg" title={log.source}>
                    {SOURCE_ICONS[log.source] || '📌'}
                  </span>

                  {/* Event Type */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-mono truncate ${SEVERITY_COLORS[log.severity]}`}>
                      {log.event_type}
                    </p>
                    {log.user_id && (
                      <p className="text-xs text-gray-600 truncate">
                        User: {log.user_id.slice(0, 8)}...
                      </p>
                    )}
                  </div>

                  {/* Severity Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-xs uppercase ${
                      log.severity === 'critical'
                        ? 'bg-red-900/30 text-red-400'
                        : log.severity === 'error'
                        ? 'bg-red-900/20 text-red-400'
                        : log.severity === 'warn'
                        ? 'bg-yellow-900/20 text-yellow-400'
                        : 'bg-carbon-700 text-gray-400'
                    }`}
                  >
                    {log.severity}
                  </span>

                  {/* Timestamp */}
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTimestamp(log.created_at)}
                  </span>

                  {/* Expand Icon */}
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      expandedLog === log.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded Payload */}
                {expandedLog === log.id && log.payload && (
                  <div className="mt-3 p-3 bg-carbon-900 rounded-lg border border-carbon-700">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Payload</p>
                    <pre className="text-xs text-gray-300 overflow-x-auto font-mono">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-carbon-700 bg-carbon-800/50 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Showing {logs.length} of {maxLogs} max logs
        </p>
        {autoRefresh && (
          <p className="text-xs text-gray-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Auto-refresh every {refreshInterval / 1000}s
          </p>
        )}
      </div>
    </div>
  );
};

export default SystemLogsViewer;
