import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const shipment = await prisma.shipment.findUnique({
    where: { id: params.id },
    include: {
      originWarehouse: true,
      destWarehouse: true,
      customer: true,
      carrier: true,
      vehicle: { include: { positions: { orderBy: { recordedAt: 'desc' }, take: 1 } } },
      statusHistory: { orderBy: { changedAt: 'desc' } },
      alerts: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });
  if (!shipment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(shipment);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const shipment = await prisma.shipment.update({
    where: { id: params.id },
    data: {
      status: body.status,
      isAtRisk: body.isAtRisk,
      riskReason: body.riskReason,
      actualDeparture: body.actualDeparture ? new Date(body.actualDeparture) : undefined,
      actualArrival: body.actualArrival ? new Date(body.actualArrival) : undefined,
      transitMinutes: body.transitMinutes,
      carrierId: body.carrierId,
      vehicleId: body.vehicleId,
      estArrival: body.estArrival ? new Date(body.estArrival) : undefined,
      notes: body.notes,
    },
    include: { originWarehouse: true, destWarehouse: true, customer: true, carrier: true },
  });
  return NextResponse.json(shipment);
}
