import { useEffect, useRef, useState } from "react";

interface MapGLMarker {
	destroy: () => void;
}

interface MapGLInstance {
	destroy: () => void;
	setCenter: (coords: [number, number]) => void;
}

interface MapGLGlobal {
	Map: new (
		element: HTMLElement,
		options: { center: [number, number]; zoom: number; key: string },
	) => MapGLInstance;
	Marker: new (
		map: MapGLInstance,
		options: { coordinates: [number, number] },
	) => MapGLMarker;
	HtmlMarker: new (
		map: MapGLInstance,
		options: {
			coordinates: [number, number];
			html: string;
			anchor: [number, number];
		},
	) => MapGLMarker;
}

declare global {
	interface Window {
		mapgl?: MapGLGlobal;
	}
}

interface LeafletMapProps {
	lat: number | null;
	lng: number | null;
	height?: string;
}

interface PlacesItem {
	point?: { lat: number; lon: number };
}

interface PlacesResponse {
	result?: { items?: PlacesItem[] };
}

const DEFAULT_CENTER: [number, number] = [74.5698, 42.8746];
const API_KEY = "d1209e11-0a90-484b-a728-affd4b0a09b2";

// How many degrees of movement before we re-fetch safe spots (~200 metres)
const REFETCH_THRESHOLD = 0.002;

const SAFE_SPOT_QUERIES = [
	{ q: "больница", color: "#2563eb", emoji: "🏥" },
	{ q: "поликлиника", color: "#2563eb", emoji: "🏥" },
	{ q: "скорая помощь", color: "#2563eb", emoji: "🏥" },
	{ q: "милиция", color: "#16a34a", emoji: "🚔" },
	{ q: "полиция", color: "#16a34a", emoji: "🚔" },
	{ q: "пункт полиции", color: "#16a34a", emoji: "🚔" },
];

function makeHtmlMarker(color: string, emoji: string): string {
	return `
    <div style="
      background:${color};
      color:#fff;
      border-radius:50%;
      width:36px;
      height:36px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:18px;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      border:2px solid #fff;
    ">${emoji}</div>
  `;
}

async function fetchSafeSpots(
	centerLat: number,
	centerLng: number,
): Promise<Array<{ coords: [number, number]; color: string; emoji: string }>> {
	const results: Array<{
		coords: [number, number];
		color: string;
		emoji: string;
	}> = [];

	await Promise.allSettled(
		SAFE_SPOT_QUERIES.map(async ({ q, color, emoji }) => {
			const url = `https://catalog.api.2gis.com/3.0/items?q=${encodeURIComponent(q)}&location=${centerLng},${centerLat}&radius=2000&fields=items.point&page_size=10&key=${API_KEY}`;
			const res = await fetch(url);
			const data = (await res.json()) as PlacesResponse;
			for (const item of data.result?.items ?? []) {
				if (item.point) {
					results.push({
						coords: [item.point.lon, item.point.lat],
						color,
						emoji,
					});
				}
			}
		}),
	);

	return results;
}

function load2GIS(): Promise<MapGLGlobal> {
	if (window.mapgl) return Promise.resolve(window.mapgl);

	return new Promise((resolve, reject) => {
		const existing =
			document.querySelector<HTMLScriptElement>("script[data-mapgl]");

		const finish = () => {
			if (window.mapgl) resolve(window.mapgl);
			else reject(new Error("Не удалось загрузить карту"));
		};

		if (existing) {
			existing.addEventListener("load", finish, { once: true });
			return;
		}

		const script = document.createElement("script");
		script.src = "https://mapgl.2gis.com/api/js/v1";
		script.async = true;
		script.dataset.mapgl = "true";
		script.onload = finish;
		script.onerror = () => reject(new Error("Не удалось загрузить карту"));
		document.body.appendChild(script);
	});
}

