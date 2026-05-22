import { useEffect, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { apiRequest, type Contact } from "../api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadContacts = () => {
    setLoading(true);
    apiRequest<{ contacts: Contact[] }>("/api/contacts")
      .then((data) => setContacts(data.contacts))
      .catch((contactsError: unknown) => setError(contactsError instanceof Error ? contactsError.message : "Не удалось загрузить контакты"))
      .finally(() => setLoading(false));
  };

  useEffect(loadContacts, []);

  const addContact = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = await apiRequest<{ message: string; contact: Contact }>("/api/contacts", {
        method: "POST",
        body: JSON.stringify({ name, surname, email }),
      });
      setContacts((current) => [data.contact, ...current]);
      setName("");
      setSurname("");
      setEmail("");
      setMessage(data.message);
    } catch (contactError: unknown) {
      setError(contactError instanceof Error ? contactError.message : "Не удалось добавить контакт");
    }
  };

  const deleteContact = async (id: number) => {
    setError("");
    setMessage("");

    try {
      await apiRequest<{ message: string }>(`/api/contacts/${id}`, { method: "DELETE" });
      setContacts((current) => current.filter((contact) => contact.id !== id));
      setMessage("Контакт удалён");
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : "Не удалось удалить контакт");
    }
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Доверенные лица</h1>
        <p className="mt-3 text-slate-600">Эти люди получат email при SOS. Telegram-уведомления уйдут тем, кто подключил бота.</p>

        <Card className="mt-6 p-5">
          <form className="space-y-4" onSubmit={addContact}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Имя</Label>
                <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="surname">Фамилия</Label>
                <Input id="surname" value={surname} onChange={(event) => setSurname(event.target.value)} required className="mt-2" />
              </div>
            </div>
            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input id="contactEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-2" />
            </div>
            <Button type="submit" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Добавить контакт
            </Button>
          </form>
        </Card>

        {message && <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">{message}</p>}
        {error && <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</p>}
      </div>

      <div className="space-y-4">
        {loading && <p className="text-slate-600">Загружаем контакты...</p>}
        {!loading && contacts.length === 0 && <Card className="p-6 text-slate-600">Контакты пока не добавлены.</Card>}
        {contacts.map((contact) => (
          <Card key={contact.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                {contact.name} {contact.surname}
              </h2>
              <p className="text-sm text-slate-600">{contact.email}</p>
              <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {contact.invite_status === "accepted" ? "Подключён к Telegram" : "Ожидает"}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={() => void deleteContact(contact.id)} aria-label="Удалить контакт">
              <Trash2 className="h-4 w-4 text-rose-600" />
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
