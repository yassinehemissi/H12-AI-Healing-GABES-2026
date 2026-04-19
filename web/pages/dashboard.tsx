import dynamic from 'next/dynamic';

// On importe dynamiquement le nouveau dashboard avancé (sans rendu côté serveur pour éviter les erreurs de carte)
const DashboardNH3 = dynamic(() => import('../app/dashboard-nh3'), { ssr: false });

export default function Dashboard() {
    return <DashboardNH3 />;
}