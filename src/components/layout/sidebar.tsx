"use client";

import {
  Home,
  Users,
  Calendar,
  Stethoscope,
  Syringe,
  AlertCircle,
  Activity,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/families", label: "Families", icon: Users },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/exams", label: "Exams", icon: Stethoscope },
  { href: "/vaccines", label: "Vaccines", icon: Syringe },
  { href: "/allergies", label: "Allergies", icon: AlertCircle },
  { href: "/conditions", label: "Conditions", icon: Activity },
  { href: "/profile", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-muted/30 md:block">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="text-2xl">🏥</span>
        <Link href="/dashboard" className="font-bold">
          FamilyCare
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
