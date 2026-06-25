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
  Mail,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useMyInvitations } from "@/hooks/use-invitations";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/families", label: "Families", icon: Users },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/exams", label: "Exams", icon: Stethoscope },
  { href: "/vaccines", label: "Vaccines", icon: Syringe },
  { href: "/allergies", label: "Allergies", icon: AlertCircle },
  { href: "/conditions", label: "Conditions", icon: Activity },
  { href: "/invitations", label: "Invitations", icon: Mail },
  { href: "/profile", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  // Pending invitations only (status = 1). Used for the badge on the
  // Invitations nav item.
  const { data: pendingInvitations = [] } = useMyInvitations(1);
  const pendingCount = pendingInvitations.length;

  return (
    <aside className="bg-muted/30 hidden w-64 shrink-0 border-r md:block">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="text-2xl">🏥</span>
        <Link href="/dashboard" className="font-bold">
          FamilyCare
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          const showBadge = href === "/invitations" && pendingCount > 0;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <Badge
                  variant={isActive ? "secondary" : "default"}
                  className="h-5 min-w-5 justify-center px-1.5 text-xs"
                >
                  {pendingCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
