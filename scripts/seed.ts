import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding LOGISTIX database...');

  // Clean existing data
  await prisma.alert.deleteMany();
  await prisma.shipmentStatusHistory.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.vehiclePosition.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.carrier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // ── Organizations ──
  const apexMfg = await prisma.organization.create({
    data: { name: 'Apex Manufacturing Co.', type: 'MANUFACTURER', code: 'APEX', domain: 'apexmfg.com' },
  });
  const apexLogistics = await prisma.organization.create({
    data: { name: 'Apex Logistics LLC', type: 'AFFILIATE', code: 'APEXLOG', domain: 'apexlogistics.com' },
  });

  // ── Carriers ──
  const carriers = await Promise.all([
    prisma.carrier.create({ data: { name: 'SwiftLine Trucking', scac: 'SWFT', mcNumber: 'MC-48291', mode: 'TRUCK', organizationId: apexLogistics.id, rating: 4.5 } }),
    prisma.carrier.create({ data: { name: 'National Rail Freight', scac: 'NLRF', mcNumber: 'MC-37102', mode: 'RAIL', organizationId: apexLogistics.id, rating: 4.2 } }),
    prisma.carrier.create({ data: { name: 'Global Ocean Lines', scac: 'GOLN', mcNumber: 'MC-20384', mode: 'OCEAN', organizationId: apexLogistics.id, rating: 3.9 } }),
    prisma.carrier.create({ data: { name: 'AirCargo Express', scac: 'ACEX', mcNumber: 'MC-55917', mode: 'AIR', organizationId: apexMfg.id, rating: 4.8 } }),
    prisma.carrier.create({ data: { name: 'TransGlobe Logistics', scac: 'TGLO', mcNumber: 'MC-66432', mode: 'MULTIMODAL', organizationId: apexMfg.id, rating: 4.1 } }),
  ]);

  const [swiftline, nationalRail, globalOcean, airCargo, transGlobe] = carriers;

  // ── Vehicles ──
  const vehicles = await Promise.all([
    prisma.vehicle.create({ data: { carrierId: swiftline.id, organizationId: apexLogistics.id, type: 'TRACTOR', plate: 'TL-1402', vin: '1HTMKAAN8PH123456', capacityKg: 20000, capacityM3: 70 } }),
    prisma.vehicle.create({ data: { carrierId: swiftline.id, organizationId: apexLogistics.id, type: 'TRAILER', plate: 'TL-1402-T', vin: '1JJV532D6KL789012', capacityKg: 22000, capacityM3: 85 } }),
    prisma.vehicle.create({ data: { carrierId: swiftline.id, organizationId: apexLogistics.id, type: 'TRACTOR', plate: 'TL-1805', vin: '1HTMKAAN8PH123457', capacityKg: 20000, capacityM3: 70 } }),
    prisma.vehicle.create({ data: { carrierId: swiftline.id, organizationId: apexLogistics.id, type: 'REEFER', plate: 'RF-2201', vin: '1XPTD482XKD123456', capacityKg: 18000, capacityM3: 60 } }),
    prisma.vehicle.create({ data: { carrierId: swiftline.id, organizationId: apexLogistics.id, type: 'FLATBED', plate: 'FB-0911', vin: '2MKKGMDJ8LJ345678', capacityKg: 24000, capacityM3: 90 } }),
    prisma.vehicle.create({ data: { carrierId: nationalRail.id, organizationId: apexLogistics.id, type: 'BOXCAR', vin: 'RRL-440239', capacityKg: 70000, capacityM3: 200 } }),
    prisma.vehicle.create({ data: { carrierId: nationalRail.id, organizationId: apexLogistics.id, type: 'BOXCAR', vin: 'RRL-440240', capacityKg: 70000, capacityM3: 200 } }),
    prisma.vehicle.create({ data: { carrierId: globalOcean.id, organizationId: apexLogistics.id, type: 'CONTAINER_SHIP', vin: 'IMO-9834721', capacityKg: 100000, capacityM3: 5000 } }),
    prisma.vehicle.create({ data: { carrierId: airCargo.id, organizationId: apexMfg.id, type: 'CARGO_PLANE', vin: 'N-472AC', capacityKg: 50000, capacityM3: 300 } }),
    prisma.vehicle.create({ data: { carrierId: transGlobe.id, organizationId: apexMfg.id, type: 'TRACTOR', plate: 'TG-7703', vin: '3AKJGBD98KL567890', capacityKg: 20000, capacityM3: 70 } }),
  ]);

  // ── Drivers ──
  const drivers = await Promise.all([
    prisma.driver.create({ data: { name: 'Marcus Johnson', licenseNumber: 'CDL-A-48291', phone: '+1-313-555-0142', email: 'marcus.johnson@swiftline.com', organizationId: apexLogistics.id, carrierId: swiftline.id, vehicleId: vehicles[0].id } }),
    prisma.driver.create({ data: { name: 'Emily Torres', licenseNumber: 'CDL-A-48292', phone: '+1-313-555-0187', email: 'emily.torres@swiftline.com', organizationId: apexLogistics.id, carrierId: swiftline.id, vehicleId: vehicles[2].id } }),
    prisma.driver.create({ data: { name: 'Carlos Rivera', licenseNumber: 'CDL-A-67103', phone: '+1-213-555-0331', email: 'carlos.rivera@swiftline.com', organizationId: apexLogistics.id, carrierId: swiftline.id, vehicleId: vehicles[3].id } }),
    prisma.driver.create({ data: { name: 'Sarah Chen', licenseNumber: 'CDL-A-99014', phone: '+1-312-555-0229', email: 'sarah.chen@transglobe.com', organizationId: apexMfg.id, carrierId: transGlobe.id, vehicleId: vehicles[9].id } }),
  ]);

  // ── Warehouses (major logistics hubs) ──
  const warehouses = await Promise.all([
    prisma.warehouse.create({ data: { name: 'Apex Detroit Plant', code: 'DET-01', type: 'MANUFACTURING', organizationId: apexMfg.id, address: '2500 Chrysler Dr', city: 'Detroit', state: 'MI', country: 'US', longitude: -83.0458, latitude: 42.3314, capacityM2: 15000 } }),
    prisma.warehouse.create({ data: { name: 'Apex Chicago DC', code: 'CHI-01', type: 'DISTRIBUTION', organizationId: apexLogistics.id, address: '4500 W 47th St', city: 'Chicago', state: 'IL', country: 'US', longitude: -87.6391, latitude: 41.8086, capacityM2: 25000 } }),
    prisma.warehouse.create({ data: { name: 'Apex Los Angeles DC', code: 'LAX-01', type: 'DISTRIBUTION', organizationId: apexLogistics.id, address: '1200 E Sepulveda Blvd', city: 'Los Angeles', state: 'CA', country: 'US', longitude: -118.2437, latitude: 33.9425, capacityM2: 30000 } }),
    prisma.warehouse.create({ data: { name: 'Apex Savannah Cross-Dock', code: 'SAV-01', type: 'CROSS_DOCK', organizationId: apexLogistics.id, address: '100 Port Terminal Rd', city: 'Savannah', state: 'GA', country: 'US', longitude: -81.0998, latitude: 32.0835, capacityM2: 12000 } }),
    prisma.warehouse.create({ data: { name: 'Apex Houston Raw Materials', code: 'HOU-01', type: 'RAW_MATERIAL', organizationId: apexMfg.id, address: '8800 East Fwy', city: 'Houston', state: 'TX', country: 'US', longitude: -95.3698, latitude: 29.7604, capacityM2: 20000 } }),
    prisma.warehouse.create({ data: { name: 'Apex Newark FG', code: 'EWR-01', type: 'FINISHED_GOODS', organizationId: apexMfg.id, address: '200 Port Newark Ave', city: 'Newark', state: 'NJ', country: 'US', longitude: -74.1724, latitude: 40.7357, capacityM2: 18000 } }),
    prisma.warehouse.create({ data: { name: 'Apex Dallas DC', code: 'DFW-01', type: 'DISTRIBUTION', organizationId: apexLogistics.id, address: '3000 Regent Blvd', city: 'Dallas', state: 'TX', country: 'US', longitude: -96.7970, latitude: 32.7767, capacityM2: 22000 } }),
    prisma.warehouse.create({ data: { name: 'Apex Seattle DC', code: 'SEA-01', type: 'DISTRIBUTION', organizationId: apexLogistics.id, address: '1500 6th Ave S', city: 'Seattle', state: 'WA', country: 'US', longitude: -122.3321, latitude: 47.6062, capacityM2: 16000 } }),
    prisma.warehouse.create({ data: { name: 'Apex Memphis Hub', code: 'MEM-01', type: 'CROSS_DOCK', organizationId: apexLogistics.id, address: '2800 Democrat Rd', city: 'Memphis', state: 'TN', country: 'US', longitude: -89.9718, latitude: 35.1495, capacityM2: 35000 } }),
    prisma.warehouse.create({ data: { name: 'Apex Miami Fulfillment', code: 'MIA-01', type: 'FULFILLMENT', organizationId: apexLogistics.id, address: '7500 NW 25th St', city: 'Miami', state: 'FL', country: 'US', longitude: -80.1918, latitude: 25.7617, capacityM2: 14000 } }),
  ]);

  const [detroit, chicago, losAngeles, savannah, houston, newark, dallas, seattle, memphis, miami] = warehouses;

  // ── Customers ──
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'Precision Auto Parts Inc.', code: 'PAP-001', address: '500 Industrial Pkwy', city: 'Toledo', state: 'OH', country: 'US', longitude: -83.5552, latitude: 41.6515 } }),
    prisma.customer.create({ data: { name: 'BuildRight Construction Supply', code: 'BRC-002', address: '1200 Commerce Blvd', city: 'Phoenix', state: 'AZ', country: 'US', longitude: -112.0740, latitude: 33.4484 } }),
    prisma.customer.create({ data: { name: 'MedCore Devices LLC', code: 'MCD-003', address: '8800 Healthway Dr', city: 'Minneapolis', state: 'MN', country: 'US', longitude: -93.2650, latitude: 44.9778 } }),
    prisma.customer.create({ data: { name: 'GreenField Agriculture Co.', code: 'GFA-004', address: '4500 Farm Rd', city: 'Fresno', state: 'CA', country: 'US', longitude: -119.7726, latitude: 36.7468 } }),
    prisma.customer.create({ data: { name: 'Titan Aerospace Corp.', code: 'TAC-005', address: '1000 Innovation Way', city: 'Wichita', state: 'KS', country: 'US', longitude: -97.3301, latitude: 37.6872 } }),
  ]);

  // ── Route helper ──
  const routeJson = (from: { lng: number; lat: number }, to: { lng: number; lat: number }): Record<string, unknown> => ({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: [[from.lng, from.lat], [to.lng, to.lat]] },
    properties: {},
  });

  // ── Shipments (50) ──
  const now = new Date();
  const shipments: Array<{ id: string; shipmentNo: string; originId: string; destId: string; carrierId: string; vehicleId: string; customerId: string; orgId: string; status: string; priority: string; description: string; weight: number; volume: number; pieces: number; hazmat: boolean; estDeparture: Date; estArrival: Date; actualDeparture: Date | null; actualArrival: Date | null; transitMin: number | null; route: any; freightCharge: number; refNo: string; poNo: string; bolNo: string; isAtRisk: boolean; riskReason: string | null }> = [
    // In Transit (15 shipments)
    { id: 's001', shipmentNo: 'SH-2024-0001', originId: detroit.id, destId: chicago.id, carrierId: swiftline.id, vehicleId: vehicles[0].id, customerId: customers[0].id, orgId: apexMfg.id, status: 'IN_TRANSIT', priority: 'HIGH', description: 'Engine blocks - Precision Auto Parts', weight: 12400, volume: 35, pieces: 240, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 2), estArrival: new Date(now.getTime() + 86400000 * 1), actualDeparture: new Date(now.getTime() - 86400000 * 2), actualArrival: null, transitMin: null, route: routeJson({ lng: -83.0458, lat: 42.3314 }, { lng: -87.6391, lat: 41.8086 }), freightCharge: 4200, refNo: 'REF-AP-001', poNo: 'PO-2024-101', bolNo: 'BOL-2024-001', isAtRisk: false, riskReason: null },
    { id: 's002', shipmentNo: 'SH-2024-0002', originId: chicago.id, destId: losAngeles.id, carrierId: nationalRail.id, vehicleId: vehicles[5].id, customerId: customers[1].id, orgId: apexMfg.id, status: 'IN_TRANSIT', priority: 'NORMAL', description: 'Steel beams - BuildRight Construction', weight: 45000, volume: 120, pieces: 80, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 3), estArrival: new Date(now.getTime() + 86400000 * 4), actualDeparture: new Date(now.getTime() - 86400000 * 3), actualArrival: null, transitMin: null, route: routeJson({ lng: -87.6391, lat: 41.8086 }, { lng: -118.2437, lat: 33.9425 }), freightCharge: 12800, refNo: 'REF-AP-002', poNo: 'PO-2024-102', bolNo: 'BOL-2024-002', isAtRisk: false, riskReason: null },
    { id: 's003', shipmentNo: 'SH-2024-0003', originId: losAngeles.id, destId: savannah.id, carrierId: globalOcean.id, vehicleId: vehicles[7].id, customerId: customers[2].id, orgId: apexMfg.id, status: 'IN_TRANSIT', priority: 'NORMAL', description: 'Medical device components - MedCore', weight: 22000, volume: 85, pieces: 120, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 5), estArrival: new Date(now.getTime() + 86400000 * 7), actualDeparture: new Date(now.getTime() - 86400000 * 5), actualArrival: null, transitMin: null, route: routeJson({ lng: -118.2437, lat: 33.9425 }, { lng: -81.0998, lat: 32.0835 }), freightCharge: 18500, refNo: 'REF-AP-003', poNo: 'PO-2024-103', bolNo: 'BOL-2024-003', isAtRisk: false, riskReason: null },
    { id: 's004', shipmentNo: 'SH-2024-0004', originId: houston.id, destId: dallas.id, carrierId: swiftline.id, vehicleId: vehicles[2].id, customerId: customers[3].id, orgId: apexMfg.id, status: 'IN_TRANSIT', priority: 'RUSH', description: 'Irrigation pumps - GreenField Agriculture', weight: 8500, volume: 28, pieces: 60, hazmat: false, estDeparture: new Date(now.getTime() - 43200000), estArrival: new Date(now.getTime() + 43200000), actualDeparture: new Date(now.getTime() - 43200000), actualArrival: null, transitMin: null, route: routeJson({ lng: -95.3698, lat: 29.7604 }, { lng: -96.7970, lat: 32.7767 }), freightCharge: 2800, refNo: 'REF-AP-004', poNo: 'PO-2024-104', bolNo: 'BOL-2024-004', isAtRisk: true, riskReason: 'Severe thunderstorm warning along I-45 corridor' },
    { id: 's005', shipmentNo: 'SH-2024-0005', originId: newark.id, destId: memphis.id, carrierId: transGlobe.id, vehicleId: vehicles[9].id, customerId: customers[4].id, orgId: apexMfg.id, status: 'IN_TRANSIT', priority: 'HIGH', description: 'Titanium alloy sheets - Titan Aerospace', weight: 16000, volume: 45, pieces: 200, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 1), estArrival: new Date(now.getTime() + 86400000 * 2), actualDeparture: new Date(now.getTime() - 86400000 * 1), actualArrival: null, transitMin: null, route: routeJson({ lng: -74.1724, lat: 40.7357 }, { lng: -89.9718, lat: 35.1495 }), freightCharge: 5600, refNo: 'REF-AP-005', poNo: 'PO-2024-105', bolNo: 'BOL-2024-005', isAtRisk: false, riskReason: null },
    { id: 's006', shipmentNo: 'SH-2024-0006', originId: chicago.id, destId: detroit.id, carrierId: swiftline.id, vehicleId: vehicles[3].id, customerId: customers[0].id, orgId: apexMfg.id, status: 'IN_TRANSIT', priority: 'NORMAL', description: 'Refrigerated automotive coatings', weight: 9200, volume: 40, pieces: 180, hazmat: true, estDeparture: new Date(now.getTime() - 86400000 * 1), estArrival: new Date(now.getTime() + 86400000 * 1), actualDeparture: new Date(now.getTime() - 86400000 * 1), actualArrival: null, transitMin: null, route: routeJson({ lng: -87.6391, lat: 41.8086 }, { lng: -83.0458, lat: 42.3314 }), freightCharge: 3800, refNo: 'REF-AP-006', poNo: 'PO-2024-106', bolNo: 'BOL-2024-006', isAtRisk: true, riskReason: 'Temperature breach alert - reefer unit cycling' },
    { id: 's007', shipmentNo: 'SH-2024-0007', originId: seattle.id, destId: losAngeles.id, carrierId: nationalRail.id, vehicleId: vehicles[6].id, customerId: customers[3].id, orgId: apexMfg.id, status: 'IN_TRANSIT', priority: 'LOW', description: 'Bulk fertilizer - GreenField Agriculture', weight: 68000, volume: 180, pieces: 1, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 4), estArrival: new Date(now.getTime() + 86400000 * 2), actualDeparture: new Date(now.getTime() - 86400000 * 4), actualArrival: null, transitMin: null, route: routeJson({ lng: -122.3321, lat: 47.6062 }, { lng: -118.2437, lat: 33.9425 }), freightCharge: 9400, refNo: 'REF-AP-007', poNo: 'PO-2024-107', bolNo: 'BOL-2024-007', isAtRisk: false, riskReason: null },
    { id: 's008', shipmentNo: 'SH-2024-0008', originId: dallas.id, destId: miami.id, carrierId: swiftline.id, vehicleId: vehicles[4].id, customerId: customers[1].id, orgId: apexLogistics.id, status: 'IN_TRANSIT', priority: 'NORMAL', description: 'Construction equipment - flatbed', weight: 21000, volume: 80, pieces: 12, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 1), estArrival: new Date(now.getTime() + 86400000 * 2), actualDeparture: new Date(now.getTime() - 86400000 * 1), actualArrival: null, transitMin: null, route: routeJson({ lng: -96.7970, lat: 32.7767 }, { lng: -80.1918, lat: 25.7617 }), freightCharge: 4800, refNo: 'REF-AP-008', poNo: 'PO-2024-108', bolNo: 'BOL-2024-008', isAtRisk: false, riskReason: null },
    { id: 's009', shipmentNo: 'SH-2024-0009', originId: detroit.id, destId: newark.id, carrierId: swiftline.id, vehicleId: vehicles[0].id, customerId: customers[4].id, orgId: apexMfg.id, status: 'IN_TRANSIT', priority: 'HIGH', description: 'Aerospace-grade aluminum panels', weight: 14000, volume: 38, pieces: 160, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 2), estArrival: new Date(now.getTime() + 86400000 * 1), actualDeparture: new Date(now.getTime() - 86400000 * 2), actualArrival: null, transitMin: null, route: routeJson({ lng: -83.0458, lat: 42.3314 }, { lng: -74.1724, lat: 40.7357 }), freightCharge: 5100, refNo: 'REF-AP-009', poNo: 'PO-2024-109', bolNo: 'BOL-2024-009', isAtRisk: false, riskReason: null },
    { id: 's010', shipmentNo: 'SH-2024-0010', originId: memphis.id, destId: chicago.id, carrierId: transGlobe.id, vehicleId: vehicles[9].id, customerId: customers[2].id, orgId: apexLogistics.id, status: 'IN_TRANSIT', priority: 'RUSH', description: 'Temperature-sensitive lab equipment', weight: 3200, volume: 15, pieces: 45, hazmat: false, estDeparture: new Date(now.getTime() - 21600000), estArrival: new Date(now.getTime() + 64800000), actualDeparture: new Date(now.getTime() - 21600000), actualArrival: null, transitMin: null, route: routeJson({ lng: -89.9718, lat: 35.1495 }, { lng: -87.6391, lat: 41.8086 }), freightCharge: 3200, refNo: 'REF-AP-010', poNo: 'PO-2024-110', bolNo: 'BOL-2024-010', isAtRisk: false, riskReason: null },
    { id: 's011', shipmentNo: 'SH-2024-0011', originId: miami.id, destId: savannah.id, carrierId: swiftline.id, vehicleId: vehicles[2].id, customerId: customers[0].id, orgId: apexLogistics.id, status: 'IN_TRANSIT', priority: 'NORMAL', description: 'Auto parts - return shipment', weight: 6800, volume: 22, pieces: 90, hazmat: false, estDeparture: new Date(now.getTime() - 43200000), estArrival: new Date(now.getTime() + 43200000), actualDeparture: new Date(now.getTime() - 43200000), actualArrival: null, transitMin: null, route: routeJson({ lng: -80.1918, lat: 25.7617 }, { lng: -81.0998, lat: 32.0835 }), freightCharge: 2400, refNo: 'REF-AP-011', poNo: 'PO-2024-111', bolNo: 'BOL-2024-011', isAtRisk: false, riskReason: null },
    { id: 's012', shipmentNo: 'SH-2024-0012', originId: houston.id, destId: seattle.id, carrierId: nationalRail.id, vehicleId: vehicles[5].id, customerId: customers[3].id, orgId: apexMfg.id, status: 'IN_TRANSIT', priority: 'LOW', description: 'Raw steel coils', weight: 72000, volume: 190, pieces: 24, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 6), estArrival: new Date(now.getTime() + 86400000 * 2), actualDeparture: new Date(now.getTime() - 86400000 * 6), actualArrival: null, transitMin: null, route: routeJson({ lng: -95.3698, lat: 29.7604 }, { lng: -122.3321, lat: 47.6062 }), freightCharge: 15600, refNo: 'REF-AP-012', poNo: 'PO-2024-112', bolNo: 'BOL-2024-012', isAtRisk: true, riskReason: 'Rail congestion reported at Denver junction' },
    { id: 's013', shipmentNo: 'SH-2024-0013', originId: losAngeles.id, destId: dallas.id, carrierId: swiftline.id, vehicleId: vehicles[4].id, customerId: customers[1].id, orgId: apexLogistics.id, status: 'IN_TRANSIT', priority: 'NORMAL', description: 'Scaffolding and steel piping', weight: 19500, volume: 75, pieces: 200, hazmat: false, estDeparture: new Date(now.getTime() - 72000000), estArrival: new Date(now.getTime() + 72000000), actualDeparture: new Date(now.getTime() - 72000000), actualArrival: null, transitMin: null, route: routeJson({ lng: -118.2437, lat: 33.9425 }, { lng: -96.7970, lat: 32.7767 }), freightCharge: 4500, refNo: 'REF-AP-013', poNo: 'PO-2024-113', bolNo: 'BOL-2024-013', isAtRisk: false, riskReason: null },
    { id: 's014', shipmentNo: 'SH-2024-0014', originId: chicago.id, destId: memphis.id, carrierId: transGlobe.id, vehicleId: vehicles[9].id, customerId: customers[2].id, orgId: apexLogistics.id, status: 'IN_TRANSIT', priority: 'HIGH', description: 'Pharmaceutical-grade packaging materials', weight: 5400, volume: 30, pieces: 320, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 1), estArrival: new Date(now.getTime() + 86400000 * 1), actualDeparture: new Date(now.getTime() - 86400000 * 1), actualArrival: null, transitMin: null, route: routeJson({ lng: -87.6391, lat: 41.8086 }, { lng: -89.9718, lat: 35.1495 }), freightCharge: 3400, refNo: 'REF-AP-014', poNo: 'PO-2024-114', bolNo: 'BOL-2024-014', isAtRisk: false, riskReason: null },
    { id: 's015', shipmentNo: 'SH-2024-0015', originId: newark.id, destId: miami.id, carrierId: swiftline.id, vehicleId: vehicles[3].id, customerId: customers[0].id, orgId: apexMfg.id, status: 'IN_TRANSIT', priority: 'NORMAL', description: 'Refrigerated auto parts - temperature controlled', weight: 11000, volume: 42, pieces: 150, hazmat: true, estDeparture: new Date(now.getTime() - 10800000), estArrival: new Date(now.getTime() + 81000000), actualDeparture: new Date(now.getTime() - 10800000), actualArrival: null, transitMin: null, route: routeJson({ lng: -74.1724, lat: 40.7357 }, { lng: -80.1918, lat: 25.7617 }), freightCharge: 5200, refNo: 'REF-AP-015', poNo: 'PO-2024-115', bolNo: 'BOL-2024-015', isAtRisk: false, riskReason: null },

    // Delivered (10 shipments)
    { id: 's016', shipmentNo: 'SH-2024-0016', originId: detroit.id, destId: chicago.id, carrierId: swiftline.id, vehicleId: vehicles[0].id, customerId: customers[0].id, orgId: apexMfg.id, status: 'DELIVERED', priority: 'NORMAL', description: 'Transmission assemblies - Precision Auto Parts', weight: 9800, volume: 30, pieces: 120, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 10), estArrival: new Date(now.getTime() - 86400000 * 8), actualDeparture: new Date(now.getTime() - 86400000 * 10), actualArrival: new Date(now.getTime() - 86400000 * 8), transitMin: 2880, route: routeJson({ lng: -83.0458, lat: 42.3314 }, { lng: -87.6391, lat: 41.8086 }), freightCharge: 3800, refNo: 'REF-AP-016', poNo: 'PO-2024-116', bolNo: 'BOL-2024-016', isAtRisk: false, riskReason: null },
    { id: 's017', shipmentNo: 'SH-2024-0017', originId: chicago.id, destId: dallas.id, carrierId: swiftline.id, vehicleId: vehicles[2].id, customerId: customers[1].id, orgId: apexMfg.id, status: 'DELIVERED', priority: 'HIGH', description: 'Prefabricated steel trusses', weight: 24000, volume: 90, pieces: 40, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 12), estArrival: new Date(now.getTime() - 86400000 * 9), actualDeparture: new Date(now.getTime() - 86400000 * 12), actualArrival: new Date(now.getTime() - 86400000 * 9), transitMin: 4320, route: routeJson({ lng: -87.6391, lat: 41.8086 }, { lng: -96.7970, lat: 32.7767 }), freightCharge: 6200, refNo: 'REF-AP-017', poNo: 'PO-2024-117', bolNo: 'BOL-2024-017', isAtRisk: false, riskReason: null },
    { id: 's018', shipmentNo: 'SH-2024-0018', originId: losAngeles.id, destId: seattle.id, carrierId: nationalRail.id, vehicleId: vehicles[6].id, customerId: customers[3].id, orgId: apexMfg.id, status: 'DELIVERED', priority: 'LOW', description: 'Fertilizer - bulk rail shipment', weight: 70000, volume: 200, pieces: 1, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 14), estArrival: new Date(now.getTime() - 86400000 * 10), actualDeparture: new Date(now.getTime() - 86400000 * 14), actualArrival: new Date(now.getTime() - 86400000 * 10), transitMin: 5760, route: routeJson({ lng: -118.2437, lat: 33.9425 }, { lng: -122.3321, lat: 47.6062 }), freightCharge: 8800, refNo: 'REF-AP-018', poNo: 'PO-2024-118', bolNo: 'BOL-2024-018', isAtRisk: false, riskReason: null },
    { id: 's019', shipmentNo: 'SH-2024-0019', originId: houston.id, destId: newark.id, carrierId: globalOcean.id, vehicleId: vehicles[7].id, customerId: customers[4].id, orgId: apexMfg.id, status: 'DELIVERED', priority: 'NORMAL', description: 'Chemical precursors - Titan Aerospace', weight: 35000, volume: 100, pieces: 80, hazmat: true, estDeparture: new Date(now.getTime() - 86400000 * 20), estArrival: new Date(now.getTime() - 86400000 * 12), actualDeparture: new Date(now.getTime() - 86400000 * 20), actualArrival: new Date(now.getTime() - 86400000 * 12), transitMin: 11520, route: routeJson({ lng: -95.3698, lat: 29.7604 }, { lng: -74.1724, lat: 40.7357 }), freightCharge: 22000, refNo: 'REF-AP-019', poNo: 'PO-2024-119', bolNo: 'BOL-2024-019', isAtRisk: false, riskReason: null },
    { id: 's020', shipmentNo: 'SH-2024-0020', originId: dallas.id, destId: chicago.id, carrierId: swiftline.id, vehicleId: vehicles[4].id, customerId: customers[1].id, orgId: apexLogistics.id, status: 'DELIVERED', priority: 'NORMAL', description: 'Heavy machinery components', weight: 18000, volume: 65, pieces: 30, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 7), estArrival: new Date(now.getTime() - 86400000 * 5), actualDeparture: new Date(now.getTime() - 86400000 * 7), actualArrival: new Date(now.getTime() - 86400000 * 5), transitMin: 2880, route: routeJson({ lng: -96.7970, lat: 32.7767 }, { lng: -87.6391, lat: 41.8086 }), freightCharge: 4400, refNo: 'REF-AP-020', poNo: 'PO-2024-120', bolNo: 'BOL-2024-020', isAtRisk: false, riskReason: null },
    { id: 's021', shipmentNo: 'SH-2024-0021', originId: memphis.id, destId: miami.id, carrierId: swiftline.id, vehicleId: vehicles[0].id, customerId: customers[2].id, orgId: apexLogistics.id, status: 'DELIVERED', priority: 'RUSH', description: 'Emergency medical device restock', weight: 1800, volume: 8, pieces: 60, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 3), estArrival: new Date(now.getTime() - 86400000 * 2), actualDeparture: new Date(now.getTime() - 86400000 * 3), actualArrival: new Date(now.getTime() - 86400000 * 2), transitMin: 1440, route: routeJson({ lng: -89.9718, lat: 35.1495 }, { lng: -80.1918, lat: 25.7617 }), freightCharge: 2800, refNo: 'REF-AP-021', poNo: 'PO-2024-121', bolNo: 'BOL-2024-021', isAtRisk: false, riskReason: null },
    { id: 's022', shipmentNo: 'SH-2024-0022', originId: seattle.id, destId: detroit.id, carrierId: airCargo.id, vehicleId: vehicles[8].id, customerId: customers[4].id, orgId: apexMfg.id, status: 'DELIVERED', priority: 'HIGH', description: 'Critical aerospace sensors', weight: 420, volume: 2, pieces: 30, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 2), estArrival: new Date(now.getTime() - 86400000 * 1), actualDeparture: new Date(now.getTime() - 86400000 * 2), actualArrival: new Date(now.getTime() - 86400000 * 1), transitMin: 720, route: routeJson({ lng: -122.3321, lat: 47.6062 }, { lng: -83.0458, lat: 42.3314 }), freightCharge: 7500, refNo: 'REF-AP-022', poNo: 'PO-2024-122', bolNo: 'BOL-2024-022', isAtRisk: false, riskReason: null },
    { id: 's023', shipmentNo: 'SH-2024-0023', originId: savannah.id, destId: newark.id, carrierId: nationalRail.id, vehicleId: vehicles[5].id, customerId: customers[0].id, orgId: apexMfg.id, status: 'DELIVERED', priority: 'NORMAL', description: 'Automotive stampings', weight: 38000, volume: 110, pieces: 500, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 8), estArrival: new Date(now.getTime() - 86400000 * 6), actualDeparture: new Date(now.getTime() - 86400000 * 8), actualArrival: new Date(now.getTime() - 86400000 * 6), transitMin: 2880, route: routeJson({ lng: -81.0998, lat: 32.0835 }, { lng: -74.1724, lat: 40.7357 }), freightCharge: 7200, refNo: 'REF-AP-023', poNo: 'PO-2024-123', bolNo: 'BOL-2024-023', isAtRisk: false, riskReason: null },
    { id: 's024', shipmentNo: 'SH-2024-0024', originId: losAngeles.id, destId: houston.id, carrierId: globalOcean.id, vehicleId: vehicles[7].id, customerId: customers[3].id, orgId: apexLogistics.id, status: 'DELIVERED', priority: 'NORMAL', description: 'Agricultural machinery - overseas return', weight: 28000, volume: 90, pieces: 15, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 15), estArrival: new Date(now.getTime() - 86400000 * 11), actualDeparture: new Date(now.getTime() - 86400000 * 15), actualArrival: new Date(now.getTime() - 86400000 * 11), transitMin: 5760, route: routeJson({ lng: -118.2437, lat: 33.9425 }, { lng: -95.3698, lat: 29.7604 }), freightCharge: 14200, refNo: 'REF-AP-024', poNo: 'PO-2024-124', bolNo: 'BOL-2024-024', isAtRisk: false, riskReason: null },
    { id: 's025', shipmentNo: 'SH-2024-0025', originId: detroit.id, destId: losAngeles.id, carrierId: nationalRail.id, vehicleId: vehicles[6].id, customerId: customers[4].id, orgId: apexMfg.id, status: 'DELIVERED', priority: 'HIGH', description: 'Aerospace engine components', weight: 22000, volume: 55, pieces: 90, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 9), estArrival: new Date(now.getTime() - 86400000 * 6), actualDeparture: new Date(now.getTime() - 86400000 * 9), actualArrival: new Date(now.getTime() - 86400000 * 6), transitMin: 4320, route: routeJson({ lng: -83.0458, lat: 42.3314 }, { lng: -118.2437, lat: 33.9425 }), freightCharge: 9800, refNo: 'REF-AP-025', poNo: 'PO-2024-125', bolNo: 'BOL-2024-025', isAtRisk: false, riskReason: null },

    // Delayed (5 shipments)
    { id: 's026', shipmentNo: 'SH-2024-0026', originId: chicago.id, destId: houston.id, carrierId: swiftline.id, vehicleId: vehicles[3].id, customerId: customers[1].id, orgId: apexMfg.id, status: 'DELAYED', priority: 'NORMAL', description: 'Refrigerated construction sealants', weight: 7500, volume: 32, pieces: 140, hazmat: true, estDeparture: new Date(now.getTime() - 86400000 * 4), estArrival: new Date(now.getTime() + 86400000 * 1), actualDeparture: new Date(now.getTime() - 86400000 * 4), actualArrival: null, transitMin: null, route: routeJson({ lng: -87.6391, lat: 41.8086 }, { lng: -95.3698, lat: 29.7604 }), freightCharge: 4100, refNo: 'REF-AP-026', poNo: 'PO-2024-126', bolNo: 'BOL-2024-026', isAtRisk: true, riskReason: 'Vehicle breakdown - engine failure in Missouri' },
    { id: 's027', shipmentNo: 'SH-2024-0027', originId: miami.id, destId: memphis.id, carrierId: swiftline.id, vehicleId: vehicles[2].id, customerId: customers[0].id, orgId: apexLogistics.id, status: 'DELAYED', priority: 'NORMAL', description: 'Auto body panels', weight: 10500, volume: 40, pieces: 220, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 3), estArrival: new Date(now.getTime() + 86400000 * 2), actualDeparture: new Date(now.getTime() - 86400000 * 3), actualArrival: null, transitMin: null, route: routeJson({ lng: -80.1918, lat: 25.7617 }, { lng: -89.9718, lat: 35.1495 }), freightCharge: 3600, refNo: 'REF-AP-027', poNo: 'PO-2024-127', bolNo: 'BOL-2024-027', isAtRisk: true, riskReason: 'Driver HOS limit reached - mandatory rest' },
    { id: 's028', shipmentNo: 'SH-2024-0028', originId: newark.id, destId: chicago.id, carrierId: nationalRail.id, vehicleId: vehicles[5].id, customerId: customers[2].id, orgId: apexMfg.id, status: 'DELAYED', priority: 'HIGH', description: 'Medical device molds', weight: 15000, volume: 48, pieces: 60, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 5), estArrival: new Date(now.getTime() + 86400000 * 2), actualDeparture: new Date(now.getTime() - 86400000 * 5), actualArrival: null, transitMin: null, route: routeJson({ lng: -74.1724, lat: 40.7357 }, { lng: -87.6391, lat: 41.8086 }), freightCharge: 5800, refNo: 'REF-AP-028', poNo: 'PO-2024-128', bolNo: 'BOL-2024-028', isAtRisk: true, riskReason: 'Rail yard congestion Pittsburgh' },
    { id: 's029', shipmentNo: 'SH-2024-0029', originId: dallas.id, destId: seattle.id, carrierId: swiftline.id, vehicleId: vehicles[4].id, customerId: customers[3].id, orgId: apexLogistics.id, status: 'DELAYED', priority: 'LOW', description: 'Farm equipment parts', weight: 16000, volume: 60, pieces: 80, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 5), estArrival: new Date(now.getTime() + 86400000 * 3), actualDeparture: new Date(now.getTime() - 86400000 * 5), actualArrival: null, transitMin: null, route: routeJson({ lng: -96.7970, lat: 32.7767 }, { lng: -122.3321, lat: 47.6062 }), freightCharge: 6100, refNo: 'REF-AP-029', poNo: 'PO-2024-129', bolNo: 'BOL-2024-029', isAtRisk: true, riskReason: 'Winter storm warning I-84 Oregon' },
    { id: 's030', shipmentNo: 'SH-2024-0030', originId: losAngeles.id, destId: newark.id, carrierId: globalOcean.id, vehicleId: vehicles[7].id, customerId: customers[4].id, orgId: apexMfg.id, status: 'DELAYED', priority: 'NORMAL', description: 'Titanium aerospace fasteners', weight: 18000, volume: 55, pieces: 200, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 7), estArrival: new Date(now.getTime() + 86400000 * 5), actualDeparture: new Date(now.getTime() - 86400000 * 7), actualArrival: null, transitMin: null, route: routeJson({ lng: -118.2437, lat: 33.9425 }, { lng: -74.1724, lat: 40.7357 }), freightCharge: 19500, refNo: 'REF-AP-030', poNo: 'PO-2024-130', bolNo: 'BOL-2024-030', isAtRisk: true, riskReason: 'Port strike延误 - Long Beach terminal closure' },

    // At Risk (5 shipments)
    { id: 's031', shipmentNo: 'SH-2024-0031', originId: detroit.id, destId: miami.id, carrierId: swiftline.id, vehicleId: vehicles[0].id, customerId: customers[0].id, orgId: apexMfg.id, status: 'AT_RISK', priority: 'HIGH', description: 'Just-in-time engine components', weight: 8200, volume: 25, pieces: 180, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 1), estArrival: new Date(now.getTime() + 86400000 * 2), actualDeparture: new Date(now.getTime() - 86400000 * 1), actualArrival: null, transitMin: null, route: routeJson({ lng: -83.0458, lat: 42.3314 }, { lng: -80.1918, lat: 25.7617 }), freightCharge: 4600, refNo: 'REF-AP-031', poNo: 'PO-2024-131', bolNo: 'BOL-2024-031', isAtRisk: true, riskReason: 'Weather delay risk - Hurricane approaching Gulf Coast' },
    { id: 's032', shipmentNo: 'SH-2024-0032', originId: chicago.id, destId: losAngeles.id, carrierId: nationalRail.id, vehicleId: vehicles[6].id, customerId: customers[1].id, orgId: apexMfg.id, status: 'AT_RISK', priority: 'NORMAL', description: 'Steel reinforcement bars', weight: 65000, volume: 170, pieces: 300, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 3), estArrival: new Date(now.getTime() + 86400000 * 4), actualDeparture: new Date(now.getTime() - 86400000 * 3), actualArrival: null, transitMin: null, route: routeJson({ lng: -87.6391, lat: 41.8086 }, { lng: -118.2437, lat: 33.9425 }), freightCharge: 11200, refNo: 'REF-AP-032', poNo: 'PO-2024-132', bolNo: 'BOL-2024-032', isAtRisk: true, riskReason: 'Rail capacity constraints - Union Pacific embargo' },
    { id: 's033', shipmentNo: 'SH-2024-0033', originId: houston.id, destId: detroit.id, carrierId: swiftline.id, vehicleId: vehicles[3].id, customerId: customers[0].id, orgId: apexMfg.id, status: 'AT_RISK', priority: 'RUSH', description: 'Critical transmission parts - hazmat', weight: 6200, volume: 20, pieces: 90, hazmat: true, estDeparture: new Date(now.getTime() - 86400000 * 1), estArrival: new Date(now.getTime() + 86400000 * 1), actualDeparture: new Date(now.getTime() - 86400000 * 1), actualArrival: null, transitMin: null, route: routeJson({ lng: -95.3698, lat: 29.7604 }, { lng: -83.0458, lat: 42.3314 }), freightCharge: 4900, refNo: 'REF-AP-033', poNo: 'PO-2024-133', bolNo: 'BOL-2024-033', isAtRisk: true, riskReason: 'Hazmat route restriction violation detected' },
    { id: 's034', shipmentNo: 'SH-2024-0034', originId: seattle.id, destId: dallas.id, carrierId: transGlobe.id, vehicleId: vehicles[9].id, customerId: customers[2].id, orgId: apexLogistics.id, status: 'AT_RISK', priority: 'HIGH', description: 'Medical diagnostic equipment', weight: 2800, volume: 12, pieces: 25, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 2), estArrival: new Date(now.getTime() + 86400000 * 1), actualDeparture: new Date(now.getTime() - 86400000 * 2), actualArrival: null, transitMin: null, route: routeJson({ lng: -122.3321, lat: 47.6062 }, { lng: -96.7970, lat: 32.7767 }), freightCharge: 5200, refNo: 'REF-AP-034', poNo: 'PO-2024-134', bolNo: 'BOL-2024-034', isAtRisk: true, riskReason: 'GPS signal loss - vehicle location unknown for 4 hours' },
    { id: 's035', shipmentNo: 'SH-2024-0035', originId: memphis.id, destId: newark.id, carrierId: swiftline.id, vehicleId: vehicles[2].id, customerId: customers[4].id, orgId: apexMfg.id, status: 'AT_RISK', priority: 'NORMAL', description: 'Aerospace wiring harnesses', weight: 3400, volume: 18, pieces: 400, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 2), estArrival: new Date(now.getTime() + 86400000 * 1), actualDeparture: new Date(now.getTime() - 86400000 * 2), actualArrival: null, transitMin: null, route: routeJson({ lng: -89.9718, lat: 35.1495 }, { lng: -74.1724, lat: 40.7357 }), freightCharge: 3800, refNo: 'REF-AP-035', poNo: 'PO-2024-135', bolNo: 'BOL-2024-035', isAtRisk: true, riskReason: 'Customer requested expedite - original ETA insufficient' },

    // Exception (5 shipments)
    { id: 's036', shipmentNo: 'SH-2024-0036', originId: detroit.id, destId: houston.id, carrierId: swiftline.id, vehicleId: vehicles[4].id, customerId: customers[1].id, orgId: apexMfg.id, status: 'EXCEPTION', priority: 'HIGH', description: 'He-duty truck chassis', weight: 20500, volume: 78, pieces: 6, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 6), estArrival: new Date(now.getTime() - 86400000 * 2), actualDeparture: new Date(now.getTime() - 86400000 * 6), actualArrival: null, transitMin: null, route: routeJson({ lng: -83.0458, lat: 42.3314 }, { lng: -95.3698, lat: 29.7604 }), freightCharge: 5500, refNo: 'REF-AP-036', poNo: 'PO-2024-136', bolNo: 'BOL-2024-036', isAtRisk: true, riskReason: 'Customs documentation missing for cross-border' },
    { id: 's037', shipmentNo: 'SH-2024-0037', originId: losAngeles.id, destId: savannah.id, carrierId: globalOcean.id, vehicleId: vehicles[7].id, customerId: customers[2].id, orgId: apexLogistics.id, status: 'EXCEPTION', priority: 'NORMAL', description: 'Medical supply bulk shipment', weight: 25000, volume: 95, pieces: 300, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 8), estArrival: new Date(now.getTime() - 86400000 * 3), actualDeparture: new Date(now.getTime() - 86400000 * 8), actualArrival: null, transitMin: null, route: routeJson({ lng: -118.2437, lat: 33.9425 }, { lng: -81.0998, lat: 32.0835 }), freightCharge: 16000, refNo: 'REF-AP-037', poNo: 'PO-2024-137', bolNo: 'BOL-2024-037', isAtRisk: true, riskReason: 'Cargo damaged in transit - inspection required' },
    { id: 's038', shipmentNo: 'SH-2024-0038', originId: chicago.id, destId: miami.id, carrierId: swiftline.id, vehicleId: vehicles[0].id, customerId: customers[3].id, orgId: apexLogistics.id, status: 'EXCEPTION', priority: 'LOW', description: 'Agricultural tools and supplies', weight: 12000, volume: 50, pieces: 500, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 4), estArrival: new Date(now.getTime() - 86400000 * 1), actualDeparture: new Date(now.getTime() - 86400000 * 4), actualArrival: null, transitMin: null, route: routeJson({ lng: -87.6391, lat: 41.8086 }, { lng: -80.1918, lat: 25.7617 }), freightCharge: 4200, refNo: 'REF-AP-038', poNo: 'PO-2024-138', bolNo: 'BOL-2024-038', isAtRisk: true, riskReason: 'Customer refused delivery - address dispute' },
    { id: 's039', shipmentNo: 'SH-2024-0039', originId: newark.id, destId: dallas.id, carrierId: transGlobe.id, vehicleId: vehicles[9].id, customerId: customers[4].id, orgId: apexMfg.id, status: 'EXCEPTION', priority: 'HIGH', description: 'Precision aerospace tools', weight: 1600, volume: 6, pieces: 40, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 3), estArrival: new Date(now.getTime() - 86400000 * 1), actualDeparture: new Date(now.getTime() - 86400000 * 3), actualArrival: null, transitMin: null, route: routeJson({ lng: -74.1724, lat: 40.7357 }, { lng: -96.7970, lat: 32.7767 }), freightCharge: 3500, refNo: 'REF-AP-039', poNo: 'PO-2024-139', bolNo: 'BOL-2024-039', isAtRisk: true, riskReason: 'Carrier subcontractor no-show - re-routing needed' },
    { id: 's040', shipmentNo: 'SH-2024-0040', originId: houston.id, destId: chicago.id, carrierId: nationalRail.id, vehicleId: vehicles[5].id, customerId: customers[0].id, orgId: apexMfg.id, status: 'EXCEPTION', priority: 'NORMAL', description: 'Automotive steel coils', weight: 48000, volume: 140, pieces: 40, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 5), estArrival: new Date(now.getTime() - 86400000 * 2), actualDeparture: new Date(now.getTime() - 86400000 * 5), actualArrival: null, transitMin: null, route: routeJson({ lng: -95.3698, lat: 29.7604 }, { lng: -87.6391, lat: 41.8086 }), freightCharge: 8400, refNo: 'REF-AP-040', poNo: 'PO-2024-140', bolNo: 'BOL-2024-040', isAtRisk: true, riskReason: 'Rail car derailment near St. Louis - cargo inspection pending' },

    // CREATED/BOOKED/PICKED_UP/OUT_FOR_DELIVERY (10 shipments)
    { id: 's041', shipmentNo: 'SH-2024-0041', originId: detroit.id, destId: chicago.id, carrierId: swiftline.id, vehicleId: vehicles[2].id, customerId: customers[0].id, orgId: apexMfg.id, status: 'CREATED', priority: 'NORMAL', description: 'Dashboard assemblies', weight: 5600, volume: 22, pieces: 300, hazmat: false, estDeparture: new Date(now.getTime() + 86400000 * 1), estArrival: new Date(now.getTime() + 86400000 * 3), actualDeparture: null, actualArrival: null, transitMin: null, route: routeJson({ lng: -83.0458, lat: 42.3314 }, { lng: -87.6391, lat: 41.8086 }), freightCharge: 2800, refNo: 'REF-AP-041', poNo: 'PO-2024-141', bolNo: 'BOL-2024-041', isAtRisk: false, riskReason: null },
    { id: 's042', shipmentNo: 'SH-2024-0042', originId: chicago.id, destId: dallas.id, carrierId: transGlobe.id, vehicleId: vehicles[9].id, customerId: customers[1].id, orgId: apexLogistics.id, status: 'BOOKED', priority: 'RUSH', description: 'Emergency construction materials', weight: 14000, volume: 52, pieces: 200, hazmat: false, estDeparture: new Date(now.getTime() + 86400000 * 2), estArrival: new Date(now.getTime() + 86400000 * 4), actualDeparture: null, actualArrival: null, transitMin: null, route: routeJson({ lng: -87.6391, lat: 41.8086 }, { lng: -96.7970, lat: 32.7767 }), freightCharge: 3800, refNo: 'REF-AP-042', poNo: 'PO-2024-142', bolNo: 'BOL-2024-042', isAtRisk: false, riskReason: null },
    { id: 's043', shipmentNo: 'SH-2024-0043', originId: losAngeles.id, destId: seattle.id, carrierId: swiftline.id, vehicleId: vehicles[4].id, customerId: customers[3].id, orgId: apexLogistics.id, status: 'PICKED_UP', priority: 'NORMAL', description: 'Irrigation system components', weight: 9200, volume: 35, pieces: 150, hazmat: false, estDeparture: new Date(now.getTime() - 21600000), estArrival: new Date(now.getTime() + 86400000 * 2), actualDeparture: new Date(now.getTime() - 21600000), actualArrival: null, transitMin: null, route: routeJson({ lng: -118.2437, lat: 33.9425 }, { lng: -122.3321, lat: 47.6062 }), freightCharge: 3600, refNo: 'REF-AP-043', poNo: 'PO-2024-143', bolNo: 'BOL-2024-043', isAtRisk: false, riskReason: null },
    { id: 's044', shipmentNo: 'SH-2024-0044', originId: miami.id, destId: newark.id, carrierId: airCargo.id, vehicleId: vehicles[8].id, customerId: customers[2].id, orgId: apexMfg.id, status: 'PICKED_UP', priority: 'HIGH', description: 'Urgent medical device shipment', weight: 800, volume: 4, pieces: 20, hazmat: false, estDeparture: new Date(now.getTime() - 7200000), estArrival: new Date(now.getTime() + 21600000), actualDeparture: new Date(now.getTime() - 7200000), actualArrival: null, transitMin: null, route: routeJson({ lng: -80.1918, lat: 25.7617 }, { lng: -74.1724, lat: 40.7357 }), freightCharge: 6400, refNo: 'REF-AP-044', poNo: 'PO-2024-144', bolNo: 'BOL-2024-044', isAtRisk: false, riskReason: null },
    { id: 's045', shipmentNo: 'SH-2024-0045', originId: dallas.id, destId: memphis.id, carrierId: swiftline.id, vehicleId: vehicles[0].id, customerId: customers[1].id, orgId: apexLogistics.id, status: 'OUT_FOR_DELIVERY', priority: 'NORMAL', description: 'Construction hardware - final mile', weight: 4800, volume: 18, pieces: 350, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 2), estArrival: new Date(now.getTime() + 86400000 * 1), actualDeparture: new Date(now.getTime() - 86400000 * 2), actualArrival: null, transitMin: null, route: routeJson({ lng: -96.7970, lat: 32.7767 }, { lng: -89.9718, lat: 35.1495 }), freightCharge: 2200, refNo: 'REF-AP-045', poNo: 'PO-2024-145', bolNo: 'BOL-2024-045', isAtRisk: false, riskReason: null },
    { id: 's046', shipmentNo: 'SH-2024-0046', originId: seattle.id, destId: losAngeles.id, carrierId: nationalRail.id, vehicleId: vehicles[6].id, customerId: customers[4].id, orgId: apexMfg.id, status: 'OUT_FOR_DELIVERY', priority: 'HIGH', description: 'Aerospace composite materials', weight: 12000, volume: 40, pieces: 60, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 3), estArrival: new Date(now.getTime() + 86400000 * 1), actualDeparture: new Date(now.getTime() - 86400000 * 3), actualArrival: null, transitMin: null, route: routeJson({ lng: -122.3321, lat: 47.6062 }, { lng: -118.2437, lat: 33.9425 }), freightCharge: 6800, refNo: 'REF-AP-046', poNo: 'PO-2024-146', bolNo: 'BOL-2024-046', isAtRisk: false, riskReason: null },
    { id: 's047', shipmentNo: 'SH-2024-0047', originId: savannah.id, destId: miami.id, carrierId: swiftline.id, vehicleId: vehicles[3].id, customerId: customers[0].id, orgId: apexLogistics.id, status: 'BOOKED', priority: 'LOW', description: 'Auto parts - standard restock', weight: 7800, volume: 28, pieces: 160, hazmat: false, estDeparture: new Date(now.getTime() + 86400000 * 3), estArrival: new Date(now.getTime() + 86400000 * 5), actualDeparture: null, actualArrival: null, transitMin: null, route: routeJson({ lng: -81.0998, lat: 32.0835 }, { lng: -80.1918, lat: 25.7617 }), freightCharge: 2600, refNo: 'REF-AP-047', poNo: 'PO-2024-147', bolNo: 'BOL-2024-047', isAtRisk: false, riskReason: null },
    { id: 's048', shipmentNo: 'SH-2024-0048', originId: houston.id, destId: chicago.id, carrierId: swiftline.id, vehicleId: vehicles[2].id, customerId: customers[3].id, orgId: apexMfg.id, status: 'CREATED', priority: 'NORMAL', description: 'Petrochemical containers - hazmat', weight: 16000, volume: 55, pieces: 80, hazmat: true, estDeparture: new Date(now.getTime() + 86400000 * 2), estArrival: new Date(now.getTime() + 86400000 * 5), actualDeparture: null, actualArrival: null, transitMin: null, route: routeJson({ lng: -95.3698, lat: 29.7604 }, { lng: -87.6391, lat: 41.8086 }), freightCharge: 5800, refNo: 'REF-AP-048', poNo: 'PO-2024-148', bolNo: 'BOL-2024-048', isAtRisk: false, riskReason: null },
    { id: 's049', shipmentNo: 'SH-2024-0049', originId: memphis.id, destId: detroit.id, carrierId: transGlobe.id, vehicleId: vehicles[9].id, customerId: customers[4].id, orgId: apexMfg.id, status: 'PICKED_UP', priority: 'NORMAL', description: 'Aerospace tooling fixtures', weight: 4100, volume: 14, pieces: 35, hazmat: false, estDeparture: new Date(now.getTime() - 3600000), estArrival: new Date(now.getTime() + 86400000 * 3), actualDeparture: new Date(now.getTime() - 3600000), actualArrival: null, transitMin: null, route: routeJson({ lng: -89.9718, lat: 35.1495 }, { lng: -83.0458, lat: 42.3314 }), freightCharge: 3200, refNo: 'REF-AP-049', poNo: 'PO-2024-149', bolNo: 'BOL-2024-049', isAtRisk: false, riskReason: null },
    { id: 's050', shipmentNo: 'SH-2024-0050', originId: chicago.id, destId: newark.id, carrierId: airCargo.id, vehicleId: vehicles[8].id, customerId: customers[2].id, orgId: apexMfg.id, status: 'OUT_FOR_DELIVERY', priority: 'RUSH', description: 'Critical hospital device shipment', weight: 350, volume: 1.5, pieces: 10, hazmat: false, estDeparture: new Date(now.getTime() - 86400000 * 1), estArrival: new Date(now.getTime() + 43200000), actualDeparture: new Date(now.getTime() - 86400000 * 1), actualArrival: null, transitMin: null, route: routeJson({ lng: -87.6391, lat: 41.8086 }, { lng: -74.1724, lat: 40.7357 }), freightCharge: 8500, refNo: 'REF-AP-050', poNo: 'PO-2024-150', bolNo: 'BOL-2024-050', isAtRisk: false, riskReason: null },
  ];

  for (const s of shipments) {
    const shipment = await prisma.shipment.create({
      data: {
        id: s.id,
        shipmentNo: s.shipmentNo,
        organizationId: s.orgId,
        originWarehouseId: s.originId,
        destWarehouseId: s.destId,
        carrierId: s.carrierId,
        vehicleId: s.vehicleId,
        customerId: s.customerId,
        status: s.status as any,
        priority: s.priority as any,
        description: s.description,
        weightKg: s.weight,
        volumeM3: s.volume,
        pieceCount: s.pieces,
        hazmat: s.hazmat,
        estDeparture: s.estDeparture,
        estArrival: s.estArrival,
        actualDeparture: s.actualDeparture,
        actualArrival: s.actualArrival,
        transitMinutes: s.transitMin,
        routeJson: s.route,
        freightCharge: s.freightCharge,
        referenceNo: s.refNo,
        poNumber: s.poNo,
        bolNumber: s.bolNo,
        isAtRisk: s.isAtRisk,
        riskReason: s.riskReason,
      },
    });

    // Status history
    const historyEntries: Array<{ status: string; changedAt: Date; note: string }> = [
      { status: 'CREATED', changedAt: new Date(s.estDeparture.getTime() - 86400000 * 2), note: 'Shipment created in system' },
    ];
    if (s.status !== 'CREATED') {
      historyEntries.push({ status: 'BOOKED', changedAt: new Date(s.estDeparture.getTime() - 86400000 * 1), note: 'Carrier booked' });
    }
    if (s.actualDeparture || s.status === 'PICKED_UP' || s.status === 'IN_TRANSIT' || s.status === 'DELAYED' || s.status === 'AT_RISK' || s.status === 'DELIVERED' || s.status === 'EXCEPTION' || s.status === 'OUT_FOR_DELIVERY') {
      historyEntries.push({ status: 'PICKED_UP', changedAt: s.actualDeparture || new Date(s.estDeparture.getTime() + 3600000), note: 'Cargo picked up from origin' });
    }
    if (s.status === 'IN_TRANSIT' || s.status === 'DELAYED' || s.status === 'AT_RISK' || s.status === 'DELIVERED' || s.status === 'EXCEPTION' || s.status === 'OUT_FOR_DELIVERY') {
      historyEntries.push({ status: 'IN_TRANSIT', changedAt: new Date((s.actualDeparture || s.estDeparture.getTime()) + 7200000), note: 'Shipment in transit' });
    }
    if (s.status === 'DELAYED') {
      historyEntries.push({ status: 'DELAYED', changedAt: new Date(now.getTime() - 86400000 * 1), note: 'Delay reported - ' + (s.riskReason || 'Operational delay') });
    }
    if (s.status === 'AT_RISK') {
      historyEntries.push({ status: 'AT_RISK', changedAt: new Date(now.getTime() - 43200000), note: 'At risk - ' + (s.riskReason || 'Potential delay') });
    }
    if (s.status === 'OUT_FOR_DELIVERY') {
      historyEntries.push({ status: 'OUT_FOR_DELIVERY', changedAt: new Date(now.getTime() - 3600000), note: 'Out for final delivery' });
    }
    if (s.status === 'DELIVERED') {
      historyEntries.push({ status: 'DELIVERED', changedAt: s.actualArrival || new Date(), note: 'Delivered successfully' });
    }
    if (s.status === 'EXCEPTION') {
      historyEntries.push({ status: 'EXCEPTION', changedAt: new Date(now.getTime() - 86400000 * 1), note: 'Exception - ' + (s.riskReason || 'Issue reported') });
    }

    await prisma.shipmentStatusHistory.createMany({
      data: historyEntries.map((h) => ({
        shipmentId: shipment.id,
        status: h.status as any,
        changedAt: h.changedAt,
        changedBy: 'seed-script',
        note: h.note,
      })),
    });
  }

  // ── Alerts (20) ──
  const alertData = [
    { shipmentNo: 'SH-2024-0004', type: 'WEATHER_EVENT' as const, severity: 'HIGH' as const, title: 'Severe Thunderstorm Warning', description: 'I-45 corridor between Houston and Dallas under severe thunderstorm warning. Estimated 2-4 hour delay.', location: 'I-45, TX', acknowledged: false },
    { shipmentNo: 'SH-2024-0006', type: 'TEMPERATURE_BREACH' as const, severity: 'CRITICAL' as const, title: 'Reefer Temperature Breach', description: 'Zone 2 temperature exceeded threshold (8°C / max 4°C) for 45 minutes. Cargo may be compromised.', location: 'Near Gary, IN', acknowledged: false },
    { shipmentNo: 'SH-2024-0026', type: 'CARRIER_ISSUE' as const, severity: 'HIGH' as const, title: 'Vehicle Breakdown - Engine Failure', description: 'Tractor TL-1805 engine failure reported near St. Louis. Estimated repair time: 24-48 hours.', location: 'I-70, MO', acknowledged: false },
    { shipmentNo: 'SH-2024-0027', type: 'CARRIER_ISSUE' as const, severity: 'MEDIUM' as const, title: 'Driver HOS Limit Reached', description: 'Driver Emily Torres reached hours-of-service limit. Mandatory 10-hour rest required before continuing.', location: 'Birmingham, AL', acknowledged: false },
    { shipmentNo: 'SH-2024-0028', type: 'DELAY' as const, severity: 'MEDIUM' as const, title: 'Rail Yard Congestion - Pittsburgh', description: 'Norfolk Southern rail yard in Pittsburgh at 95% capacity. Estimated 12-hour hold for reclassification.', location: 'Pittsburgh, PA', acknowledged: false },
    { shipmentNo: 'SH-2024-0029', type: 'WEATHER_EVENT' as const, severity: 'HIGH' as const, title: 'Winter Storm Warning - I-84 Oregon', description: 'Winter storm warning in effect for I-84 through Columbia Gorge. Chains required. Potential road closure.', location: 'I-84, OR', acknowledged: false },
    { shipmentNo: 'SH-2024-0030', type: 'DELAY' as const, severity: 'HIGH' as const, title: 'Port Strike - Long Beach Terminal Closure', description: 'ILWU labor action at Port of Long Beach. Terminal closed indefinitely. Vessel unloading suspended.', location: 'Long Beach, CA', acknowledged: false },
    { shipmentNo: 'SH-2024-0031', type: 'WEATHER_EVENT' as const, severity: 'CRITICAL' as const, title: 'Hurricane Watch - Gulf Coast', description: 'Hurricane approaching Gulf Coast. All shipments to/from Florida and Gulf ports at risk of extended delays.', location: 'Gulf Coast, US', acknowledged: false },
    { shipmentNo: 'SH-2024-0032', type: 'CARRIER_ISSUE' as const, severity: 'MEDIUM' as const, title: 'Rail Capacity Constraints', description: 'Union Pacific embargo on westbound intermodal shipments due to capacity constraints. Alternative routing needed.', location: 'Chicago, IL', acknowledged: false },
    { shipmentNo: 'SH-2024-0033', type: 'ROUTE_DEVIATION' as const, severity: 'CRITICAL' as const, title: 'Hazmat Route Violation', description: 'Vehicle RF-2201 deviated from approved hazmat route. Automatic safety alert triggered. DOT notification pending.', location: 'I-75, KY', acknowledged: false },
    { shipmentNo: 'SH-2024-0034', type: 'CARRIER_ISSUE' as const, severity: 'HIGH' as const, title: 'GPS Signal Loss - Vehicle Location Unknown', description: 'No GPS ping received from vehicle TG-7703 for 4+ hours. Last known location: Billings, MT. Possible theft or device failure.', location: 'Billings, MT', acknowledged: false },
    { shipmentNo: 'SH-2024-0035', type: 'CUSTOMER_COMPLAINT' as const, severity: 'MEDIUM' as const, title: 'Customer Requested Expedite', description: 'Titan Aerospace escalated shipment SH-2024-0035. Original ETA does not meet production schedule. Expedite requested.', location: 'Memphis, TN', acknowledged: false },
    { shipmentNo: 'SH-2024-0036', type: 'DOCUMENT_MISSING' as const, severity: 'HIGH' as const, title: 'Customs Documentation Missing', description: 'Cross-border bill of lading and NAFTA certificate of origin not filed. Customs hold at Detroit-Windsor crossing.', location: 'Detroit, MI', acknowledged: false },
    { shipmentNo: 'SH-2024-0037', type: 'CARRIER_ISSUE' as const, severity: 'CRITICAL' as const, title: 'Cargo Damage Reported', description: 'Water damage detected in container #GOLN-4832 during transload inspection. 30% of cartons affected. Insurance claim opened.', location: 'Savannah, GA', acknowledged: false },
    { shipmentNo: 'SH-2024-0038', type: 'CUSTOMER_COMPLAINT' as const, severity: 'LOW' as const, title: 'Delivery Address Dispute', description: 'Customer GreenField Agriculture refusing delivery citing incorrect shipping address. Dispatch attempting to resolve.', location: 'Miami, FL', acknowledged: false },
    { shipmentNo: 'SH-2024-0039', type: 'CARRIER_ISSUE' as const, severity: 'HIGH' as const, title: 'Carrier Subcontractor No-Show', description: 'Last-mile carrier failed to show for pickup at Newark FG warehouse. Shipment re-routing to alternate carrier.', location: 'Newark, NJ', acknowledged: false },
    { shipmentNo: 'SH-2024-0040', type: 'CARRIER_ISSUE' as const, severity: 'CRITICAL' as const, title: 'Rail Car Derailment - St. Louis', description: 'Train #NLRF-4402 derailed near St. Louis. 3 cars affected. Cargo inspection and re-classification in progress.', location: 'St. Louis, MO', acknowledged: false },
    { shipmentNo: 'SH-2024-0001', type: 'CUSTOMER_COMPLAINT' as const, severity: 'LOW' as const, title: 'Delivery Window Change Request', description: 'Precision Auto Parts requesting delivery window adjustment for dock scheduling.', location: 'Toledo, OH', acknowledged: false },
    { shipmentNo: 'SH-2024-0012', type: 'DELAY' as const, severity: 'MEDIUM' as const, title: 'Rail Congestion - Denver Junction', description: 'Throughput reduced at Denver rail junction due to track maintenance. 8-hour delay expected.', location: 'Denver, CO', acknowledged: false },
    { shipmentNo: null, type: 'WEATHER_EVENT' as const, severity: 'INFO' as const, title: 'Weather Advisory - Midwest', description: 'Winter weather advisory for Midwest region. Monitor shipments in IA, IL, IN, OH for potential delays.', location: 'Midwest, US', acknowledged: false },
  ];

  for (const a of alertData) {
    const shipment = a.shipmentNo
      ? shipments.find((s) => s.shipmentNo === a.shipmentNo)
      : undefined;

    await prisma.alert.create({
      data: {
        shipmentId: shipment?.id || null,
        type: a.type,
        severity: a.severity,
        title: a.title,
        description: a.description,
        location: a.location,
        acknowledged: a.acknowledged,
        createdAt: new Date(now.getTime() - Math.floor(Math.random() * 86400000 * 2)),
      },
    });
  }

  // ── Vehicle positions (simulated GPS pings for in-transit vehicles) ──
  const inTransitShipments = shipments.filter((s) => s.status === 'IN_TRANSIT');
  for (const s of inTransitShipments) {
    const vehicle = vehicles.find((v) => v.id === s.vehicleId);
    if (!vehicle) continue;

    // Generate 5 position pings along the route
    const route = s.route as { geometry: { coordinates: number[][] } } | undefined;
    if (!route?.geometry?.coordinates) continue;
    const [fromLng, fromLat] = route.geometry.coordinates[0];
    const [toLng, toLat] = route.geometry.coordinates[1];

    for (let i = 0; i < 5; i++) {
      const t = (i + 1) / 6;
      const lng = fromLng + (toLng - fromLng) * t + (Math.random() - 0.5) * 0.5;
      const lat = fromLat + (toLat - fromLat) * t + (Math.random() - 0.5) * 0.5;
      await prisma.vehiclePosition.create({
        data: {
          vehicleId: vehicle.id,
          longitude: lng,
          latitude: lat,
          speed: 40 + Math.random() * 40,
          heading: Math.random() * 360,
          recordedAt: new Date(now.getTime() - 3600000 * (5 - i)),
        },
      });
    }
  }

  console.log('Seed complete!');
  console.log(`  Organizations: 2`);
  console.log(`  Carriers: ${carriers.length}`);
  console.log(`  Vehicles: ${vehicles.length}`);
  console.log(`  Drivers: ${drivers.length}`);
  console.log(`  Warehouses: ${warehouses.length}`);
  console.log(`  Customers: ${customers.length}`);
  console.log(`  Shipments: ${shipments.length}`);
  console.log(`  Alerts: ${alertData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
