import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
// Import types for leaflet
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for react-leaflet SSR
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });

type Point = {
	latitude: number;
	longitude: number;
	concentration: number;
	risk_level: string;
	color: string;
	quartier: string;
};

type Meteo = {
	temperature: number;
	wind_speed: number;
	wind_direction: number;
	timestamp: string;
};

import { Bar } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'http://localhost:8000/concentrations-grid';


// Pagination util
function paginate<T>(array: T[], page_size: number, page_number: number): T[] {
	return array.slice((page_number - 1) * page_size, page_number * page_size);
}

const RISK_LEGEND = [
	{ color: '#2ecc71', label: 'Faible', range: '< 50 µg/m³' },
	{ color: '#f39c12', label: 'Moyen', range: '50–200 µg/m³' },
	{ color: '#e74c3c', label: 'Élevé', range: '> 200 µg/m³' },
];

const DashboardNH3 = () => {
	const [points, setPoints] = useState<Point[]>([]);
	const [meteo, setMeteo] = useState<Meteo | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const PAGE_SIZE = 10;

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(API_URL);
				if (!res.ok) throw new Error('Erreur API backend');
				const data = await res.json();
				setPoints(data.points);
				setMeteo(data.meteo);
			} catch (e: any) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	// Pagination
	const paginatedPoints = paginate(points, PAGE_SIZE, page);
	const totalPages = Math.ceil(points.length / PAGE_SIZE);

	// Calcul des statistiques quartiers pour la charte
	const quartiersStats = Object.entries(points.reduce((acc: Record<string, { totalConc: number; count: number }>, p) => {
		if (!acc[p.quartier]) {
			acc[p.quartier] = { totalConc: 0, count: 0 };
		}
		acc[p.quartier].totalConc += p.concentration;
		acc[p.quartier].count += 1;
		return acc;
	}, {})).map(([quartier, stats]) => ({
		quartier,
		moyenne: stats.totalConc / stats.count
	})).sort((a, b) => b.moyenne - a.moyenne).slice(0, 5); // top 5

	const chartData = {
		labels: quartiersStats.map(q => q.quartier),
		datasets: [
			{
				label: 'Concentration Moyenne (µg/m³)',
				data: quartiersStats.map(q => q.moyenne),
				backgroundColor: '#667eea',
			},
		],
	};

	const chartOptions = {
		responsive: true,
		plugins: {
			legend: { display: false },
			title: { display: true, text: 'Quartiers les plus exposés (top 5, moyenne réelle)' },
		},
	};

	return (
		<div className="dashboard-container" style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
			<div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: 32, borderRadius: 12, marginBottom: 32, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
				<h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Carte de concentration NH₃ à Gabès</h1>
				<div className="subtitle" style={{ fontSize: 16, opacity: 0.95 }}>
					{meteo && (
						<>
							<span>Météo actuelle : </span>
							<span>Température {meteo.temperature}°C, </span>
							<span>Vent {meteo.wind_speed} m/s ({meteo.wind_direction}°)</span>
						</>
					)}
				</div>
			</div>

			{loading ? (
				<div style={{ fontSize: 18, textAlign: 'center', margin: '40px 0' }}>Chargement des données...</div>
			) : error ? (
				<div style={{ color: 'red', fontWeight: 600, fontSize: 18, textAlign: 'center', margin: '40px 0' }}>Erreur : {error}</div>
			) : (
				<>
					{/* MAP full width with legend overlay */}
					<div style={{ position: 'relative', width: '100%', height: 480, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px #0001', marginBottom: 32, background: '#fff' }}>
						<MapContainer
							center={[33.91, 10.09] as LatLngExpression}
							zoom={13}
							style={{ height: '100%', width: '100%' }}
							scrollWheelZoom={true}
						>
							<TileLayer
								attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>
							{points.map((p, idx) => (
								<CircleMarker
									key={idx}
									center={[p.latitude, p.longitude] as LatLngExpression}
									radius={5} // Reduced radius from 7 to 5
									pathOptions={{ color: p.color, fillColor: p.color, fillOpacity: 0.8 }}
								/>
							))}
						</MapContainer>
						{/* Legend overlay */}
						<div style={{ position: 'absolute', top: 18, right: 18, background: 'rgba(255,255,255,0.95)', borderRadius: 10, boxShadow: '0 1px 6px #0002', padding: '16px 20px', zIndex: 1000, minWidth: 170 }}>
							<div style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>Légende :</div>
							{RISK_LEGEND.map((r, i) => (
								<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
									<span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: '50%', background: r.color, marginRight: 8, border: '1px solid #ccc' }}></span>
									<span style={{ fontWeight: 600 }}>{r.label}</span>
									<span style={{ color: '#888', marginLeft: 6 }}>{r.range}</span>
								</div>
							))}
						</div>
						<div style={{ position: 'absolute', left: 24, bottom: 12, fontSize: 13, color: '#888' }}>Chaque point coloré représente la concentration estimée de NH₃ à cet endroit.</div>
					</div>

					{/* TABLEAU avec pagination */}
					<div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 20, minWidth: 350 }}>
						<h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#333' }}>Tableau des points (10 par page)</h2>
						<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
							<thead>
								<tr style={{ background: '#f3f3f3' }}>
									<th style={{ padding: 10, border: '1px solid #eee' }}>Latitude</th>
									<th style={{ padding: 10, border: '1px solid #eee' }}>Longitude</th>
									<th style={{ padding: 10, border: '1px solid #eee' }}>Quartier</th>
									<th style={{ padding: 10, border: '1px solid #eee' }}>Concentration (µg/m³)</th>
									<th style={{ padding: 10, border: '1px solid #eee' }}>Niveau de risque</th>
								</tr>
							</thead>
							<tbody>
								{paginatedPoints.map((p, idx) => (
									<tr key={idx} style={{ background: idx % 2 === 0 ? '#fafbfc' : '#f3f3f3' }}>
										<td style={{ padding: 8, border: '1px solid #eee' }}>{p.latitude}</td>
										<td style={{ padding: 8, border: '1px solid #eee' }}>{p.longitude}</td>
										<td style={{ padding: 8, border: '1px solid #eee' }}>{p.quartier}</td>
										<td style={{ padding: 8, border: '1px solid #eee' }}>{p.concentration}</td>
										<td style={{ padding: 8, border: '1px solid #eee', color: p.color, fontWeight: 700 }}>{p.risk_level}</td>
									</tr>
								))}
							</tbody>
						</table>
						{/* Pagination controls */}
						<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 18 }}>
							<button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#667eea', color: 'white', fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>Précédent</button>
							<span style={{ fontWeight: 600, fontSize: 15 }}>Page {page} / {totalPages}</span>
							<button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#667eea', color: 'white', fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>Suivant</button>
						</div>
					</div>

					{/* STATISTIQUES des quartiers les plus endommagés (charte) */}
					<div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 20, marginTop: 32, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
						<h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#333' }}>Quartiers les plus exposés (top 5)</h2>
						<Bar data={chartData} options={chartOptions} height={220} />
					</div>
				</>
			)}
		</div>
	);
};

export default DashboardNH3;
