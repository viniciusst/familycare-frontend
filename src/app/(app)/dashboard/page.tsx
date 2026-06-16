"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMe } from "@/hooks/use-me";

export default function DashboardPage() {
  const { data: me, isLoading } = useMe();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isLoading ? "Loading..." : `Welcome back${me ? `, ${me.email.split("@")[0]}` : ""}!`}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your families.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Families</CardTitle>
            <CardDescription>Manage your family groups</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming in phase 2B.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming appointments</CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming in phase 2C.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Last updates from your families</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming in phase 2D.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
