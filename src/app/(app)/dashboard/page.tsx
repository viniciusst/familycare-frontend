"use client";

import { AlertTriangle, Calendar, FlaskConical, Mail, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/allergies/severity-badge";
import { PageHeader } from "@/components/layout/page-layout";
import { useAllAllergies } from "@/hooks/use-allergies";
import { useAllAppointments } from "@/hooks/use-appointments";
import { useAllExams } from "@/hooks/use-exams";
import { useFamilies } from "@/hooks/use-families";
import { useMe } from "@/hooks/use-me";
import { useMyInvitations } from "@/hooks/use-invitations";

export default function DashboardPage() {
  const { data: me } = useMe();
  const { data: families = [] } = useFamilies();
  const { data: appointments = [], isLoading: isLoadingAppointments } = useAllAppointments();
  const { data: allergies = [], isLoading: isLoadingAllergies } = useAllAllergies();
  const { data: exams = [], isLoading: isLoadingExams } = useAllExams();
  const { data: pendingInvitations = [] } = useMyInvitations(1);

  // Upcoming appointments: scheduled status (1), in the future, top 3 nearest.
  const now = new Date();
  const upcomingAppointments = appointments
    .filter((a) => a.status === 1 && new Date(a.scheduledAt) >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3);

  // Severe / life-threatening allergies first.
  const criticalAllergies = allergies.filter((a) => a.severity >= 3).slice(0, 4);

  // Total members across families.
  const totalMembers = families.reduce((sum, f) => sum + (f.memberCount ?? 0), 0);

  // Friendly display name.
  const greetingName = me?.email?.split("@")[0] ?? "there";

  return (
    <>
      <PageHeader
        title={`Welcome back, ${greetingName}`}
        description="A quick look at what's happening across your families."
      />

      {/* Top stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Families" value={families.length} href="/families" />
        <StatCard icon={Users} label="Members" value={totalMembers} href="/families" />
        <StatCard icon={FlaskConical} label="Exams" value={exams.length} href="/exams" />
        <StatCard
          icon={Mail}
          label="Pending invites"
          value={pendingInvitations.length}
          href="/invitations"
          highlight={pendingInvitations.length > 0}
        />
      </div>

      {/* Two-column main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-h4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming appointments
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/appointments">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingAppointments && <Skeleton className="h-24 w-full" />}

            {!isLoadingAppointments && upcomingAppointments.length === 0 && (
              <p className="text-muted-foreground text-body py-6 text-center">
                No upcoming appointments.
              </p>
            )}

            {!isLoadingAppointments &&
              upcomingAppointments.map((apt) => {
                const date = new Date(apt.scheduledAt);
                return (
                  <div
                    key={apt.id}
                    className="hover:bg-muted/50 -mx-2 flex items-start justify-between gap-3 rounded-md px-2 py-2.5 transition-colors"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="truncate font-medium">{apt.memberName}</span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-muted-foreground truncate text-sm">
                          {apt.specialty}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {date.toLocaleDateString()} at{" "}
                        {date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {apt.doctorName && ` · ${apt.doctorName}`}
                      </div>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        {/* Severe allergies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-h4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Critical allergies
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/allergies">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingAllergies && <Skeleton className="h-24 w-full" />}

            {!isLoadingAllergies && criticalAllergies.length === 0 && (
              <p className="text-muted-foreground text-body py-6 text-center">
                No severe or life-threatening allergies.
              </p>
            )}

            {!isLoadingAllergies &&
              criticalAllergies.map((allergy) => (
                <div
                  key={allergy.id}
                  className="hover:bg-muted/50 -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {allergy.severity === 4 && (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                      )}
                      <span className="truncate font-medium">{allergy.substance}</span>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {allergy.memberName} · {allergy.familyName}
                    </div>
                  </div>
                  <SeverityBadge severity={allergy.severity} />
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Pending invitations */}
        {pendingInvitations.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-h4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Pending invitations
                <Badge variant="default">{pendingInvitations.length}</Badge>
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/invitations">Review</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-body">
                You have {pendingInvitations.length} pending invitation
                {pendingInvitations.length === 1 ? "" : "s"} waiting for a response.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recent exams — when there are some to show */}
        {!isLoadingExams && exams.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-h4 flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Recent exams
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/exams">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {exams.slice(0, 5).map((exam) => (
                <div
                  key={exam.id}
                  className="hover:bg-muted/50 -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="truncate font-medium">{exam.examType}</div>
                    <div className="text-muted-foreground text-xs">
                      {exam.memberName} · {exam.familyName} ·{" "}
                      {new Date(exam.examDate).toLocaleDateString()}
                    </div>
                  </div>
                  {!exam.results && (
                    <Badge variant="secondary" className="shrink-0">
                      Pending results
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

// ============================================================================
// Stat card
// ============================================================================

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}

function StatCard({ icon: Icon, label, value, href, highlight = false }: StatCardProps) {
  return (
    <Link href={href}>
      <Card
        className={
          "hover:bg-muted/40 cursor-pointer transition-colors " +
          (highlight ? "border-primary/40" : "")
        }
      >
        <CardContent className="flex items-center gap-3">
          <div
            className={
              "rounded-lg p-2 " +
              (highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")
            }
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-h3 font-semibold">{value}</div>
            <div className="text-muted-foreground truncate text-xs">{label}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
