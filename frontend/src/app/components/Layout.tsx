import { LogOut, Menu } from "lucide-react";
import type { ReactNode } from "react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { getUserName, type User } from "../api";

interface LayoutProps {
  activePath: string;
  children: ReactNode;
  user: User | null;
  onLogout: () => void;
}

const navItems = [
  { href: "/", label: "Главная" },
  { href: "/sos", label: "SOS" },
  { href: "/contacts", label: "Доверенные лица" },
  { href: "/report/new", label: "Сообщить" },
];

export default function Layout({ activePath, children, user, onLogout }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <a href="/" className="flex items-center gap-3" aria-label="Voice of Nurai">
            <Logo className="h-12 w-auto" />
          </a>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  activePath === item.href
                    ? "bg-rose-50 text-rose-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {item.label}
              </a>
            ))}
            <a
              href="/ai"
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                activePath === "/ai" ? "bg-rose-50 text-rose-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              AI Помощник
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-slate-600 md:inline">
                  <strong className="text-slate-950">{getUserName(user)}</strong>
                </span>
                <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Выйти
                </Button>
              </>
            ) : (
              <a href="/login">
                <Button size="sm">Войти</Button>
              </a>
            )}
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Меню">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <span>Voice of Nurai — платформа безопасности и поддержки.</span>
          <span>Экстренные номера Кыргызстана: 112, 102, 103</span>
        </div>
      </footer>
    </div>
  );
}
