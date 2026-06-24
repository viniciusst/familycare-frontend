"use client";

import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { InvitationsList } from "@/components/invitations/invitations-list";
import { useMyInvitations } from "@/hooks/use-invitations";

export default function InvitationsPage() {
  // Status 1 = Pending — only show what's actionable.
  const { data: invitations = [], isLoading, isError } = useMyInvitations(1);

  return (
    <>
      <PageHeader title="Invitations" description="Family invitations addressed to you." />

      {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}

      {isError && <p className="text-destructive">Could not load invitations.</p>}

      {!isLoading && !isError && invitations.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Inbox className="text-muted-foreground h-8 w-8" />
          <p className="text-h4">No pending invitations</p>
          <p className="text-body text-muted-foreground max-w-sm">
            When someone invites you to join their family, it&apos;ll show up here.
          </p>
        </div>
      )}

      {!isLoading && !isError && invitations.length > 0 && (
        <InvitationsList invitations={invitations} />
      )}
    </>
  );
}
