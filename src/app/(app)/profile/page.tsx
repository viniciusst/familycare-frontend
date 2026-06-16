"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMe } from "@/hooks/use-me";

const languageNames: Record<number, string> = {
  1: "Português (Brasil)",
  2: "English (Canada)",
  3: "Français (Canada)",
};

export default function ProfilePage() {
  const { data: me, isLoading } = useMe();

  if (isLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!me) {
    return <p className="text-destructive">Could not load profile.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Your account information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            More editing options coming in phase 2D.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{me.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Preferred language</p>
            <p className="text-sm text-muted-foreground">
              {languageNames[me.preferredLanguage] ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Member since</p>
            <p className="text-sm text-muted-foreground">
              {new Date(me.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
