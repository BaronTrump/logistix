'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import LogisticsSidebar, { type VisualMode } from './logistics-sidebar';
import AnalyticsPanel from './analytics-panel';
import AlertFeed from './alert-feed';
import ShipmentDetail from './shipment-detail';
import CoordinateDisplay from './coordinate-display';
import { useShipmentTracking } from '@/hooks/use-shipment-tracking';
import { useAlertFeed } from '@/hooks/use-alert-feed';
import { useLogisticsAnalytics } from '@/hooks/use-logistics-analytics';
import { useWarehouses } from '@/hooks/use-warehouses';
import type { LogisticsLayerState, CameraPosition, Shipment, ShipmentStatus } from '@/lib/types';

if (typeof window !== 'undefined') {
  (window as any).CESIUM_BASE_URL = 'https://cesium.com/downloads/cesiumjs/releases/1.121/Build/Cesium/';
}

const PRESET_LOCATIONS: Record<string, CameraPosition> = {
  'North America HUB': { longitude: -98.5795, latitude: 39.8283, height: 4000000, heading: 0, pitch: -45, roll: 0 },
  'Europe HUB': { longitude: 10.4515, latitude: 51.1657, height: 3000000, heading: 0, pitch: -45, roll: 0 },
  'Asia Pacific HUB': { longitude: 114.0579, latitude: 22.5431, height: 3500000, heading: 0, pitch: -45, roll: 0 },
  'South America HUB': { longitude: -58.3816, latitude: -23.6821, height: 2500000, heading: 0, pitch: -45, roll: 0 },
  'Detroit MI': { longitude: -83.0458, latitude: 42.3314, height: 50000, heading: 0, pitch: -45, roll: 0 },
  'Shanghai': { longitude: 121.4737, latitude: 31.2304, height: 80000, heading: 0, pitch: -45, roll: 0 },
  'Hamburg': { longitude: 9.9937, latitude: 53.5511, height: 60000, heading: 0, pitch: -45, roll: 0 },
  'Monterrey MX': { longitude: -100.3161, latitude: 25.6866, height: 50000, heading: 0, pitch: -45, roll: 0 },
};

