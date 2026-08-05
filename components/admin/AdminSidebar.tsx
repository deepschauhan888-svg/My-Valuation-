"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, SlidersHorizontal, History, BarChart3, Users, Settings, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/cities", label: "Cities", icon: Building2 },
  { href: "/admin/rule-engine", label: "Rule Engine", icon: SlidersHorizontal },
  { href: "/admin/versions", label: "Version History", icon: History },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-line dark:border-line-dark min-h-screen flex flex-col">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="w-2 h-2 rounded-full bg-gold" />
          ValueTrace
        </Link>
        <div className="eyebrow mt-1">Admin</div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors tap-feedback ${
                isActive ? "bg-ink text-paper dark:bg-paper dark:text-ink" : "text-navy-400 hover:bg-navy-50 dark:hover:bg-white/5"
              }`}
            >
              <item.icon size={16} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-line dark:border-line-dark">
        <div className="text-xs text-navy-400 truncate mb-3 px-1">{userEmail}</div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-400 hover:bg-navy-50 dark:hover:bg-white/5 transition-colors tap-feedback"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
