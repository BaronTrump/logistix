'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Cesium from 'cesium';
import type { Shipment } from '@/lib/types';

const POLL_INTERVAL = 15000;
const API_BASE = '/api';

export function useShipmentTracking(
  viewer: Cesium.Viewer | null,
  enabled: boolean,
  orgId?: string
) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const entitiesRef = useRef<Cesium.Entity[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchShipments = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ limit: '500' });
      if (orgId) params.set('orgId', orgId);
      const res = await fetch(`${API_BASE}/shipments?${params}`);
      if (!res.ok) throw new Error('Failed to fetch shipments');
      const data = await res.json();
      setShipments(data.shipments);
      setTotalCount(data.total);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  // Render shipment entities on Cesium globe
  useEffect(() => {
    if (!viewer || !enabled || shipments.length === 0) return;

    // Clear previous entities
    entitiesRef.current.forEach(e => viewer.entities.remove(e));
    entitiesRef.current = [];

    // Build truck icon as a billboard
    const icon = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00d4ff"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>'
    );

    const statusColors: Record<string, string> = {
      IN_TRANSIT: '#00d4ff',
      DELAYED: '#f59e0b',
      AT_RISK: '#ef4444',
      DELIVERED: '#22c55e',
      PICKED_UP: '#3b82f6',
      CREATED: '#6b7280',
      BOOKED: '#8b5cf6',
      OUT_FOR_DELIVERY: '#06b6d4',
      EXCEPTION: '#f97316',
    };

    shipments.forEach((shipment) => {
      if (!shipment.currentPosition && (!shipment.originWarehouse || !shipment.destWarehouse)) return;

      const pos = shipment.currentPosition || shipment.originWarehouse;
      if (!pos) return;

      const color = statusColors[shipment.status] || '#6b7280';

      const entity = viewer.entities.add({
        id: `shipment-${shipment.id}`,
        position: Cesium.Cartesian3.fromDegrees(pos.longitude, pos.latitude),
        billboard: {
          image: icon,
          scale: 0.8,
          color: Cesium.Color.fromCssColorString(color),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
        label: {
          text: shipment.shipmentNo,
          font: '10px monospace',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 10),
          show: false,
        },
        description: JSON.stringify({
          shipmentNo: shipment.shipmentNo,
          status: shipment.status,
          priority: shipment.priority,
          description: shipment.description,
          weightKg: shipment.weightKg,
          estArrival: shipment.estArrival,
        }),
      });

      // Add route line if origin and dest are known
      if (shipment.originWarehouse && shipment.destWarehouse && shipment.status === 'IN_TRANSIT') {
        viewer.entities.add({
          id: `route-${shipment.id}`,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray([
              shipment.originWarehouse.longitude, shipment.originWarehouse.latitude,
              shipment.destWarehouse.longitude, shipment.destWarehouse.latitude,
            ]),
            width: 1.5,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString(color).withAlpha(0.5),
            }),
            clampToGround: true,
          },
        });
      }

      entitiesRef.current.push(entity);
    });

    return () => {
      entitiesRef.current.forEach(e => {
        if (!viewer.isDestroyed()) viewer.entities.remove(e);
      });
      entitiesRef.current = [];
    };
  }, [viewer, enabled, shipments]);

  // Poll for updates
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    fetchShipments();
    intervalRef.current = setInterval(fetchShipments, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, fetchShipments]);

  return {
    shipments,
    totalCount,
    isLoading,
    error,
    lastUpdate,
    refresh: fetchShipments,
  };
}
