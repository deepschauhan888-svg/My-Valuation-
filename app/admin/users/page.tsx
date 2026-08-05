export default function UsersPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="mb-6">
        <div className="eyebrow mb-3">Users</div>
        <h1 className="font-display font-bold text-3xl tracking-tight">Coming soon</h1>
      </div>
      <div className="card-surface p-8 text-sm text-navy-400 measure">
        Multi-admin management (inviting analysts, assigning roles, per-city permissions) isn&apos;t built yet.
        Today, admin accounts are provisioned directly in Supabase Auth, and every account gets a{" "}
        <code className="font-mono text-xs">profiles</code> row with an <code className="font-mono text-xs">admin</code> role by default. See the README for how to add a teammate in the meantime.
      </div>
    </div>
  );
}
