"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMe } from "@/hooks/use-me";
import type { FamilySummary } from "@/types/api";

interface FamilyCardProps {
  family: FamilySummary;
}

export function FamilyCard({ family }: FamilyCardProps) {
  const { data: me } = useMe();
  const isOwner = me?.id === family.ownerUserId;

  return (
    <Link
      href={`/families/${family.id}`}
      className="block transition-all hover:scale-[1.02]"
    >
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1">{family.name}</CardTitle>
            <Badge variant={isOwner ? "default" : "secondary"}>
              {isOwner ? "Owner" : "Member"}
            </Badge>
          </div>
          <CardDescription>
            Created {new Date(family.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        {family.memberCount !== undefined && (
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {family.memberCount}{" "}
              {family.memberCount === 1 ? "member" : "members"}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
