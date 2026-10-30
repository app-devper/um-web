import { LayoutGrid, Server, UserCircle, Users } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof Users;
  roles?: ("SUPER" | "ADMIN" | "MANAGER" | "USER")[];
};

export const navItems: NavItem[] = [
  { href: "/", label: "Apps", icon: LayoutGrid },
  { href: "/users", label: "Users", icon: Users, roles: ["SUPER", "ADMIN", "MANAGER"] },
  { href: "/systems", label: "Systems", icon: Server, roles: ["SUPER"] },
  { href: "/profile", label: "Profile", icon: UserCircle },
];
