"use client";

import {
	MapContainer,
	TileLayer,
	Marker,
	Polyline,
	Popup,
	useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

const clinicIcon = L.divIcon({
	className: "",
	html: `<div style="width:14px;height:14px;border-radius:9999px;background:#0f172a;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
	iconSize: [14, 14],
	iconAnchor: [7, 7],
});

const driverIcon = L.divIcon({
	className: "",
	html: `<div style="position:relative;width:16px;height:16px;">
    <div style="position:absolute;inset:0;border-radius:9999px;background:#3b82f6;opacity:0.4;animation:distribusi-ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
    <div style="position:absolute;inset:3px;border-radius:9999px;background:#2563eb;border:2px solid white;"></div>
  </div>`,
	iconSize: [16, 16],
	iconAnchor: [8, 8],
});

interface DistribusiMapProps {
	destination: {
		name: string;
		latitude: number | null;
		longitude: number | null;
	} | null;
	route: { latitude: number; longitude: number }[];
}

function FitBounds({ destination, route }: DistribusiMapProps) {
	const map = useMap();

	useEffect(() => {
		const points: [number, number][] = [];
		if (destination?.latitude != null && destination?.longitude != null) {
			points.push([destination.latitude, destination.longitude]);
		}
		route.forEach((p) => points.push([p.latitude, p.longitude]));

		if (points.length === 0) return;
		if (points.length === 1) {
			map.setView(points[0], 14);
			return;
		}
		map.fitBounds(points, { padding: [40, 40] });
	}, [destination, route, map]);

	return null;
}

export default function DistribusiMap({
	destination,
	route,
}: DistribusiMapProps) {
	const hasDestination =
		destination?.latitude != null && destination?.longitude != null;
	const currentPoint = route[route.length - 1];
	const polylinePositions: [number, number][] = route.map((p) => [
		p.latitude,
		p.longitude,
	]);
	const initialCenter: [number, number] = hasDestination
		? [destination!.latitude!, destination!.longitude!]
		: [-6.9175, 107.6191];

	return (
		<>
			<style>{`
        @keyframes distribusi-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .leaflet-container {
          z-index: 1 !important;
        }
        .leaflet-pane {
          z-index: 1 !important;
        }
        .leaflet-top, .leaflet-bottom {
          z-index: 2 !important;
        }
      `}</style>
			<MapContainer
				center={initialCenter}
				zoom={13}
				scrollWheelZoom={true}
				style={{ height: "100%", width: "100%" }}>
				<TileLayer
					attribution="&copy; OpenStreetMap contributors"
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{hasDestination && (
					<Marker
						position={[destination!.latitude!, destination!.longitude!]}
						icon={clinicIcon}>
						<Popup>{destination!.name}</Popup>
					</Marker>
				)}

				{polylinePositions.length > 1 && (
					<Polyline
						positions={polylinePositions}
						pathOptions={{ color: "#60a5fa", weight: 3, dashArray: "6 6" }}
					/>
				)}

				{currentPoint && (
					<Marker
						position={[currentPoint.latitude, currentPoint.longitude]}
						icon={driverIcon}
					/>
				)}

				<FitBounds destination={destination} route={route} />
			</MapContainer>
		</>
	);
}
