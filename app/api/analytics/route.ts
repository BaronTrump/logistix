import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');

  const [
    totalShipments,
    inTransit,
    delivered,
    delayed,
    atRisk,
    statusGroup,
    modeGroup,
    alertSeverity,
    dailyVolume,
    carriers,
  ] = await Promise.all([
    prisma.shipment.count(orgId ? { where: { organizationId: orgId } } : {}),
    prisma.shipment.count({ where: { status: 'IN_TRANSIT', ...(orgId ? { organizationId: orgId } : {}) } }),
    prisma.shipment.count({ where: { status: 'DELIVERED', ...(orgId ? { organizationId: orgId } : {}) } }),
    prisma.shipment.count({ where: { status: 'DELAYED', ...(orgId ? { organizationId: orgId } : {}) } }),
    prisma.shipment.count({ where: { isAtRisk: true, ...(orgId ? { organizationId: orgId } : {}) } }),
    prisma.shipment.groupBy({ by: ['status'], _count: true, where: orgId ? { organizationId: orgId } : {} }),
    prisma.carrier.findMany({ where: orgId ? { organizationId: orgId } : {}, include: { _count: { select: { shipments: true } } } }),
    prisma.alert.groupBy({ by: ['severity'], _count: true, where: orgId ? { shipment: { organizationId: orgId } } : {} }),
    prisma.shipment.groupBy({
      by: ['createdAt'],
      _count: true,
      where: { ...(orgId ? { organizationId: orgId } : {}), createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
    }),
    prisma.carrier.findMany({
      where: { ...(orgId ? { organizationId: orgId } : {}), shipments: { some: {} } },
      include: { _count: { select: { shipments: true } } },
    }),
  ]);

  const onTimeRate = delivered > 0
    ? ((delivered - delayed) / delivered) * 100
    : 0;

  return NextResponse.json({
    totalShipments,
    inTransit,
    delivered,
    delayed,
    atRisk,
    onTimeRate: Math.round(onTimeRate * 10) / 10,
    volumeByStatus: statusGroup.map(s => ({ status: s.status, count: s._count })),
    volumeByMode: [],
    alertsBySeverity: alertSeverity.map(a => ({ severity: a.severity, count: a._count })),
    dailyVolume: dailyVolume.map(d => ({ date: d.createdAt.toISOString().split('T')[0], count: d._count })),
    topCarriers: carriers.map(c => ({ name: c.name, count: c._count.shipments, onTimeRate: 85 })),
    topRoutes: [],
    avgTransitHours: 48,
    totalRevenue: 0,
  });
}
