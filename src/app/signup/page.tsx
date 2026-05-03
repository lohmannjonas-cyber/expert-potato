import Link from "next/link";
import { SignupForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-black text-slate-950">Create account</h1>
      <p className="mt-2 text-slate-600">Save home location, rider preferences, favorites, and email alerts.</p>
      <div className="mt-6">
        <SignupForm />
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/login" className="font-black text-lagoon">
          Sign in
        </Link>
      </p>
    </main>
  );
}
