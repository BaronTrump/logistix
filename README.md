<div align="center">
  <br/>
  <img src="public/favicon.svg" width="80" alt="LOGISTIX Logo"/>
  <h1 align="center">LOGISTIX</h1>
  <p align="center"><strong>Supply Chain Intelligence Platform</strong></p>
  <p align="center">Real-time global logistics tracking and geospatial analytics <br/>for industrial manufacturers and their affiliates.</p>
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-14.2-000000?logo=nextdotjs&logoColor=white" alt="Next.js"/>
    <img src="https://img.shields.io/badge/Cesium-1.139-00d4ff?logo=cesium&logoColor=white" alt="Cesium"/>
    <img src="https://img.shields.io/badge/Prisma-6.7-2D3748?logo=prisma&logoColor=white" alt="Prisma"/>
    <img src="https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Tailwind-3.3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind"/>
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  </p>
  <br/>
</div>

**LOGISTIX** is an open-source supply chain intelligence platform that visualizes global shipments on a 3D Cesium globe. Designed for industrial manufacturers and their logistics partners, it provides real-time tracking, multi-affiliate support, alert management, and operational analytics — inspired by Palantir-style geospatial dashboards.

---

## Table of Contents

- [Screenshots](#screenshots)
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Frontend Components](#frontend-components)
- [Deployment](#deployment)
  - [Development](#development)
  - [Production (Docker)](#production-docker)
  - [Production (systemd)](#production-systemd)
- [Configuration](#configuration)
- [Data Ingestion](#data-ingestion)
- [Multi-Affiliate Architecture](#multi-affiliate-architecture)
- [Roadmap](#roadmap)
- [License](#license)

---

## Screenshots

```
┌──────────────────────────────────────────────────────────────┐
│  [LOGISTIX SIDEBAR]           [CESIUM 3D GLOBE]   [PANELS]  │
│  ┌────────────────┐                              ┌────────┐ │
│  │ LOGISTIX LOGO  │   🌍 Truck icons on globe    │Alerts  │ │
│  │                │      with route polylines     │Feed   │ │
│  │ [Search...]    │      and warehouse markers    │       │ │
│  │                │                              │CRIT 3 │ │
│  │ Status filter  │   Click a shipment →          │HIGH 7 │ │
│  │ [All][In Tran] │   detail panel opens          │MED 12 │ │
│  │ [Delayed][At..]│                              │       │ │
│  │                │                              │[Ack]  │ │
│  │ Stats cards    │                              └────────┘ │
│  │ Total: 1,247   │                              ┌────────┐ │
│  │ In Transit:423 │                              │Analytcs│ │
│  │ At Risk: 12    │                              │        │ │
│  │ On-Time: 94.2% │                              │KPI row │ │
│  │                │                              │Vol bar │ │
│  │ Layer toggles  │                              │Carriers│ │
│  │ [x] Shipments  │                              └────────┘ │
│  │ [x] Warehouses │                              ┌────────┐ │
│  │ [x] Routes     │                              │Detail  │ │
│  │ [ ] Alerts     │                              │Panel   │ │
│  │ [ ] Heatmap    │                              │Route   │ │
│  │                │                              │Timeline│ │
│  │ Visual mode    │                              │Cargo   │ │
│  │ [Normal][NV]   │                              │Refs    │ │
│  │ [Thermal][CRT] │                              └────────┘ │
│  └────────────────┘                                          │
│                                                              │
│  [North America HUB] [Europe HUB] [Asia Pacific HUB] [...]   │
│                           [Analytics] [Alerts !]             │
└──────────────────────────────────────────────────────────────┘
```

---

## Features

### 🗺️ Geospatial Tracking
- **3D Cesium Globe** — dark-themed globe with natural earth imagery
- **Shipment Visualization** — colored truck icons by status (cyan=in-transit, red=at-risk, amber=delayed, green=delivered)
- **Route Polylines** — dashed lines from origin to destination for in-transit shipments
- **Warehouse Markers** — purple pin markers for all facilities
- **5 Preset Hubs** — North America, Europe, Asia Pacific, South America, plus key industrial cities
- **Geocoding Search** — search by city, address, PO number, or shipment number
- **4 Visual Modes** — Normal, Night Vision, Thermal, CRT (post-process GLSL shaders)

### 📦 Shipment Management
- **Full Lifecycle** — Created → Booked → Picked Up → In Transit → At Risk → Delayed → Out for Delivery → Delivered → Exception → Cancelled
- **Priority Levels** — Rush, High, Normal, Low
- **Status Filtering** — quick-filter shipments by current status
- **Shipment Detail Panel** — route map, timeline, cargo info, references, carrier details
- **Click-to-Select** — click any shipment on the globe to open its detail panel

### 🚚 Multi-Modal Transport
- Truck, Rail, Ocean, Air, Multimodal
- Vehicle types: Tractor, Trailer, Flatbed, Reefer, Tanker, Container Ship, Cargo Plane, etc.
- GPS position pings with speed and heading

### 🏭 Multi-Affiliate Architecture
- **Organization hierarchy** — Manufacturer + Affiliates + Suppliers + Logistics Partners
- **Data isolation** — all entities scoped by `organizationId`
- **User roles** — Admin, Logistics Manager, Dispatcher, Viewer

### ⚠️ Alert Management
- **10 Alert Types** — Delay, Route Deviation, Temperature Breach, Hazmat Issue, Customs Hold, etc.
- **5 Severity Levels** — Critical, High, Medium, Low, Info
- **Acknowledge Workflow** — acknowledge alerts to clear unacknowledged count
- **Severity Filtering** — filter alerts by severity level
- **Auto-Polling** — refreshes every 30 seconds

### 📊 Operational Analytics
- **Real-time KPIs** — On-Time Rate, Avg Transit Time, At-Risk Count, Delivered Count
- **Volume by Status** — horizontal bar chart of shipment distribution
- **Alerts by Severity** — severity distribution bars
- **Top Carriers** — ranked by shipment count with on-time performance
- **Auto-Refresh** — analytics refresh every 60 seconds

### 🔌 REST API
- Full CRUD for all logistics entities
- Search, filter, pagination for shipments
- Status transitions with history tracking
- Aggregated analytics endpoint

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │Sidebar   │  │Alert Feed│  │Analytics │  │Shipment      │ │
│  │(collaps.)│  │(right    │  │Panel     │  │Detail Panel  │ │
│  │          │  │ panel)   │  │(right    │  │(right panel) │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Cesium 3D Globe (canvas)                    ││
│  │  Truck icons + route polylines + warehouse markers       ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP / REST
┌──────────────────────────▼───────────────────────────────────┐
│                 NEXT.JS API ROUTES                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │/shipments│ │/carriers │ │/warehouses│ │/alerts         │  │
│  │ GET/POST │ │ GET/POST │ │ GET/POST  │ │ GET/POST/PATCH │  │
│  │ PATCH    │ │          │ │          │ │                │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────────────────┐  │
│  │/analytics│ │/customers│ │/shipments/[id]/status       │  │
│  │ GET      │ │ GET/POST │ │ POST                        │  │
│  └──────────┘ └──────────┘ └─────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │ Prisma ORM
┌──────────────────────────▼───────────────────────────────────┐
│                     POSTGRESQL DATABASE                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │organizat.│ │ shipments│ │ carriers │ │ warehouses      │  │
│  │   users  │ │  status  │ │ vehicles │ │ customers       │  │
│  │          │ │ history  │ │ drivers  │ │ alerts          │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Frontend** polls API endpoints at configurable intervals (15s for shipments, 30s for alerts, 60s for analytics)
2. **API Routes** query PostgreSQL via Prisma ORM with filtering, pagination, and relation includes
3. **Cesium Viewer** renders entities as billboards (truck icons), polylines (routes), and pins (warehouses)
4. **User interactions** (click, filter, search) trigger client-side state updates and camera flights

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14.2 (App Router) |
| **Language** | TypeScript 5.2 |
| **3D Globe** | CesiumJS 1.139 |
| **Database** | PostgreSQL + Prisma 6.7 |
| **Styling** | Tailwind CSS 3.3 + shadcn/ui (Radix primitives) |
| **State** | React hooks + Zustand 5 |
| **Auth** | next-auth 4.24 (optional) |
| **Charts** | Chart.js 4 + react-chartjs-2, Recharts |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Yarn (recommended) or npm

### 1. Clone and Install

```bash
git clone https://github.com/BaronTrump/logistix.git
cd logistix
yarn install
```

### 2. Set Up the Database

```bash
# Create a PostgreSQL database
createdb logistix

# Copy and configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run migrations
npx prisma migrate dev --name init

# Seed with sample data
npx prisma db seed
```

### 3. Configure Cesium Token

Get a free Cesium Ion token at https://ion.cesium.com/signup and add it to `.env`:

```bash
NEXT_PUBLIC_CESIUM_ION_TOKEN=your_token_here
DATABASE_URL=postgresql://user:password@localhost:5432/logistix
NEXTAUTH_URL=http://localhost:3000
```

### 4. Start Development

```bash
yarn dev
```

Open **http://localhost:3000** in your browser.

---

## Database Schema

The schema defines **10 models** and **9 enums** across the logistics domain:

### Models

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| `Organization` | Manufacturer + affiliates hierarchy | `name`, `type` (MANUFACTURER/AFFILIATE/SUPPLIER/LOGISTICS_PARTNER), `code` |
| `User` | Platform users with role-based access | `email`, `role` (ADMIN/LOGISTICS_MANAGER/DISPATCHER/VIEWER) |
| `Carrier` | Transport carriers (trucking, rail, ocean, air) | `name`, `scac`, `mcNumber`, `mode`, `rating` |
| `Vehicle` | Individual transport assets | `type` (TRACTOR/TRAILER/REEFER/TANKER/etc.), `plate`, `vin`, `capacityKg` |
| `VehiclePosition` | GPS position pings | `longitude`, `latitude`, `speed`, `heading`, `recordedAt` |
| `Driver` | Vehicle operators | `name`, `licenseNumber`, `phone` |
| `Warehouse` | Facilities and depots | `name`, `type` (MANUFACTURING/DISTRIBUTION/CROSS_DOCK/etc.), `longitude`, `latitude` |
| `Customer` | Shipment recipients | `name`, `code`, `longitude`, `latitude` |
| `Shipment` | Core logistics entity | `shipmentNo`, `status`, `priority`, `weightKg`, `estArrival`, `routeJson`, `isAtRisk` |
| `ShipmentStatusHistory` | Audit trail for status changes | `status`, `changedAt`, `changedBy`, `note` |
| `Alert` | Operational alerts | `type`, `severity`, `title`, `acknowledged` |

### Enums

| Enum | Values |
|------|--------|
| `OrgType` | MANUFACTURER, AFFILIATE, SUPPLIER, LOGISTICS_PARTNER |
| `UserRole` | ADMIN, LOGISTICS_MANAGER, DISPATCHER, VIEWER |
| `TransportMode` | TRUCK, RAIL, OCEAN, AIR, MULTIMODAL |
| `VehicleType` | TRACTOR, TRAILER, STRAIGHT_TRUCK, FLATBED, REEFER, TANKER, BOXCAR, CONTAINER_SHIP, BULKER, CARGO_PLANE |
| `WarehouseType` | MANUFACTURING, DISTRIBUTION, CROSS_DOCK, RAW_MATERIAL, FINISHED_GOODS, FULFILLMENT |
| `ShipmentStatus` | CREATED, BOOKED, PICKED_UP, IN_TRANSIT, AT_RISK, DELAYED, OUT_FOR_DELIVERY, DELIVERED, EXCEPTION, CANCELLED |
| `ShipmentPriority` | RUSH, HIGH, NORMAL, LOW |
| `AlertType` | DELAY, ROUTE_DEVIATION, TEMPERATURE_BREACH, HAZMAT_ISSUE, CUSTOMER_COMPLAINT, CAPACITY_ISSUE, WEATHER_EVENT, DOCUMENT_MISSING, CARRIER_ISSUE, CUSTOMS_HOLD |
| `AlertSeverity` | CRITICAL, HIGH, MEDIUM, LOW, INFO |

### Entity Relationship Diagram

```
Organization 1──N User
Organization 1──N Carrier
Organization 1──N Warehouse
Organization 1──N Shipment

Carrier 1──N Vehicle
Carrier 1──N Shipment

Vehicle 1──N VehiclePosition
Vehicle 1──N Driver
Vehicle 1──N Shipment

Warehouse 1──N Shipment (origin)
Warehouse 1──N Shipment (destination)

Customer 1──N Shipment

Shipment 1──N ShipmentStatusHistory
Shipment 1──N Alert
```

---

## API Reference

All endpoints return JSON. Base path: `/api`

### Shipments

```
GET    /api/shipments          List shipments (with filters)
POST   /api/shipments          Create a new shipment
GET    /api/shipments/[id]     Get shipment detail
PATCH  /api/shipments/[id]     Update shipment
POST   /api/shipments/[id]/status  Update shipment status (with history)
```

**Query Parameters for `GET /api/shipments`:**

| Param | Type | Description |
|-------|------|-------------|
| `orgId` | string | Filter by organization |
| `status` | string | Filter by status (e.g. `IN_TRANSIT`) |
| `carrierId` | string | Filter by carrier |
| `customerId` | string | Filter by customer |
| `search` | string | Search by shipmentNo, poNumber, referenceNo, bolNumber, description |
| `limit` | number | Max results (default 100, max 500) |
| `offset` | number | Pagination offset |

### Carriers

```
GET   /api/carriers    List carriers (filter by orgId, carrierId)
POST  /api/carriers    Create carrier
```

### Warehouses

```
GET   /api/warehouses  List warehouses (filter by orgId, type)
POST  /api/warehouses  Create warehouse
```

### Alerts

```
GET    /api/alerts         List alerts (filter by orgId, acknowledged, severity)
POST   /api/alerts         Create alert
PATCH  /api/alerts/[id]    Acknowledge alert
```

### Analytics

```
GET    /api/analytics      Aggregated KPIs (filter by orgId)
```

**Response shape:**
```json
{
  "totalShipments": 1247,
  "inTransit": 423,
  "delivered": 789,
  "delayed": 18,
  "atRisk": 12,
  "onTimeRate": 94.2,
  "avgTransitHours": 48,
  "volumeByStatus": [
    { "status": "IN_TRANSIT", "count": 423 },
    { "status": "DELIVERED", "count": 789 }
  ],
  "alertsBySeverity": [
    { "severity": "CRITICAL", "count": 3 },
    { "severity": "HIGH", "count": 7 }
  ],
  "topCarriers": [
    { "name": "Swift Logistics", "count": 245, "onTimeRate": 96.2 }
  ],
  "dailyVolume": [
    { "date": "2026-06-01", "count": 42 }
  ]
}
```

---

## Frontend Components

### Core Components

| Component | Location | Description |
|-----------|----------|-------------|
| `LogisticsDashboard` | `components/logistics-dashboard.tsx` | Main layout: Cesium viewer + sidebar + right panels |
| `LogisticsSidebar` | `components/logistics-sidebar.tsx` | Collapsible left panel: search, filters, stats, layers, visual modes |
| `AlertFeed` | `components/alert-feed.tsx` | Right panel: severity-colored alert list with acknowledge |
| `AnalyticsPanel` | `components/analytics-panel.tsx` | Right panel: KPI cards, status bars, carrier rankings |
| `ShipmentDetail` | `components/shipment-detail.tsx` | Right panel: route, timeline, cargo, references |

### Custom Hooks

| Hook | File | Description |
|------|------|-------------|
| `useShipmentTracking` | `hooks/use-shipment-tracking.ts` | Polls shipments API, renders Cesium entities (truck icons, route polylines) |
| `useAlertFeed` | `hooks/use-alert-feed.ts` | Polls alerts API, provides acknowledge action |
| `useLogisticsAnalytics` | `hooks/use-logistics-analytics.ts` | Polls analytics API for aggregated KPIs |
| `useWarehouses` | `hooks/use-warehouses.ts` | Fetches and renders warehouse markers |

### UI Component Library

70+ shadcn/ui components at `components/ui/` including buttons, cards, dialogs, dropdowns, tables, tabs, toasts, etc.

### Layer Controls

The sidebar provides toggle switches for 5 map layers:

| Layer | Visibility | Description |
|-------|-----------|-------------|
| Shipments | Default ON | Truck icons on globe, color-coded by status |
| Warehouses | Default ON | Purple pin markers for facilities |
| Routes | Default ON | Dashed polylines from origin to destination |
| Alerts | Default OFF | Alert indicators on globe (locations) |
| Heatmap | Default OFF | Density heatmap of shipment volumes |

---

## Deployment

### Development

```bash
yarn dev
```

Runs on `http://localhost:3000` with hot module replacement.

### Production (Docker)

```bash
# Build the image
docker build -t logistix .

# Run with PostgreSQL
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:password@host:5432/logistix \
  -e NEXT_PUBLIC_CESIUM_ION_TOKEN=your_token \
  logistix
```

### Production (systemd)

```ini
[Unit]
Description=LOGISTIX Supply Chain Intelligence
After=network.target postgresql.service

[Service]
WorkingDirectory=/opt/logistix
ExecStart=/usr/bin/yarn start
Restart=always
User=logistix
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgresql://user:password@localhost:5432/logistix
Environment=NEXT_PUBLIC_CESIUM_ION_TOKEN=your_token
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now logistix
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name logistix.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `NEXT_PUBLIC_CESIUM_ION_TOKEN` | No | — | Cesium Ion access token (for Google 3D Tiles) |
| `NEXTAUTH_URL` | No | `http://localhost:3000` | NextAuth URL (for auth) |
| `PORT` | No | `3000` | Server port |

### Display Configuration

- **Visual modes** — Normal, Night Vision, Thermal, CRT — selectable from sidebar
- **Map layers** — Toggle shipments, warehouses, routes, alerts, heatmap
- **Status filters** — Quick-filter shipments by current lifecycle status
- **Preset locations** — 5 global hubs + key industrial cities in `logistics-dashboard.tsx`

---

## Data Ingestion

### Via API

```bash
# Create a shipment
curl -X POST http://localhost:3000/api/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "shipmentNo": "SHIP-2026-0001",
    "organizationId": "org_001",
    "originWarehouseId": "wh_001",
    "destWarehouseId": "wh_002",
    "carrierId": "carrier_001",
    "description": "Engine blocks - Detroit to Hamburg",
    "weightKg": 24000,
    "pieceCount": 120,
    "estDeparture": "2026-06-20T08:00:00Z",
    "estArrival": "2026-06-28T14:00:00Z",
    "poNumber": "PO-2026-4512"
  }'

# Update status (with history tracking)
curl -X POST http://localhost:3000/api/shipments/shp_001/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_TRANSIT",
    "changedBy": "dispatcher@company.com",
    "note": "Picked up from Detroit warehouse"
  }'
```

### Via CSV Import

The project includes `csv` (6.3.11) as a dependency. Import logic can be added via the UI or a custom script using the API.

### Via GPS Integration

Vehicle positions are stored in `VehiclePosition` and can be ingested via:
```bash
curl -X POST http://localhost:3000/api/vehicles/vehicle_001/position \
  -H "Content-Type: application/json" \
  -d '{
    "longitude": -83.0458,
    "latitude": 42.3314,
    "speed": 65.0,
    "heading": 90.0
  }'
```

(Note: dedicated vehicle position endpoint can be added following the existing API pattern.)

---

## Multi-Affiliate Architecture

LOGISTIX is built for manufacturers with multiple subsidiaries, contract manufacturers, and logistics partners.

### Organization Types

| Type | Description |
|------|-------------|
| **MANUFACTURER** | Primary organization — owns the supply chain |
| **AFFILIATE** | Subsidiary or sister company |
| **SUPPLIER** | Tier 1/Tier 2 supplier |
| **LOGISTICS_PARTNER** | 3PL, freight forwarder, customs broker |

### Data Isolation

All entities are scoped by `organizationId`. A manufacturer can see:
- Its own shipments, carriers, warehouses
- Affiliates' shipments (via cross-org queries)
- Logistics partners' performance metrics

### User Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full CRUD, user management, org config |
| **LOGISTICS_MANAGER** | Shipment management, alert acknowledge, analytics |
| **DISPATCHER** | Status updates, basic viewing |
| **VIEWER** | Read-only access to assigned org |

---

## Roadmap

### Phase 1 — Core Platform (Complete)
- [x] 3D Cesium globe with real-time shipment visualization
- [x] Multi-affiliate organization hierarchy (manufacturer + affiliates)
- [x] Alert management with severity routing and acknowledgement
- [x] Operational analytics dashboard (KPIs, charts, carrier performance)
- [x] REST API for all logistics entities (shipments, carriers, warehouses, alerts)
- [x] PostgreSQL + Prisma schema with 10 models, 10 enums, full relations
- [x] Collapsible sidebar with status filtering, layer toggles, visual modes
- [x] Shipment detail panel with route, timeline, cargo, and references
- [x] Cesium entity rendering (truck billboards, warehouse pins, route polylines)
- [x] Location search with Nominatim geocoding fallback
- [x] Seed script with 50 realistic shipments across 10 US logistics hubs
- [x] Docker Compose for PostgreSQL + production-ready app deployment
- [x] Dark theme throughout (inherited from HORUS base)

### Phase 2 — Real-Time & Live Data (Q3 2026)
- [ ] WebSocket/SSE streaming (replace 15s/30s polling)
- [ ] GPS/ELD device integration (Samsara, Geotab, KeepTruckin APIs)
- [ ] Live vehicle position pings on globe with speed/heading indicators
- [ ] Geofencing engine — automated entry/exit alerts for warehouses, ports, yards
- [ ] SMS/email/push notification routing for unacknowledged CRITICAL/HIGH alerts
- [ ] Simulated GPS drift for demo/training mode
- [ ] Historical playback mode (replay shipments along route with timeline scrubber)

### Phase 3 — Intelligence & Optimization (Q4 2026)
- [ ] ML-powered ETA prediction (historical transit time + weather + traffic features)
- [ ] Route optimization engine (multi-stop TSP with time windows)
- [ ] Dynamic re-routing on alert trigger (auto-suggest alternative carriers/routes)
- [ ] Anomaly detection — flag unusual dwell times, route deviations, late pickups
- [ ] Carrier scorecard: on-time %, damage rate, cost-per-mile, compliance rating
- [ ] Capacity forecasting — predict warehouse slot and carrier availability
- [ ] What-if simulation — model disruption impacts (port strike, weather, carrier failure)

### Phase 4 — Multi-Modal & Extended Tracking (Q1 2027)
- [ ] Ocean container tracking (API integration with Project44/FourKites)
- [ ] Air freight tracking (IATA Cargo-XML integration)
- [ ] Rail shipment visibility (railroad EDI 404/419 integration)
- [ ] Intermodal journey view — single shipment spanning truck → rail → ocean
- [ ] Cross-border/customs status tracking (ACE/ACI integration)
- [ ] Driver hours-of-service (HOS) compliance dashboard
- [ ] Temperature and humidity monitoring for cold chain (IoT sensor overlay)

### Phase 5 — Integration & Ecosystem (Q2 2027)
- [ ] ERP integration adapters: SAP S/4HANA, Oracle JD Edwards, Microsoft Dynamics 365
- [ ] EDI 204/210/214/990 support for carrier load tendering and status
- [ ] CSV/Excel bulk upload with column mapping wizard
- [ ] Public REST API with API keys, rate limiting, and developer portal
- [ ] Webhook system — notify external systems on shipment status changes
- [ ] SSO/SAML authentication for enterprise customers
- [ ] Role-based access control (RBAC) with per-affiliate data isolation

### Phase 6 — Mobile & Edge (Q3 2027)
- [ ] React Native driver mobile app — GPS broadcast, HOS logging, proof-of-delivery
- [ ] Customer-facing tracking portal — share link with real-time ETA
- [ ] Barcode/RFID scanning for yard check-in/check-out
- [ ] Offline-first mode for warehouse yard operations
- [ ] Push notifications for alert escalation
- [ ] Dark mode / light mode toggle

### Future (Long-Term)
- [ ] Automated freight audit and pay (match rate-con-bill-payment)
- [ ] Carrier rate comparison marketplace
- [ ] Carbon emissions tracking per shipment (EPA SmartWay models)
- [ ] Digital twin — full facility and yard layout in 3D
- [ ] Document management (BOL, POD, invoices) with OCR extraction
- [ ] Multi-language support (i18n) — Spanish, Mandarin, German, Portuguese
- [ ] Fleet maintenance scheduler (integrate with telematics for predictive maintenance)
- [ ] Public status page for customers (real-time shipment tracking without login)
- [ ] Community plugin system for custom data sources and visualizations

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <br/>
  <p>
    <a href="https://github.com/BaronTrump/logistix/issues">Report Bug</a>
    ·
    <a href="https://github.com/BaronTrump/logistix/issues">Request Feature</a>
  </p>
  <p>
    Built for industrial manufacturers who need to <strong>see</strong> their supply chain.
  </p>
</div>
