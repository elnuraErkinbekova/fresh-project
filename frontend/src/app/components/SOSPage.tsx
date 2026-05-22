import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiRequest, requestGeolocation, type User } from "../api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface SOSPageProps {
	user: User | null;
	onStarted: (sessionId: string) => void;
	onCancelled: () => void;
}

export default function SOSPage({
	user,
	onStarted,
	onCancelled,
}: SOSPageProps) {
	const [countdown, setCountdown] = useState<number>(3);
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (countdown === 0) {
			void triggerSos();
			return undefined;
		}

		const timer = window.setTimeout(
			() => setCountdown((value) => value - 1),
			1000,
		);
		return () => window.clearTimeout(timer);
	}, [countdown]);

	const triggerSos = async () => {
		if (!user || submitting) return;
		setSubmitting(true);

		try {
			const position = await requestGeolocation();
			const data = await apiRequest<{ message: string; sessionId: string }>(
				"/api/sos/trigger",
				{
					method: "POST",
					body: JSON.stringify({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					}),
				},
			);
			sessionStorage.setItem("activeSosSessionId", data.sessionId);
			onStarted(data.sessionId);
		} catch (sosError: unknown) {
			setCountdown(3); // reset so user can try again or cancel
			const message = sosError instanceof Error ? sosError.message : "";
			setError(
				message.includes("Geolocation")
					? "Для работы SOS необходимо разрешить доступ к геолокации"
					: message || "Не удалось отправить SOS",
			);
			setSubmitting(false);
		}
	};

	return (
		<section className="mx-auto flex min-h-[72vh] max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
			<Card className="w-full max-w-md p-8">
				<p className="text-2xl font-semibold text-slate-950">
					{countdown > 0
						? `Отправка через ${countdown}...`
						: "Отправляем SOS..."}
				</p>
				<p className="mt-3 text-slate-600">
					Нажмите «Остановить SOS», чтобы отменить.
				</p>

				{countdown > 0 && !submitting && (
					<Button
						variant="outline"
						size="lg"
						className="mt-6 w-full gap-2 border-slate-300 text-slate-700"
						onClick={onCancelled}
					>
						<X className="h-5 w-5" />
						Остановить SOS
					</Button>
				)}

				{error && (
					<p className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-4 text-rose-700">
						{error}
					</p>
				)}
			</Card>
		</section>
	);
}
