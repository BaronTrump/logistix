'use client';

import { useState, useCallback } from 'react';
import {
  Package, Warehouse, Map, Bell, BarChart3, Search,
  Truck, Ship, Plane, Train, Filter, Menu, X,
  RefreshCw, AlertTriangle, Clock, ChevronDown,
  Circle, MapPin, ChevronRight, GripVertical,
} from 'lucide-react';
import type { LogisticsLayerState, CameraPosition, ShipmentStatus } from '@/lib/types';

export type VisualMode = 'normal' | 'nightvision' | 'thermal' | 'crt';

interface SidebarProps {
  layers: LogisticsLayerState;
  setLayers: (l: LogisticsLayerState) => void;
  visualMode: VisualMode;
  setVisualMode: (v: VisualMode) => void;
  shipmentCount: number;
  inTransitCount: number;
  atRiskCount: number;
  unacknowledgedAlerts: number;
  onSearch: (q: string) => void;
  onRefresh: () => void;
  onStatusFilter: (status: ShipmentStatus | 'ALL') => void;
  activeStatusFilter: ShipmentStatus | 'ALL';
  trackingStats: {
    totalShipments: number;
    inTransit: number;
    delivered: number;
    delayed: number;
    atRisk: number;
    onTimeRate: number;
  };
  className?: string;
}

const LOGO = () => (
  <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00d4ff" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
    </defs>
    <rect x="4" y="8" width="24" height="16" rx="2" stroke="url(#lg)" strokeWidth="1.5" fill="none" />
    <rect x="14" y="12" width="8" height="8" rx="1" fill="url(#lg)" opacity="0.3" />
    <path d="M28 16 L34 8 L34 24 Z" fill="url(#lg)" opacity="0.6" />
    <circle cx="10" cy="28" r="2.5" fill="url(#lg)" />
    <circle cx="22" cy="28" r="2.5" fill="url(#lg)" />
    <circle cx="34" cy="28" r="2.5" fill="url(#lg)" />
    <path d="M5 14 L11 14" stroke="url(#lg)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 18 L9 18" stroke="url(#lg)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const STATUS_OPTIONS: { label: string; value: ShipmentStatus | 'ALL'; color: string }[] = [
  { label: 'All', value: 'ALL', color: '#6b7280' },
  { label: 'In Transit', value: 'IN_TRANSIT', color: '#00d4ff' },
  { label: 'Delayed', value: 'DELAYED', color: '#f59e0b' },
  { label: 'At Risk', value: 'AT_RISK', color: '#ef4444' },
  { label: 'Delivered', value: 'DELIVERED', color: '#22c55e' },
  { label: 'Exception', value: 'EXCEPTION', color: '#f97316' },
];

const TRANSPORT_ICONS: Record<string, React.ReactNode> = {
  TRUCK: <Truck className="w-3.5 h-3.5" />,
  OCEAN: <Ship className="w-3.5 h-3.5" />,
  AIR: <Plane className="w-3.5 h-3.5" />,
  RAIL: <Train className="w-3.5 h-3.5" />,
};

