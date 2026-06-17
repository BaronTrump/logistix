import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');
  const acknowledged = searchParams.get('acknowledged');
  const severity = searchParams.get('severity');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

  const where: any = {};
  if (orgId) where.shipment = { organizationId: orgId };
  if (acknowledged !== null) where.acknowledged = acknowledged === 'true';
  if (severity) where.severity = severity;

  const alerts = await prisma.alert.findMany({
    where,
    include: { shipment: { select: { shipmentNo: true, status: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return NextResponse.json(alerts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const alert = await prisma.alert.create({ data: body });
  return NextResponse.json(alert, { status: 201 });
}
