'use client';

import { useState } from 'react';
import {
  Bell, AlertTriangle, Clock, CheckCircle, X,
  Filter, ChevronDown, RefreshCw,
} from 'lucide-react';
import type { Alert, AlertSeverity, AlertType } from '@/lib/types';

interface AlertFeedProps {
  alerts: Alert[];
  unacknowledgedCount: number;
  isLoading: boolean;
  onAcknowledge: (id: string) => void;
  onRefresh: () => void;
  onFlyTo?: (alert: Alert) => void;
}

const SEVERITY_CONFIG: Record<AlertSeverity, { color: string; bg: string; border: string; label: string }> = {
  CRITICAL: { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'CRITICAL' },
  HIGH: { color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'HIGH' },
  MEDIUM: { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'MEDIUM' },
  LOW: { color: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'LOW' },
  INFO: { color: '#6b7280', bg: 'bg-gray-500/10', border: 'border-gray-500/30', label: 'INFO' },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  DELAY: <Clock className="w-3 h-3" />,
  ROUTE_DEVIATION: <AlertTriangle className="w-3 h-3" />,
};

export default function AlertFeed({ alerts, unacknowledgedCount, isLoading, onAcknowledge, onRefresh, onFlyTo }: AlertFeedProps) {
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'ALL'>('ALL');

  const filtered = alerts.filter(a => {
    if (!showAcknowledged && a.acknowledged) return false;
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-gray-950/90 backdrop-blur-xl border-l border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-white">Alerts</span>
          {unacknowledgedCount > 0 && (
            <span className="bg-red-500/20 text-red-400 text-[10px] font-mono px-1.5 py-0.5 rounded-full">{unacknowledgedCount} new</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onRefresh} className="p-1.5 text-gray-500 hover:text-white rounded hover:bg-gray-800">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800/50">
        <button
          onClick={() => setShowAcknowledged(!showAcknowledged)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border ${
            showAcknowledged ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-gray-900 border-gray-700 text-gray-500'
          }`}
        >
          <CheckCircle className="w-3 h-3" /> Show all
        </button>
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value as AlertSeverity | 'ALL')}
          className="bg-gray-900 border border-gray-700 text-gray-400 text-[10px] font-mono px-2 py-1 rounded"
        >
          <option value="ALL">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs">
            <CheckCircle className="w-8 h-8 mb-2 opacity-30" />
            <p>No alerts</p>
          </div>
        ) : (
          filtered.map(alert => {
            const cfg = SEVERITY_CONFIG[alert.severity];
            return (
              <div key={alert.id} className={`border-b border-gray-800/50 ${cfg.bg} px-3 py-2.5 ${!alert.acknowledged ? 'border-l-2' : ''}`}
                style={{ borderLeftColor: !alert.acknowledged ? cfg.color : undefined }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="mt-0.5" style={{ color: cfg.color }}>{TYPE_ICONS[alert.type] || <AlertTriangle className="w-3 h-3" />}</div>
                    <div className="min-w-0">
                      <p className="text-xs text-white font-medium truncate">{alert.title}</p>
                      {alert.description && <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{alert.description}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${cfg.bg}`} style={{ color: cfg.color }}>{cfg.label}</span>
                        <span className="text-[9px] text-gray-600 font-mono">{new Date(alert.createdAt).toLocaleString()}</span>
                        {alert.shipment && <span className="text-[9px] text-cyan-400/60 font-mono">{alert.shipment.shipmentNo}</span>}
                      </div>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <button onClick={() => onAcknowledge(alert.id)} className="shrink-0 p-1 text-gray-500 hover:text-green-400 rounded hover:bg-gray-800">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
