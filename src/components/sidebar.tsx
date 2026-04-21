"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Users, Server, UserCircle, Shield } from "lucide-react";

type NavItem = { href: string; label: string; icon: typeof Users; roles?: ("SUPER" | "ADMIN" | "MANAGER" | "USER")[] };

const navItems: NavItem[] = [
  { href: "/users", label: "Users", icon: Users, roles: ["SUPER", "ADMIN", "MANAGER"] },
  { href: "/systems", label: "Systems", icon: Server, roles: ["SUPER"] },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-4 font-semibold">
        <Shield className="h-5 w-5 text-primary" />
        <span>User Management</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {visibleNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
