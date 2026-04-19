'use client';
import dynamic from 'next/dynamic';

// On centralise l'affichage sur dashboard-nh3.tsx pour éviter les doublons/erreurs
const DashboardNH3 = dynamic(() => import('./dashboard-nh3'), { ssr: false });

export default function Dashboard() {
    return <DashboardNH3 />;
}