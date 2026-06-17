import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const alert = await prisma.alert.update({
    where: { id: params.id },
    data: {
      acknowledged: true,
      acknowledgedBy: body.acknowledgedBy,
      acknowledgedAt: new Date(),
    },
  });
  return NextResponse.json(alert);
}
