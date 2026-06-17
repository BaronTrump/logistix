'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LogisticsAnalytics } from '@/lib/types';

const API_BASE = '/api';

export function useLogisticsAnalytics(orgId?: string) {
  const [analytics, setAnalytics] = useState<LogisticsAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (orgId) params.set('orgId', orgId);
      const res = await fetch(`${API_BASE}/analytics?${params}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return { analytics, isLoading, error, refresh: fetchAnalytics };
}
