'use client';

import { X, Package, MapPin, Calendar, Weight, Truck, Hash, AlertTriangle, Clock } from 'lucide-react';
import type { Shipment, ShipmentStatus } from '@/lib/types';

interface ShipmentDetailProps {
  shipment: Shipment;
  onClose: () => void;
}

const STATUS_CONFIG: Record<ShipmentStatus, { color: string; label: string }> = {
  CREATED: { color: '#6b7280', label: 'Created' },
  BOOKED: { color: '#8b5cf6', label: 'Booked' },
  PICKED_UP: { color: '#3b82f6', label: 'Picked Up' },
  IN_TRANSIT: { color: '#00d4ff', label: 'In Transit' },
  AT_RISK: { color: '#ef4444', label: 'At Risk' },
  DELAYED: { color: '#f59e0b', label: 'Delayed' },
  OUT_FOR_DELIVERY: { color: '#06b6d4', label: 'Out for Delivery' },
  DELIVERED: { color: '#22c55e', label: 'Delivered' },
  EXCEPTION: { color: '#f97316', label: 'Exception' },
  CANCELLED: { color: '#6b7280', label: 'Cancelled' },
};

export default function ShipmentDetail({ shipment, onClose }: ShipmentDetailProps) {
  const sc = STATUS_CONFIG[shipment.status];

  return (
    <div className="h-full flex flex-col bg-gray-950/90 backdrop-blur-xl border-l border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Package className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-sm font-bold text-white truncate">{shipment.shipmentNo}</span>
        </div>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-white rounded hover:bg-gray-800 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded text-[10px] font-mono font-bold" style={{ backgroundColor: `${sc.color}20`, color: sc.color, border: `1px solid ${sc.color}40` }}>
            {sc.label}
          </span>
          {shipment.isAtRisk && (
            <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {shipment.riskReason || 'At Risk'}
            </span>
          )}
          {shipment.priority === 'RUSH' && (
            <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">RUSH</span>
          )}
        </div>

        {/* Route */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
          <p className="text-[10px] font-mono text-gray-500 mb-2 tracking-wider">ROUTE</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-center">
              <p className="text-xs text-cyan-400 font-medium">{shipment.originWarehouse?.city || 'N/A'}</p>
              <p className="text-[9px] text-gray-500">{shipment.originWarehouse?.name || ''}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-px bg-gray-600 relative">
                <MapPin className="w-3 h-3 text-cyan-400 absolute -top-1.5 left-1/2 -translate-x-1/2" />
              </div>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs text-cyan-400 font-medium">{shipment.destWarehouse?.city || shipment.customer?.city || 'N/A'}</p>
              <p className="text-[9px] text-gray-500">{shipment.destWarehouse?.name || shipment.customer?.name || ''}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
          <p className="text-[10px] font-mono text-gray-500 mb-2 tracking-wider">TIMELINE</p>
          <div className="space-y-2">
            <TimelineRow label="Estimated Departure" value={shipment.estDeparture ? new Date(shipment.estDeparture).toLocaleString() : 'TBD'} icon={<Calendar className="w-3 h-3" />} />
            <TimelineRow label="Estimated Arrival" value={shipment.estArrival ? new Date(shipment.estArrival).toLocaleString() : 'TBD'} icon={<Calendar className="w-3 h-3" />} />
            {shipment.actualDeparture && <TimelineRow label="Actual Departure" value={new Date(shipment.actualDeparture).toLocaleString()} icon={<Clock className="w-3 h-3" />} />}
            {shipment.actualArrival && <TimelineRow label="Actual Arrival" value={new Date(shipment.actualArrival).toLocaleString()} icon={<Clock className="w-3 h-3" />} />}
            {shipment.transitMinutes && <TimelineRow label="Transit Time" value={`${Math.floor(shipment.transitMinutes / 60)}h ${shipment.transitMinutes % 60}m`} icon={<Clock className="w-3 h-3" />} />}
          </div>
        </div>

        {/* Cargo Details */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
          <p className="text-[10px] font-mono text-gray-500 mb-2 tracking-wider">CARGO</p>
          <div className="grid grid-cols-2 gap-2">
            {shipment.description && <DetailItem label="Description" value={shipment.description} />}
            {shipment.weightKg && <DetailItem label="Weight" value={`${shipment.weightKg.toLocaleString()} kg`} icon={<Weight className="w-3 h-3" />} />}
            {shipment.volumeM3 && <DetailItem label="Volume" value={`${shipment.volumeM3.toLocaleString()} m³`} />}
            {shipment.pieceCount && <DetailItem label="Pieces" value={shipment.pieceCount.toLocaleString()} />}
            <DetailItem label="Hazmat" value={shipment.hazmat ? 'Yes' : 'No'} />
          </div>
        </div>

        {/* References */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
          <p className="text-[10px] font-mono text-gray-500 mb-2 tracking-wider">REFERENCES</p>
          <div className="space-y-1.5">
            {shipment.poNumber && <DetailItem label="PO #" value={shipment.poNumber} icon={<Hash className="w-3 h-3" />} />}
            {shipment.bolNumber && <DetailItem label="BOL #" value={shipment.bolNumber} icon={<Hash className="w-3 h-3" />} />}
            {shipment.referenceNo && <DetailItem label="Reference" value={shipment.referenceNo} />}
            {shipment.carrier && <DetailItem label="Carrier" value={shipment.carrier.name} icon={<Truck className="w-3 h-3" />} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 w-4">{icon}</span>
      <span className="text-gray-500 w-28 font-mono text-[10px]">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-gray-500 w-3">{icon}</span>}
      <span className="text-[10px] text-gray-500 font-mono">{label}:</span>
      <span className="text-xs text-gray-200 truncate">{value}</span>
    </div>
  );
}
