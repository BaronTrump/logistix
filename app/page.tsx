'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const LogisticsDashboard = dynamic(
  () => import('@/components/logistics-dashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <svg viewBox="0 0 40 40" className="w-16 h-16 mx-auto mb-4" fill="none">
            <rect x="4" y="8" width="24" height="16" rx="2" stroke="#00d4ff" strokeWidth="1.5" fill="none">
              <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="1.5s" fill="freeze" />
            </rect>
            <path d="M28 16 L34 8 L34 24 Z" fill="#00d4ff" opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
            </path>
            <circle cx="10" cy="28" r="2.5" fill="#00d4ff" />
            <circle cx="22" cy="28" r="2.5" fill="#00d4ff" />
            <circle cx="34" cy="28" r="2.5" fill="#00d4ff" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-widest">LOGISTIX</h2>
          <p className="text-cyan-400/60 text-xs font-mono tracking-wider">SUPPLY CHAIN INTELLIGENCE PLATFORM</p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            <p className="text-gray-500 text-xs font-mono">Initializing Geospatial Engine...</p>
          </div>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <LogisticsDashboard />;
}
