import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, full_name, created_at").eq("id", user?.id ?? "").maybeSingle();

  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <div className="mb-8">
        <div className="eyebrow mb-3">Settings</div>
        <h1 className="font-display font-bold text-3xl tracking-tight">Your account</h1>
      </div>

      <div className="card-surface p-6 space-y-4 text-sm">
        <div className="flex justify-between border-b border-line dark:border-line-dark pb-3">
          <span className="text-navy-400">Email</span>
          <span className="font-medium">{user?.email}</span>
        </div>
        <div className="flex justify-between border-b border-line dark:border-line-dark pb-3">
          <span className="text-navy-400">Role</span>
          <span className="font-medium capitalize">{profile?.role ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-navy-400">Admin since</span>
          <span className="font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN") : "—"}</span>
        </div>
      </div>

      <form action="/auth/signout" method="post" className="mt-6">
        <button type="submit" className="h-10 px-4 rounded-full border border-line dark:border-line-dark text-sm font-semibold hover:border-discount hover:text-discount transition-colors tap-feedback">
          Sign out
        </button>
      </form>
    </div>
  );
}
