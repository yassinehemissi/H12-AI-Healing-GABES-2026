'use client';
import dynamic from 'next/dynamic';

const DashboardNH3 = dynamic(() => import('./dashboard-nh3'), { ssr: false });

export default function Home() {
  return <DashboardNH3 />;
}
