'use client';

import { BarChart3, TrendingUp, Package, Clock, AlertTriangle, Ship, Truck, Plane, Train } from 'lucide-react';
import type { LogisticsAnalytics } from '@/lib/types';

interface AnalyticsPanelProps {
  analytics: LogisticsAnalytics | null;
  isLoading: boolean;
}

export default function AnalyticsPanel({ analytics, isLoading }: AnalyticsPanelProps) {
  if (isLoading || !analytics) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-950/90 backdrop-blur-xl">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxStatus = Math.max(...analytics.volumeByStatus.map(s => s.count), 1);

  return (
    <div className="h-full overflow-y-auto bg-gray-950/90 backdrop-blur-xl border-l border-gray-800 p-4 scrollbar-hide">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-cyan-400" />
        <h2 className="text-sm font-bold text-white">Analytics</h2>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <KpiCard label="On-Time Rate" value={`${analytics.onTimeRate}%`} color="#22c55e" icon={<TrendingUp className="w-3.5 h-3.5" />} />
        <KpiCard label="Avg Transit" value={`${analytics.avgTransitHours}h`} color="#3b82f6" icon={<Clock className="w-3.5 h-3.5" />} />
        <KpiCard label="At Risk" value={analytics.atRisk} color="#ef4444" icon={<AlertTriangle className="w-3.5 h-3.5" />} />
        <KpiCard label="Delivered" value={analytics.delivered} color="#22c55e" icon={<Package className="w-3.5 h-3.5" />} />
      </div>

      {/* Volume by Status */}
      <div className="mb-4">
        <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-2">VOLUME BY STATUS</p>
        <div className="space-y-1.5">
          {analytics.volumeByStatus.map(s => (
            <div key={s.status} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 w-20 font-mono truncate">{s.status.replace(/_/g, ' ')}</span>
              <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(s.count / maxStatus) * 100}%`, backgroundColor: statusColor(s.status) }}
                />
              </div>
              <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts by Severity */}
      <div className="mb-4">
        <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-2">ALERTS BY SEVERITY</p>
        <div className="space-y-1.5">
          {analytics.alertsBySeverity.map(a => (
            <div key={a.severity} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 w-16 font-mono">{a.severity}</span>
              <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min((a.count / Math.max(...analytics.alertsBySeverity.map(x => x.count), 1)) * 100, 100)}%`, backgroundColor: severityColor(a.severity) }}
                />
              </div>
              <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{a.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Carriers */}
      {analytics.topCarriers.length > 0 && (
        <div>
          <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-2">TOP CARRIERS</p>
          <div className="space-y-1.5">
            {analytics.topCarriers.map(c => (
              <div key={c.name} className="flex items-center justify-between px-2 py-1.5 bg-gray-900/50 rounded">
                <div className="flex items-center gap-2">
                  <Truck className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-300">{c.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500 font-mono">{c.count} shipments</span>
                  <span className="text-[10px] font-mono" style={{ color: c.onTimeRate >= 90 ? '#22c55e' : c.onTimeRate >= 75 ? '#f59e0b' : '#ef4444' }}>
                    {c.onTimeRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] text-gray-500 font-mono">{label}</span>
      </div>
      <p className="text-lg font-bold font-mono" style={{ color }}>{value}</p>
    </div>
  );
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    IN_TRANSIT: '#00d4ff',
    DELIVERED: '#22c55e',
    DELAYED: '#f59e0b',
    AT_RISK: '#ef4444',
    CREATED: '#6b7280',
    PICKED_UP: '#3b82f6',
    BOOKED: '#8b5cf6',
    EXCEPTION: '#f97316',
  };
  return colors[status] || '#6b7280';
}

function severityColor(severity: string): string {
  const colors: Record<string, string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#f59e0b',
    LOW: '#3b82f6',
    INFO: '#6b7280',
  };
  return colors[severity] || '#6b7280';
}
