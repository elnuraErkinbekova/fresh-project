import { Bot, ExternalLink, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export default function AIPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-sky-700">
        <Bot className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-bold text-slate-950">AI Помощник</h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        Бот отвечает на вопросы о безопасности на русском языке и учитывает экстренные номера Кыргызстана.
      </p>

      <a href="https://t.me/nurai_safety_bot" target="_blank" rel="noreferrer" className="mt-8 inline-flex">
        <Button size="lg" className="gap-2 rounded-full bg-sky-600 px-8 py-6 text-base font-semibold shadow-lg shadow-sky-200 transition hover:bg-sky-700 hover:shadow-xl">
          Открыть в Telegram
          <ExternalLink className="h-4 w-4" />
        </Button>
      </a>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {["Советы в опасной ситуации", "Что делать прямо сейчас", "Куда обратиться за помощью"].map((text) => (
          <Card key={text} className="p-5 text-left">
            <Phone className="mb-3 h-5 w-5 text-rose-600" />
            <h2 className="font-semibold text-slate-950">{text}</h2>
          </Card>
        ))}
      </div>
    </section>
  );
}
