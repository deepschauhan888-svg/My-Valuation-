"use client";

import { useRef, useTransition } from "react";
import { createCityAction } from "@/lib/supabase/actions";
import { Plus, Loader2 } from "lucide-react";

export default function AddCityForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) =>
        startTransition(async () => {
          await createCityAction(formData);
          formRef.current?.reset();
        })
      }
      className="flex gap-2"
    >
      <input
        name="name"
        required
        placeholder="e.g. Chennai"
        className="flex-1 h-10 px-3 rounded-lg border border-line dark:border-line-dark bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
      />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-ink text-paper dark:bg-paper dark:text-ink text-sm font-semibold hover:opacity-90 transition-opacity tap-feedback disabled:opacity-60 shrink-0"
      >
        {isPending ? <Loader2 size={14} className="animate-spin" strokeWidth={1.5} /> : <Plus size={14} strokeWidth={1.5} />}
        Add City
      </button>
    </form>
  );
}
