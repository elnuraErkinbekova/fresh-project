import { useEffect, useMemo, useState } from "react";
import { apiRequest, config, formatRelativeSeconds, type TrackEvent } from "../api";
import LeafletMap from "./LeafletMap";
import { Card } from "./ui/card";

interface TrackPageProps {
  sessionId: string;
}

export default function TrackPage({ sessionId }: TrackPageProps) {
  const [event, setEvent] = useState<TrackEvent | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [status, setStatus] = useState<"live" | "resolved" | "disconnected">("live");
  const [error, setError] = useState("");
  const [, forceTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => forceTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    apiRequest<{ event: TrackEvent }>(`/api/sos/track/${sessionId}`)
      .then((data) => {
        setEvent(data.event);
        const initialLat = data.event.lat === null ? NaN : Number(data.event.lat);
        const initialLng = data.event.lng === null ? NaN : Number(data.event.lng);
        setLat(Number.isFinite(initialLat) ? initialLat : null);
        setLng(Number.isFinite(initialLng) ? initialLng : null);
        setStatus(data.event.status === "resolved" ? "resolved" : "live");
      })
      .catch((trackError: unknown) => setError(trackError instanceof Error ? trackError.message : "Не удалось загрузить SOS-сессию"));
  }, [sessionId]);

  useEffect(() => {
    const socket = new WebSocket(config.wsUrl);

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ type: "join", role: "watcher", sessionId }));
    });

    socket.addEventListener("message", (message) => {
      const data = JSON.parse(message.data as string) as { type: string; lat?: number; lng?: number };

      if (data.type === "location" && typeof data.lat === "number" && typeof data.lng === "number") {
        setLat(data.lat);
        setLng(data.lng);
        setLastUpdate(new Date());
        setStatus("live");
      }

      if (data.type === "resolved") {
        setStatus("resolved");
      }

      if (data.type === "sender_disconnected") {
        setStatus("disconnected");
      }
    });

    return () => socket.close();
  }, [sessionId]);

  const statusText = useMemo(() => {
    if (status === "resolved") {
      return `${event?.user_name ?? "Пользователь"} в безопасности. SOS завершён.`;
    }

    if (status === "disconnected") {
      return "Соединение потеряно";
    }

    return "LIVE";
  }, [event?.user_name, status]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Отслеживание SOS</h1>
          <p className="mt-2 text-slate-600">Пользователь: {event?.user_name ?? "загрузка..."}</p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${
            status === "live" ? "bg-rose-100 text-rose-700" : status === "resolved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
          }`}
        >
          {statusText}
        </span>
      </div>

      {error ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</p>
      ) : (
        <>
          <LeafletMap lat={lat} lng={lng} />
          <Card className="mt-5 p-5 text-sm text-slate-600">
            <p>{formatRelativeSeconds(lastUpdate)}</p>
            <p className="mt-2">Координаты: {lat !== null && lng !== null ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : "нет данных"}</p>
          </Card>
        </>
      )}
    </section>
  );
}
