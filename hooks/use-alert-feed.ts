'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Alert, AlertSeverity } from '@/lib/types';

const POLL_INTERVAL = 30000;
const API_BASE = '/api';

export function useAlertFeed(
  orgId?: string,
  limit: number = 50
) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ limit: String(limit) });
      if (orgId) params.set('orgId', orgId);
      const res = await fetch(`${API_BASE}/alerts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const data = await res.json();
      setAlerts(data);
      setUnacknowledgedCount(data.filter((a: Alert) => !a.acknowledged).length);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [orgId, limit]);

  const acknowledgeAlert = useCallback(async (alertId: string, userId?: string) => {
    const res = await fetch(`${API_BASE}/alerts/${alertId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledgedBy: userId }),
    });
    if (res.ok) {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() } : a));
      setUnacknowledgedCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return { alerts, unacknowledgedCount, isLoading, error, refresh: fetchAlerts, acknowledgeAlert };
}
