"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/layout/AppHeader";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#F6EFE5] px-6 py-8 text-[#2B2118]">
      <section className="mx-auto max-w-6xl">
        <AppHeader />

        <section className="mx-auto max-w-xl rounded-3xl bg-[#FFFAF2] p-8 shadow-sm">
          <h1 className="text-4xl font-bold">Login</h1>

          <p className="mt-3 text-[#7A6A5A]">
            Sign in to manage Ostford Ranch records.
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Your password"
                required
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[#5B3A29] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3f281c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}