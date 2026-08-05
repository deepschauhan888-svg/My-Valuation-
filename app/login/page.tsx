"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(searchParams.get("next") ?? "/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 font-display font-bold text-lg mb-8 justify-center">
          <span className="w-2 h-2 rounded-full bg-gold" />
          ValueTrace
        </div>

        <div className="card-surface p-8">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={15} strokeWidth={1.5} className="text-navy-400" />
            <h1 className="font-display font-semibold text-lg">Admin sign in</h1>
          </div>
          <p className="text-sm text-navy-400 mb-6">Rule Engine access is restricted to authenticated admins.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-navy-400 mb-1.5 block">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-line dark:border-line-dark bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-navy-400 mb-1.5 block">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-line dark:border-line-dark bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </label>

            {error && <p className="text-sm text-discount">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink font-semibold hover:opacity-90 transition-opacity tap-feedback disabled:opacity-60"
            >
              {loading && <Loader2 size={15} className="animate-spin" strokeWidth={1.5} />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-xs text-navy-400 text-center mt-6">
          Admin accounts are created in Supabase directly — see the README for setup.
        </p>
      </div>
    </main>
  );
}
