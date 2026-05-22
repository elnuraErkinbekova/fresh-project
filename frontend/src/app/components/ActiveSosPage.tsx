import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { apiRequest, config } from "../api";
import LeafletMap from "./LeafletMap";
import { Button } from "./ui/button";

interface ActiveSosPageProps {
  sessionId: string | null;
  onResolved: () => void;
}

export default function ActiveSosPage({ sessionId, onResolved }: ActiveSosPageProps) {
  const socketRef = useRef<WebSocket | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setError("Активная SOS-сессия не найдена");
      return undefined;
    }

    const socket = new WebSocket(config.wsUrl);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ type: "join", role: "sender", sessionId }));
    });

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLat = position.coords.latitude;
          const nextLng = position.coords.longitude;
          setLat(nextLat);
          setLng(nextLng);

          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "location", lat: nextLat, lng: nextLng }));
          }
        },
        () => setError("Для работы SOS необходимо разрешить доступ к геолокации"),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    };

    sendLocation();
    const interval = window.setInterval(sendLocation, 3000);

    return () => {
      window.clearInterval(interval);
      socket.close();
      socketRef.current = null;
    };
  }, [sessionId]);

  const resolveSos = async () => {
    if (!sessionId) {
      return;
    }

    setResolving(true);
    setError("");

    try {
      await apiRequest<{ message: string }>("/api/sos/resolve", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "resolved", sessionId }));
      }

      sessionStorage.removeItem("activeSosSessionId");
      onResolved();
    } catch (resolveError: unknown) {
      setError(resolveError instanceof Error ? resolveError.message : "Не удалось завершить SOS");
    } finally {
      setResolving(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Идёт передача местоположения</h1>
        <p className="mt-2 text-slate-600">Оставайтесь на этой странице, пока SOS активен.</p>
      </div>

      <LeafletMap lat={lat} lng={lng} />

      <div className="mt-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-600">
          Координаты: {lat !== null && lng !== null ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : "ожидаем геолокацию"}
        </div>
        <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={resolveSos} disabled={resolving}>
          <ShieldCheck className="h-5 w-5" />
          {resolving ? "Завершаем..." : "Я в безопасности — остановить"}
        </Button>
      </div>

      {error && <p className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</p>}
    </section>
  );
}
