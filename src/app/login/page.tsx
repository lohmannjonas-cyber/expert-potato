import Link from "next/link";
import { LoginForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-black text-slate-950">Anmelden</h1>
      <p className="mt-2 text-slate-600">Nutze gespeicherte Spots, dein Fahrerprofil und deine Alarme.</p>
      <div className="mt-6">
        <LoginForm />
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Neu hier?{" "}
        <Link href="/signup" className="font-black text-lagoon">
          Konto erstellen
        </Link>
      </p>
    </main>
  );
}