export default function LeafletMap({
	lat,
	lng,
	height = "420px",
}: LeafletMapProps) {
	const mapElement = useRef<HTMLDivElement | null>(null);
	const mapInstance = useRef<MapGLInstance | null>(null);
	const markerInstance = useRef<MapGLMarker | null>(null);
	const safeSpotMarkers = useRef<MapGLMarker[]>([]);
	const lastFetchedCenter = useRef<[number, number] | null>(null);
	const [error, setError] = useState("");

	const hasPosition = typeof lat === "number" && typeof lng === "number";

	// Initial map setup — runs once when position first becomes available
	useEffect(() => {
		markerInstance.current?.destroy();
		safeSpotMarkers.current.forEach((m) => m.destroy());
		safeSpotMarkers.current = [];
		mapInstance.current?.destroy();
		mapInstance.current = null;
		markerInstance.current = null;
		lastFetchedCenter.current = null;

		let cancelled = false;

		const centerLat = hasPosition ? (lat as number) : DEFAULT_CENTER[1];
		const centerLng = hasPosition ? (lng as number) : DEFAULT_CENTER[0];

		lastFetchedCenter.current = [centerLat, centerLng];

		Promise.all([load2GIS(), fetchSafeSpots(centerLat, centerLng)])
			.then(([mapgl, spots]) => {
				if (cancelled || !mapElement.current) return;

				const center: [number, number] = hasPosition
					? [lng as number, lat as number]
					: DEFAULT_CENTER;

				mapInstance.current = new mapgl.Map(mapElement.current, {
					center,
					zoom: 13,
					key: API_KEY,
				});

				markerInstance.current = new mapgl.Marker(mapInstance.current, {
					coordinates: center,
				});

				safeSpotMarkers.current = spots.map(
					({ coords, color, emoji }) =>
						new mapgl.HtmlMarker(mapInstance.current!, {
							coordinates: coords,
							html: makeHtmlMarker(color, emoji),
							anchor: [18, 18],
						}),
				);
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					setError(
						err instanceof Error ? err.message : "Не удалось загрузить карту",
					);
				}
			});

		return () => {
			cancelled = true;
			markerInstance.current?.destroy();
			safeSpotMarkers.current.forEach((m) => m.destroy());
			safeSpotMarkers.current = [];
			mapInstance.current?.destroy();
			mapInstance.current = null;
			markerInstance.current = null;
		};
	}, [hasPosition]);

	// Position update effect — moves the marker and re-fetches safe spots
	// only when the user has moved more than ~200 metres from the last fetch
	useEffect(() => {
		if (!hasPosition || !mapInstance.current) return;

		const coords: [number, number] = [lng as number, lat as number];

		// Always move the user marker
		markerInstance.current?.destroy();
		markerInstance.current = new (window.mapgl as MapGLGlobal).Marker(
			mapInstance.current,
			{ coordinates: coords },
		);
		mapInstance.current.setCenter(coords);

		// Re-fetch safe spots only if moved significantly
		const prev = lastFetchedCenter.current;
		const movedEnough =
			!prev ||
			Math.abs((lat as number) - prev[0]) > REFETCH_THRESHOLD ||
			Math.abs((lng as number) - prev[1]) > REFETCH_THRESHOLD;

		if (!movedEnough) return;

		lastFetchedCenter.current = [lat as number, lng as number];

		fetchSafeSpots(lat as number, lng as number)
			.then((spots) => {
				if (!mapInstance.current) return;

				// Clear old safe spot markers
				safeSpotMarkers.current.forEach((m) => m.destroy());
				safeSpotMarkers.current = [];

				// Add new ones
				safeSpotMarkers.current = spots.map(
					({ coords: spotCoords, color, emoji }) =>
						new (window.mapgl as MapGLGlobal).HtmlMarker(mapInstance.current!, {
							coordinates: spotCoords,
							html: makeHtmlMarker(color, emoji),
							anchor: [18, 18],
						}),
				);
			})
			.catch(() => {
				// Silently ignore — safe spots are best-effort
			});
	}, [hasPosition, lat, lng]);

	if (error) {
		return (
			<div
				className="flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700"
				style={{ height }}
			>
				{error}
			</div>
		);
	}

	return (
		<div
			ref={mapElement}
			className="nur-map-shell overflow-hidden rounded-lg border border-slate-200"
			style={{ height }}
		/>
	);
}
