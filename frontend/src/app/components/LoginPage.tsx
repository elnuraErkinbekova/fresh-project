import { useState } from "react";
import { apiRequest, type User } from "../api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface LoginPageProps {
  mode: "login" | "register";
  onAuthSuccess: (user: User) => void;
}

interface AuthResponse {
  message: string;
  user: User;
}

function russianError(message: string): string {
  if (message.includes("Validation failed")) {
    return "Проверьте поля формы. Пароль должен быть не короче 6 символов.";
  }

  if (message.includes("Email already registered") || message.includes("Duplicate")) {
    return "Этот email уже зарегистрирован";
  }

  if (message.includes("Invalid email or password")) {
    return "Неверный email или пароль";
  }

  return message;
}

export default function LoginPage({ mode, onAuthSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (isRegister && password !== confirmPassword) {
      setError("Пароль и подтверждение пароля не совпадают");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await apiRequest<AuthResponse>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ username: username.trim(), email: email.trim(), password }),
        });
      }

      const data = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      onAuthSuccess(data.user);
    } catch (authError: unknown) {
      const message = authError instanceof Error ? authError.message : "Не удалось выполнить запрос";
      setError(russianError(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-950">{isRegister ? "Регистрация" : "Вход"}</h1>
        <p className="mt-3 text-slate-600">{isRegister ? "Создайте аккаунт, чтобы пользоваться SOS и репортами" : "Войдите, чтобы продолжить"}</p>
      </div>

      <Card className="p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <Label htmlFor="username">Имя пользователя</Label>
              <Input id="username" value={username} onChange={(event) => setUsername(event.target.value)} required className="mt-2" />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-2" />
          </div>

          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-2" />
          </div>

          {isRegister && (
            <div>
              <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="mt-2"
              />
            </div>
          )}

          {error && <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Отправка..." : isRegister ? "Зарегистрироваться" : "Войти"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-slate-600">
        {isRegister ? "Уже есть аккаунт? " : "Нет аккаунта? "}
        <a href={isRegister ? "/login" : "/register"} className="font-medium text-rose-700 hover:text-rose-800">
          {isRegister ? "Войти" : "Зарегистрироваться"}
        </a>
      </p>
    </section>
  );
}
