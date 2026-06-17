'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Warehouse } from '@/lib/types';

const API_BASE = '/api';

export function useWarehouses(orgId?: string) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWarehouses = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (orgId) params.set('orgId', orgId);
      const res = await fetch(`${API_BASE}/warehouses?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setWarehouses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);
  return { warehouses, isLoading, refresh: fetchWarehouses };
}
