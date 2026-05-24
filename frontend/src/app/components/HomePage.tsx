import { useEffect, useState } from "react";
import { AlertCircle, Bot, FileText, MapPin, Users } from "lucide-react";
import {
	apiRequest,
	config,
	formatReportCategory,
	type Report,
	type User,
} from "../api";
import LeafletMap from "./LeafletMap";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface HomePageProps {
	user: User | null;
	lat: number | null; // add
	lng: number | null; // add
}

export default function HomePage({ user, lat, lng }: HomePageProps) {
	const [reports, setReports] = useState<Report[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		apiRequest<{ reports: Report[] }>("/api/reports")
			.then((data) => setReports(data.reports))
			.catch((reportsError: unknown) => {
				setError(
					reportsError instanceof Error
						? reportsError.message
						: "Не удалось загрузить репорты",
				);
			})
			.finally(() => setLoading(false));
	}, []);

	const protectedHref = (href: string) => (user ? href : "/login");

	return (
		<>
			<section className="border-b border-slate-200 bg-white">
				<div className="mx-auto max-w-7xl px-4 py-14">
					<div className="mx-auto max-w-4xl text-center">
						<p className="mb-3 text-sm font-semibold uppercase tracking-wide text-rose-700">
							Безопасность в один клик
						</p>
						<h1 className="leading-tight">
							<span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-bold uppercase text-transparent md:text-6xl">
								Voice of Nurai
							</span>
							<span className="mt-3 block text-2xl font-semibold text-slate-950 md:text-4xl">
								помогает быстро позвать на помощь
							</span>
						</h1>
						<p className="mt-5 max-w-2xl mx-auto text-lg leading-8 text-slate-600">
							Отправляйте SOS близким, делитесь текущей геолокацией, сообщайте
							об опасных местах и получайте подсказки AI-помощника.
						</p>
					</div>

					<div className="mx-auto mt-10 max-w-5xl rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm">
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<a
								href={protectedHref("/sos")}
								className="group rounded-md border border-rose-200 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md"
							>
								<span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700 transition group-hover:bg-rose-600 group-hover:text-white">
									<AlertCircle className="h-6 w-6" />
								</span>
								<span className="mt-3 block text-base font-semibold text-slate-950">
									SOS
								</span>
							</a>
							<a
								href="/ai"
								className="group rounded-md border border-sky-200 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
							>
								<span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700 transition group-hover:bg-sky-600 group-hover:text-white">
									<Bot className="h-6 w-6" />
								</span>
								<span className="mt-3 block text-base font-semibold text-slate-950">
									AI Помощник
								</span>
							</a>
							<a
								href={protectedHref("/contacts")}
								className="group rounded-md border border-emerald-200 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
							>
								<span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
									<Users className="h-6 w-6" />
								</span>
								<span className="mt-3 block text-base font-semibold text-slate-950">
									Доверенные лица
								</span>
							</a>
							<a
								href={protectedHref("/report/new")}
								className="group rounded-md border border-amber-200 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
							>
								<span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 transition group-hover:bg-amber-500 group-hover:text-white">
									<FileText className="h-6 w-6" />
								</span>
								<span className="mt-3 block text-base font-semibold text-slate-950">
									Сообщить
								</span>
							</a>
						</div>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-4 py-10">
				<div className="mb-4 flex items-center gap-2">
					<MapPin className="h-5 w-5 text-rose-600" />
					<h2 className="text-2xl font-bold text-slate-950">
						Карта безопасности
					</h2>
				</div>
				<LeafletMap lat={lat} lng={lng} height="360px" />
			</section>

			<section className="mx-auto max-w-7xl px-4 py-12">
				<div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
					<div>
						<h2 className="text-3xl font-bold text-slate-950">
							Последние репорты
						</h2>
						<p className="mt-2 text-slate-600">
							Репорты видны всем, авторы остаются анонимными.
						</p>
					</div>
					<a href={protectedHref("/report/new")}>
						<Button variant="outline" className="gap-2">
							<FileText className="h-4 w-4" />
							Создать репорт
						</Button>
					</a>
				</div>

				{loading && <p className="text-slate-600">Загружаем репорты...</p>}
				{error && (
					<p className="rounded-md border border-rose-200 bg-rose-50 p-4 text-rose-700">
						{error}
					</p>
				)}
				{!loading && !error && reports.length === 0 && (
					<Card className="p-6 text-slate-600">
						Пока нет репортов. Первый репорт появится здесь после публикации.
					</Card>
				)}

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{reports.map((report) => (
						<Card key={report.id} className="overflow-hidden bg-white">
							{report.photo_url && (
								<img
									src={report.photo_url}
									alt="Фото репорта"
									className="h-48 w-full object-cover"
								/>
							)}
							<div className="space-y-3 p-5">
								<div className="flex items-start justify-between gap-3">
									<span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
										{formatReportCategory(report.category)}
									</span>
									<time className="text-xs text-slate-500">
										{new Date(report.created_at).toLocaleDateString("ru-RU")}
									</time>
								</div>
								{report.description && (
									<p className="leading-7 text-slate-700">
										{report.description}
									</p>
								)}
								<div className="flex items-start gap-2 text-sm text-slate-600">
									<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
									<span>{report.location}</span>
								</div>
							</div>
						</Card>
					))}
				</div>
			</section>
		</>
	);
}
