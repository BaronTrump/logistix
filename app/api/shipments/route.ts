import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');
  const status = searchParams.get('status');
  const carrierId = searchParams.get('carrierId');
  const customerId = searchParams.get('customerId');
  const search = searchParams.get('search');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
  const offset = parseInt(searchParams.get('offset') || '0');

  const where: any = {};
  if (orgId) where.organizationId = orgId;
  if (status) where.status = status;
  if (carrierId) where.carrierId = carrierId;
  if (customerId) where.customerId = customerId;
  if (search) {
    where.OR = [
      { shipmentNo: { contains: search, mode: 'insensitive' } },
      { poNumber: { contains: search, mode: 'insensitive' } },
      { referenceNo: { contains: search, mode: 'insensitive' } },
      { bolNumber: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      include: {
        originWarehouse: true,
        destWarehouse: true,
        customer: true,
        carrier: true,
        vehicle: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.shipment.count({ where }),
  ]);

  return NextResponse.json({ shipments, total, limit, offset });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const shipment = await prisma.shipment.create({
    data: {
      shipmentNo: body.shipmentNo,
      organizationId: body.organizationId,
      status: 'CREATED',
      priority: body.priority || 'NORMAL',
      originWarehouseId: body.originWarehouseId,
      destWarehouseId: body.destWarehouseId,
      customerId: body.customerId,
      carrierId: body.carrierId,
      vehicleId: body.vehicleId,
      description: body.description,
      weightKg: body.weightKg,
      volumeM3: body.volumeM3,
      pieceCount: body.pieceCount,
      hazmat: body.hazmat || false,
      estDeparture: body.estDeparture ? new Date(body.estDeparture) : undefined,
      estArrival: body.estArrival ? new Date(body.estArrival) : undefined,
      freightCharge: body.freightCharge,
      referenceNo: body.referenceNo,
      poNumber: body.poNumber,
      bolNumber: body.bolNumber,
      notes: body.notes,
    },
    include: {
      originWarehouse: true,
      destWarehouse: true,
      customer: true,
      carrier: true,
    },
  });
  return NextResponse.json(shipment, { status: 201 });
}
