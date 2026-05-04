import Link from "next/link";
import { SignupForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-black text-slate-950">Konto erstellen</h1>
      <p className="mt-2 text-slate-600">Speichere Heimatort, Fahrervorlieben, Favoriten und E-Mail-Alarme.</p>
      <div className="mt-6">
        <SignupForm />
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Schon registriert?{" "}
        <Link href="/login" className="font-black text-lagoon">
          Anmelden
        </Link>
      </p>
    </main>
  );
}
