// ─── Top-Level Logistics Types ───

export type OrgType = 'MANUFACTURER' | 'AFFILIATE' | 'SUPPLIER' | 'LOGISTICS_PARTNER';
export type UserRole = 'ADMIN' | 'LOGISTICS_MANAGER' | 'DISPATCHER' | 'VIEWER';
export type TransportMode = 'TRUCK' | 'RAIL' | 'OCEAN' | 'AIR' | 'MULTIMODAL';
export type VehicleType = 'TRACTOR' | 'TRAILER' | 'STRAIGHT_TRUCK' | 'FLATBED' | 'REEFER' | 'TANKER' | 'BOXCAR' | 'CONTAINER_SHIP' | 'BULKER' | 'CARGO_PLANE';
export type WarehouseType = 'MANUFACTURING' | 'DISTRIBUTION' | 'CROSS_DOCK' | 'RAW_MATERIAL' | 'FINISHED_GOODS' | 'FULFILLMENT';
export type ShipmentStatus = 'CREATED' | 'BOOKED' | 'PICKED_UP' | 'IN_TRANSIT' | 'AT_RISK' | 'DELAYED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'EXCEPTION' | 'CANCELLED';
export type ShipmentPriority = 'RUSH' | 'HIGH' | 'NORMAL' | 'LOW';
export type AlertType = 'DELAY' | 'ROUTE_DEVIATION' | 'TEMPERATURE_BREACH' | 'HAZMAT_ISSUE' | 'CUSTOMER_COMPLAINT' | 'CAPACITY_ISSUE' | 'WEATHER_EVENT' | 'DOCUMENT_MISSING' | 'CARRIER_ISSUE' | 'CUSTOMS_HOLD';
export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

// ─── Geospatial ───
export interface GeoPoint {
  longitude: number;
  latitude: number;
}

export interface GeoBounds {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

// ─── Organization ───
export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  code: string;
  domain?: string;
}

// ─── Warehouse ───
export interface Warehouse extends GeoPoint {
  id: string;
  name: string;
  code: string;
  type: WarehouseType;
  organizationId: string;
  address?: string;
  city: string;
  state?: string;
  country: string;
  capacityM2?: number;
  isActive: boolean;
}

// ─── Carrier ───
export interface Carrier {
  id: string;
  name: string;
  scac?: string;
  mcNumber?: string;
  mode: TransportMode;
  organizationId: string;
  isActive: boolean;
  rating?: number;
}

// ─── Vehicle ───
export interface Vehicle {
  id: string;
  carrierId: string;
  type: VehicleType;
  plate?: string;
  vin?: string;
  capacityKg?: number;
  isActive: boolean;
}

// ─── VehiclePosition (GPS ping) ───
export interface VehiclePosition extends GeoPoint {
  id: string;
  vehicleId: string;
  speed?: number;
  heading?: number;
  recordedAt: string;
}

// ─── Driver ───
export interface Driver {
  id: string;
  name: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  carrierId?: string;
  vehicleId?: string;
  isActive: boolean;
}

// ─── Customer ───
export interface Customer {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  longitude?: number;
  latitude?: number;
  isActive: boolean;
}

// ─── Shipment ───
export interface Shipment {
  id: string;
  shipmentNo: string;
  organizationId: string;
  status: ShipmentStatus;
  priority: ShipmentPriority;
  originWarehouseId?: string;
  originWarehouse?: Warehouse;
  destWarehouseId?: string;
  destWarehouse?: Warehouse;
  customerId?: string;
  customer?: Customer;
  carrierId?: string;
  carrier?: Carrier;
  vehicleId?: string;
  vehicle?: Vehicle;
  description?: string;
  weightKg?: number;
  volumeM3?: number;
  pieceCount?: number;
  hazmat: boolean;
  estDeparture?: string;
  estArrival?: string;
  actualDeparture?: string;
  actualArrival?: string;
  transitMinutes?: number;
  routeJson?: any;
  freightCharge?: number;
  currency: string;
  isAtRisk: boolean;
  riskReason?: string;
  referenceNo?: string;
  poNumber?: string;
  bolNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  currentPosition?: VehiclePosition;
}

// ─── Alert ───
export interface Alert {
  id: string;
  shipmentId?: string;
  shipment?: Shipment;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  location?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

// ─── Dashboard State (for Cesium tracking layers) ───
export interface LogisticsLayerState {
  shipments: boolean;
  warehouses: boolean;
  routes: boolean;
  alerts: boolean;
  heatmap: boolean;
}

// ─── Camera Position ───
export interface CameraPosition {
  longitude: number;
  latitude: number;
  height: number;
  heading?: number;
  pitch?: number;
  roll?: number;
}

// ─── Analytics ───
export interface LogisticsAnalytics {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  delayed: number;
  atRisk: number;
  onTimeRate: number;
  avgTransitHours: number;
  totalRevenue: number;
  volumeByMode: { mode: string; count: number }[];
  volumeByStatus: { status: string; count: number }[];
  alertsBySeverity: { severity: string; count: number }[];
  dailyVolume: { date: string; count: number }[];
  topRoutes: { origin: string; dest: string; count: number }[];
  topCarriers: { name: string; count: number; onTimeRate: number }[];
}
