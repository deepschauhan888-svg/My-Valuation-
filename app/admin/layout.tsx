import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (profile?.role !== "admin") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-display font-bold text-2xl mb-2">Access restricted</h1>
          <p className="text-navy-400 max-w-sm">
            This account is signed in but isn&apos;t provisioned as an admin. Ask an existing admin to update
            your role in the <code className="font-mono text-xs">profiles</code> table.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar userEmail={user.email ?? ""} />
      <main className="flex-1 min-h-screen">{children}</main>
    </div>
  );
}