export default function LogisticsSidebar({
  layers, setLayers, visualMode, setVisualMode,
  shipmentCount, inTransitCount, atRiskCount, unacknowledgedAlerts,
  onSearch, onRefresh, onStatusFilter, activeStatusFilter, trackingStats,
  className = '',
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  const toggleLayer = (key: keyof LogisticsLayerState) => {
    setLayers({ ...layers, [key]: !layers[key] });
  };

  return (
    <div className={`${collapsed ? 'w-14' : 'w-80'} transition-all duration-300 h-screen bg-gray-950/90 backdrop-blur-xl border-r border-gray-800 flex flex-col z-30 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-800 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <LOGO />
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider">LOGISTIX</h1>
              <p className="text-[10px] text-cyan-400/60 tracking-widest font-mono">SUPPLY CHAIN INTELLIGENCE</p>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800">
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Search */}
          <form onSubmit={handleSearch} className="p-3 border-b border-gray-800/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="PO #, shipment #, customer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="px-3 py-2 border-b border-gray-800/50">
            <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-2 flex items-center gap-1.5">
              <Filter className="w-3 h-3" /> STATUS FILTER
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onStatusFilter(opt.value)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition-colors ${
                    activeStatusFilter === opt.value
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2 p-3 border-b border-gray-800/50">
            <StatCard label="Total" value={trackingStats.totalShipments} color="#6b7280" />
            <StatCard label="In Transit" value={trackingStats.inTransit} color="#00d4ff" />
            <StatCard label="Delivered" value={trackingStats.delivered} color="#22c55e" />
            <StatCard label="At Risk" value={trackingStats.atRisk} color="#ef4444" highlight />
            <StatCard label="Delayed" value={trackingStats.delayed} color="#f59e0b" />
            <StatCard label="On-Time" value={`${trackingStats.onTimeRate}%`} color="#a78bfa" />
          </div>

          {/* Layer Controls */}
          <div className="px-3 py-2 border-b border-gray-800/50">
            <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-2 flex items-center gap-1.5">
              <Map className="w-3 h-3" /> MAP LAYERS
            </p>
            <div className="space-y-1">
              <LayerToggle label="Shipments" icon={<Package className="w-3.5 h-3.5" />} checked={layers.shipments} onChange={() => toggleLayer('shipments')} />
              <LayerToggle label="Warehouses" icon={<Warehouse className="w-3.5 h-3.5" />} checked={layers.warehouses} onChange={() => toggleLayer('warehouses')} />
              <LayerToggle label="Routes" icon={<Map className="w-3.5 h-3.5" />} checked={layers.routes} onChange={() => toggleLayer('routes')} />
              <LayerToggle label="Alerts" icon={<Bell className="w-3.5 h-3.5" />} checked={layers.alerts} onChange={() => toggleLayer('alerts')} badge={unacknowledgedAlerts} />
              <LayerToggle label="Heatmap" icon={<BarChart3 className="w-3.5 h-3.5" />} checked={layers.heatmap} onChange={() => toggleLayer('heatmap')} />
            </div>
          </div>

          {/* Visual Mode */}
          <div className="px-3 py-2 border-b border-gray-800/50">
            <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-2">VISUAL MODE</p>
            <div className="grid grid-cols-2 gap-1.5">
              {(['normal', 'nightvision', 'thermal', 'crt'] as VisualMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setVisualMode(m)}
                  className={`px-2 py-1.5 rounded text-[10px] font-mono capitalize ${
                    visualMode === m ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-900 text-gray-400 border border-gray-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh */}
          <div className="p-3">
            <button onClick={onRefresh} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-300 hover:border-gray-600 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Data
            </button>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex-1 flex flex-col items-center gap-4 py-4">
          <CollapsedIcon icon={<Package />} active={layers.shipments} />
          <CollapsedIcon icon={<Warehouse />} active={layers.warehouses} />
          <CollapsedIcon icon={<Map />} active={layers.routes} />
          <CollapsedIcon icon={<Bell />} active={layers.alerts} badge={unacknowledgedAlerts} />
          <CollapsedIcon icon={<BarChart3 />} active={layers.heatmap} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, highlight }: { label: string; value: string | number; color: string; highlight?: boolean }) {
  return (
    <div className={`bg-gray-900/60 border ${highlight ? 'border-red-500/30' : 'border-gray-800'} rounded-lg px-2.5 py-2`}>
      <p className="text-[10px] text-gray-500 font-mono">{label}</p>
      <p className="text-sm font-bold font-mono" style={{ color }}>{value}</p>
    </div>
  );
}

function LayerToggle({ label, icon, checked, onChange, badge }: { label: string; icon: React.ReactNode; checked: boolean; onChange: () => void; badge?: number }) {
  return (
    <button onClick={onChange} className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-gray-800/50 transition-colors group">
      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
        checked ? 'bg-cyan-500/20 border-cyan-500' : 'border-gray-600 group-hover:border-gray-500'
      }`}>
        {checked && <div className="w-2 h-2 rounded-sm bg-cyan-400" />}
      </div>
      <span className={`${checked ? 'text-gray-200' : 'text-gray-500'} text-xs flex items-center gap-1.5`}>
        {icon} {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto bg-red-500/20 text-red-400 text-[9px] font-mono px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  );
}

function CollapsedIcon({ icon, active, badge }: { icon: React.ReactNode; active: boolean; badge?: number }) {
  return (
    <div className={`relative p-2 rounded-lg ${active ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-600 hover:text-gray-400'}`}>
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full">{badge}</span>
      )}
    </div>
  );
}
