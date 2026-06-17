import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');
  const type = searchParams.get('type');

  const where: any = {};
  if (orgId) where.organizationId = orgId;
  if (type) where.type = type;

  const warehouses = await prisma.warehouse.findMany({ where, orderBy: { name: 'asc' } });
  return NextResponse.json(warehouses);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const warehouse = await prisma.warehouse.create({ data: body });
  return NextResponse.json(warehouse, { status: 201 });
}
