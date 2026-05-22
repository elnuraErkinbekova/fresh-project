import { useEffect, useMemo, useState } from "react";
import { apiRequest, type User } from "./api";
import AIPage from "./components/AIPage";
import ActiveSosPage from "./components/ActiveSosPage";
import ContactsPage from "./components/ContactsPage";
import HomePage from "./components/HomePage";
import Layout from "./components/Layout";
import LoginPage from "./components/LoginPage";
import ReportPage from "./components/ReportPage";
import SOSPage from "./components/SOSPage";
import TrackPage from "./components/TrackPage";

interface AuthResponse {
	user: User;
}

export default function App() {
	const [currentPath, setCurrentPath] = useState(window.location.pathname);
	const [user, setUser] = useState<User | null>(null);
	const [authChecked, setAuthChecked] = useState(false);
	const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
		null,
	); // add this
	const activeSosSessionId = useMemo(
		() => sessionStorage.getItem("activeSosSessionId"),
		[currentPath],
	);

	useEffect(() => {
		navigator.geolocation?.getCurrentPosition(
			(pos) =>
				setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
			() => undefined,
			{ enableHighAccuracy: true, timeout: 8000 },
		);
	}, []);

	const navigate = (path: string) => {
		window.history.pushState({}, "", path);
		setCurrentPath(new URL(path, window.location.origin).pathname);
		window.scrollTo(0, 0);
	};

	useEffect(() => {
		const handlePathChange = () => setCurrentPath(window.location.pathname);

		const handleClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			const link = target.closest("a");

			if (
				!link ||
				!link.href ||
				!link.href.startsWith(window.location.origin) ||
				link.target === "_blank"
			) {
				return;
			}

			event.preventDefault();
			navigate(new URL(link.href).pathname);
		};

		window.addEventListener("popstate", handlePathChange);
		document.addEventListener("click", handleClick);

		return () => {
			window.removeEventListener("popstate", handlePathChange);
			document.removeEventListener("click", handleClick);
		};
	}, []);

	useEffect(() => {
		apiRequest<AuthResponse>("/api/auth/me")
			.then((data) => setUser(data.user))
			.catch(() => setUser(null))
			.finally(() => setAuthChecked(true));
	}, []);

	useEffect(() => {
		const protectedPaths = [
			"/sos",
			"/sos/active",
			"/contacts",
			"/report",
			"/report/new",
		];
		const shouldRedirect =
			authChecked && !user && protectedPaths.includes(currentPath);

		if (shouldRedirect) {
			navigate("/login");
		}
	}, [authChecked, currentPath, user]);

	const handleLogout = async () => {
		try {
			await apiRequest<{ message: string }>("/api/auth/logout", {
				method: "POST",
			});
		} catch {
			// Даже если сервер недоступен, очищаем локальное состояние интерфейса.
		} finally {
			setUser(null);
			sessionStorage.removeItem("activeSosSessionId");
			navigate("/");
		}
	};

	const handleAuthSuccess = (nextUser: User) => {
		setUser(nextUser);
		navigator.geolocation?.getCurrentPosition(
			(pos) =>
				setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
			() => undefined,
			{ enableHighAccuracy: true, timeout: 8000 },
		);
		navigate("/");
	};

	const renderPage = () => {
		if (!authChecked) {
			return (
				<div className="mx-auto max-w-7xl px-4 py-12 text-slate-600">
					Загрузка...
				</div>
			);
		}

		if (currentPath === "/login") {
			return <LoginPage mode="login" onAuthSuccess={handleAuthSuccess} />;
		}

		if (currentPath === "/register") {
			return <LoginPage mode="register" onAuthSuccess={handleAuthSuccess} />;
		}

		if (currentPath === "/ai") {
			return <AIPage />;
		}

		if (currentPath === "/sos") {
			return (
				<SOSPage
					user={user}
					onStarted={(sessionId) =>
						navigate(`/sos/active?sessionId=${sessionId}`)
					}
					onCancelled={() => navigate("/")}
				/>
			);
		}

		if (currentPath === "/sos/active") {
			return (
				<ActiveSosPage
					sessionId={
						new URLSearchParams(window.location.search).get("sessionId") ??
						activeSosSessionId
					}
					onResolved={() => navigate("/")}
				/>
			);
		}

		if (currentPath === "/contacts") {
			return <ContactsPage />;
		}

		if (currentPath === "/report/new" || currentPath === "/report") {
			return <ReportPage onCreated={() => navigate("/")} />;
		}

		return (
			<HomePage
				user={user}
				lat={position?.lat ?? null}
				lng={position?.lng ?? null}
			/>
		);
	};

	if (currentPath.startsWith("/track/")) {
		const sessionId = currentPath.replace("/track/", "");
		return <TrackPage sessionId={sessionId} />;
	}

	return (
		<Layout activePath={currentPath} user={user} onLogout={handleLogout}>
			{renderPage()}
		</Layout>
	);
}