const STATUS_COLORS: Record<string, string> = {
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

export default function LogisticsDashboard() {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visualMode, setVisualMode] = useState<VisualMode>('normal');
  const [layers, setLayers] = useState<LogisticsLayerState>({
    shipments: true, warehouses: true, routes: true, alerts: false, heatmap: false,
  });
  const [currentPosition, setCurrentPosition] = useState<CameraPosition | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<ShipmentStatus | 'ALL'>('ALL');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAlertFeed, setShowAlertFeed] = useState(false);

  const orgId = undefined; // Will be set via auth in production

  const {
    shipments, totalCount: shipmentCount,
    isLoading: shipmentLoading, error: shipmentError, lastUpdate, refresh: refreshShipments,
  } = useShipmentTracking(viewer, layers.shipments, orgId);

  const {
    alerts, unacknowledgedCount: unacknowledgedAlerts,
    isLoading: alertsLoading, refresh: refreshAlerts, acknowledgeAlert,
  } = useAlertFeed(orgId);

  const {
    analytics, isLoading: analyticsLoading, refresh: refreshAnalytics,
  } = useLogisticsAnalytics(orgId);

  const { warehouses } = useWarehouses(orgId);

  const filteredShipments = useMemo(() => {
    if (activeStatusFilter === 'ALL') return shipments;
    return shipments.filter(s => s.status === activeStatusFilter);
  }, [shipments, activeStatusFilter]);

  const inTransitCount = shipments.filter(s => s.status === 'IN_TRANSIT').length;
  const atRiskCount = shipments.filter(s => s.isAtRisk).length;

  const trackingStats = useMemo(() => ({
    totalShipments: shipmentCount,
    inTransit: inTransitCount,
    delivered: shipments.filter(s => s.status === 'DELIVERED').length,
    delayed: shipments.filter(s => s.status === 'DELAYED').length,
    atRisk: atRiskCount,
    onTimeRate: analytics?.onTimeRate ?? 0,
  }), [shipmentCount, inTransitCount, atRiskCount, shipments, analytics]);

  // Initialize Cesium viewer
  useEffect(() => {
    if (!cesiumContainerRef.current || viewerRef.current) return;

    const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
    if (ionToken) Cesium.Ion.defaultAccessToken = ionToken;

    try {
      const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: true,
        timeline: true,
        fullscreenButton: false,
        infoBox: true,
        selectionIndicator: true,
        shouldAnimate: true,
        useBrowserRecommendedResolution: true,
        contextOptions: { webgl: { alpha: false, antialias: true, preserveDrawingBuffer: true } },
      });

      viewer.scene.globe.depthTestAgainstTerrain = true;
      viewer.scene.fog.enabled = true;
      viewer.scene.fog.density = 0.0001;
      viewer.scene.globe.enableLighting = false;
      viewer.scene.globe.dynamicAtmosphereLighting = false;

      // Fix base layer to dark imagery
      const darkImagery = new Cesium.TileMapServiceImageryProvider({
        url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
      });
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(darkImagery);

      // Camera position tracking
      viewer.camera.changed.addEventListener(() => {
        const pos = viewer.camera.positionCartographic;
        if (pos) {
          setCurrentPosition({
            longitude: Cesium.Math.toDegrees(pos.longitude),
            latitude: Cesium.Math.toDegrees(pos.latitude),
            height: pos.height,
            heading: Cesium.Math.toDegrees(viewer.camera.heading),
            pitch: Cesium.Math.toDegrees(viewer.camera.pitch),
            roll: Cesium.Math.toDegrees(viewer.camera.roll),
          });
        }
      });

      // Initial camera
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-98.5795, 39.8283, 4000000),
        orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
        duration: 0,
      });

      // Click handler for shipment selection
      const clickHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      viewer.screenSpaceEventHandler.setInputAction((click: any) => {
        const picked = viewer.scene.pick(click.position);
        if (picked && picked.id && picked.id.id && picked.id.id.startsWith('shipment-')) {
          const shipmentId = picked.id.id.replace('shipment-', '');
          const shipment = shipments.find(s => s.id === shipmentId);
          if (shipment) setSelectedShipment(shipment);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      viewerRef.current = viewer;
      setViewer(viewer);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize Cesium:', error);
      setIsLoading(false);
    }

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
        setViewer(null);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Render warehouse entities
  useEffect(() => {
    if (!viewer || !layers.warehouses || warehouses.length === 0) return;

    const entities: Cesium.Entity[] = [];
    warehouses.forEach(w => {
      const entity = viewer.entities.add({
        id: `warehouse-${w.id}`,
        position: Cesium.Cartesian3.fromDegrees(w.longitude, w.latitude),
        billboard: {
          image: Cesium.PinBuilder.fromColor(Cesium.Color.fromCssColorString('#a78bfa'), Cesium.PinStyle.MARKER, 48),
          scale: 0.6,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
        label: {
          text: w.name,
          font: '10px monospace',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 10),
          show: false,
        },
      });
      entities.push(entity);
    });

    return () => {
      entities.forEach(e => {
        if (!viewer.isDestroyed()) viewer.entities.remove(e);
      });
    };
  }, [viewer, layers.warehouses, warehouses]);

  // Fly to location
  const flyToLocation = useCallback((location: CameraPosition) => {
    if (!viewer || viewer.isDestroyed()) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude, location.height),
      orientation: { heading: Cesium.Math.toRadians(location.heading ?? 0), pitch: Cesium.Math.toRadians(location.pitch ?? -30), roll: 0 },
      duration: 2.5,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
    });
  }, [viewer]);

  // Search
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim()) return;
    const presetKey = Object.keys(PRESET_LOCATIONS).find(k => k.toLowerCase() === query.toLowerCase());
    if (presetKey) { flyToLocation(PRESET_LOCATIONS[presetKey]); return; }

    // Try to find a shipment by PO or number
    const found = shipments.find(s =>
      s.shipmentNo.toLowerCase() === query.toLowerCase() ||
      s.poNumber?.toLowerCase() === query.toLowerCase()
    );
    if (found && found.currentPosition) {
      flyToLocation({ longitude: found.currentPosition.longitude, latitude: found.currentPosition.latitude, height: 10000 });
      setSelectedShipment(found);
      return;
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, { headers: { 'User-Agent': 'LogisticsTracker/1.0' } });
      const data = await res.json();
      if (data?.length > 0) {
        flyToLocation({ longitude: parseFloat(data[0].lon), latitude: parseFloat(data[0].lat), height: 10000, pitch: -45 });
      }
    } catch (e) {
      console.error('Geocoding failed:', e);
    }
  }, [flyToLocation, shipments]);

  const handleRefresh = useCallback(() => {
    refreshShipments();
    refreshAlerts();
    refreshAnalytics();
  }, [refreshShipments, refreshAlerts, refreshAnalytics]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-950">
      {/* Cesium Container */}
      <div ref={cesiumContainerRef} className="cesium-container" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-950/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white text-sm tracking-widest">LOGISTIX</p>
            <p className="text-cyan-400/60 text-[10px] font-mono mt-1">Loading Geospatial Engine...</p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="absolute top-0 left-0 h-full z-20">
        <LogisticsSidebar
          layers={layers}
          setLayers={setLayers}
          visualMode={visualMode}
          setVisualMode={setVisualMode}
          shipmentCount={shipmentCount}
          inTransitCount={inTransitCount}
          atRiskCount={atRiskCount}
          unacknowledgedAlerts={unacknowledgedAlerts}
          onSearch={searchLocation}
          onRefresh={handleRefresh}
          onStatusFilter={setActiveStatusFilter}
          activeStatusFilter={activeStatusFilter}
          trackingStats={trackingStats}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-950/80 backdrop-blur-md border border-gray-800 rounded-full">
          {Object.entries(PRESET_LOCATIONS).slice(0, 5).map(([name, pos]) => (
            <button
              key={name}
              onClick={() => flyToLocation(pos)}
              className="text-[10px] font-mono text-gray-400 hover:text-cyan-400 px-2 py-0.5 rounded hover:bg-gray-800 transition-colors"
            >
              {name}
            </button>
          ))}
          <div className="w-px h-3 bg-gray-700" />
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${showAnalytics ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setShowAlertFeed(!showAlertFeed)}
            className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${showAlertFeed ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white'}`}
          >
            Alerts {unacknowledgedAlerts > 0 && <span className="bg-red-500 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full">{unacknowledgedAlerts}</span>}
          </button>
        </div>
      </div>

      {/* Right Panels */}
      <div className="absolute top-0 right-0 h-full flex z-20 pointer-events-none">
        {showAlertFeed && (
          <div className="w-80 h-full pointer-events-auto">
            <AlertFeed
              alerts={alerts}
              unacknowledgedCount={unacknowledgedAlerts}
              isLoading={alertsLoading}
              onAcknowledge={id => acknowledgeAlert(id)}
              onRefresh={refreshAlerts}
            />
          </div>
        )}
        {showAnalytics && (
          <div className="w-80 h-full pointer-events-auto">
            <AnalyticsPanel analytics={analytics} isLoading={analyticsLoading} />
          </div>
        )}
        {selectedShipment && (
          <div className="w-80 h-full pointer-events-auto">
            <ShipmentDetail shipment={selectedShipment} onClose={() => setSelectedShipment(null)} />
          </div>
        )}
      </div>

      {/* Coordinate Display */}
      <CoordinateDisplay position={currentPosition} />
    </div>
  );
}
