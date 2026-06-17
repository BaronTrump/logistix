import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');
  const carrierId = searchParams.get('carrierId');

  const where: any = {};
  if (orgId) where.organizationId = orgId;
  if (carrierId) where.carrierId = carrierId;

  const carriers = await prisma.carrier.findMany({
    where,
    include: { _count: { select: { shipments: true } } },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(carriers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const carrier = await prisma.carrier.create({ data: body });
  return NextResponse.json(carrier, { status: 201 });
}
