"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });

    if (result?.error) {
      setError("The email or password did not match.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <label className="block text-sm font-bold text-slate-700">
        Email
        <input name="email" type="email" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Password
        <input name="password" type="password" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </label>
      {error ? <p className="rounded-md bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800">{error}</p> : null}
      <button className="focus-ring w-full rounded-md bg-lagoon px-4 py-2 font-black text-white hover:bg-current">Sign in</button>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        skillLevel: formData.get("skillLevel")
      })
    });

    if (!response.ok) {
      setError("Could not create that account.");
      return;
    }

    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });
    router.push("/");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <label className="block text-sm font-bold text-slate-700">
        Name
        <input name="name" type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Email
        <input name="email" type="email" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Skill level
        <select name="skillLevel" defaultValue="INTERMEDIATE" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Password
        <input name="password" type="password" minLength={8} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </label>
      {error ? <p className="rounded-md bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800">{error}</p> : null}
      <button className="focus-ring w-full rounded-md bg-lagoon px-4 py-2 font-black text-white hover:bg-current">Create account</button>
    </form>
  );
}
