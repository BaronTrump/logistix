import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const shipment = await prisma.shipment.update({
    where: { id: params.id },
    data: { status: body.status },
  });
  await prisma.shipmentStatusHistory.create({
    data: {
      shipmentId: params.id,
      status: body.status,
      changedBy: body.changedBy,
      note: body.note,
    },
  });
  return NextResponse.json(shipment);
}
