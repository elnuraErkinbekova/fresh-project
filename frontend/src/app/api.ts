export interface User {
  id?: number;
  username?: string;
  name?: string;
  email?: string;
}

export interface Report {
  id: number;
  category: ReportCategory;
  description: string | null;
  location: string;
  photo_url: string | null;
  created_at: string;
}

export type ReportCategory = "harassment" | "suspicious_person" | "dangerous_area" | "other";

export interface Contact {
  id: number;
  name: string;
  surname: string;
  email: string;
  telegram_chat_id: number | null;
  invite_status: "pending" | "accepted";
  created_at?: string;
}

export interface TrackEvent {
  id: number;
  session_id: string;
  lat: string | number | null;
  lng: string | number | null;
  status: "active" | "resolved";
  created_at: string;
  resolved_at: string | null;
  user_name: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME ?? "nurai_safety_bot";

export const config = {
  apiUrl: API_URL,
  botUrl: `https://t.me/${BOT_USERNAME}`,
  wsUrl: API_URL.replace(/^http/, "ws") + "/ws",
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const details = Array.isArray(data?.details) ? `: ${data.details.join(", ")}` : "";
    throw new ApiError(data?.error ? `${data.error}${details}` : "Произошла ошибка. Попробуйте ещё раз.", response.status);
  }

  return data as T;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const hasFormData = init.body instanceof FormData;

  if (!hasFormData && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError("Не удалось связаться с сервером", 0);
  }

  return parseResponse<T>(response);
}

export function requestGeolocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Геолокация не поддерживается вашим браузером"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

export function formatReportCategory(category: ReportCategory): string {
  const labels: Record<ReportCategory, string> = {
    harassment: "Домогательство",
    suspicious_person: "Подозрительный человек",
    dangerous_area: "Опасная зона",
    other: "Другое",
  };

  return labels[category];
}

export function getUserName(user: User | null): string {
  return user?.username ?? user?.name ?? "пользователь";
}

export function formatRelativeSeconds(date: Date | null): string {
  if (!date) {
    return "Обновлений пока нет";
  }

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 5) {
    return "Обновлено только что";
  }

  return `Обновлено ${seconds} сек. назад`;
}
