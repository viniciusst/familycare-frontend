"use client";

import { Check, Clock, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AcceptInvitationDialog } from "./accept-invitation-dialog";
import { useDeclineInvitation } from "@/hooks/use-invitations";
import { ApiError } from "@/lib/api/client";
import { RELATIONSHIP_LABELS, ROLE_LABELS, type InvitationDetails } from "@/types/api";

interface InvitationsListProps {
  invitations: InvitationDetails[];
}

export function InvitationsList({ invitations }: InvitationsListProps) {
  return (
    <div className="grid gap-4">
      {invitations.map((invitation) => (
        <InvitationCard key={invitation.id} invitation={invitation} />
      ))}
    </div>
  );
}

function InvitationCard({ invitation }: { invitation: InvitationDetails }) {
  const [acceptOpen, setAcceptOpen] = useState(false);
  const decline = useDeclineInvitation();

  // Expiration display.
  const expiresAt = new Date(invitation.expiresAt);
  const now = new Date();
  const isExpired = expiresAt < now;
  const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const handleDecline = async () => {
    try {
      await decline.mutateAsync(invitation.id);
      toast.success("Invitation declined.");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.problem.title : "Could not decline invitation."
      );
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UserPlus className="text-muted-foreground h-5 w-5" />
            <span className="text-h4">{invitation.familyName}</span>
          </div>

          <div className="text-body text-muted-foreground flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{ROLE_LABELS[invitation.proposedRole]}</Badge>
            <span>·</span>
            <span>{RELATIONSHIP_LABELS[invitation.proposedRelationship]}</span>
          </div>

          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Clock className="h-3.5 w-3.5" />
            {isExpired ? (
              <span className="text-destructive">Expired</span>
            ) : (
              <span>
                Expires{" "}
                {daysLeft === 0 ? "today" : `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isExpired || decline.isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Decline
          </Button>
          <Button onClick={() => setAcceptOpen(true)} disabled={isExpired}>
            <Check className="mr-2 h-4 w-4" />
            Accept
          </Button>
        </div>

        <AcceptInvitationDialog
          open={acceptOpen}
          onOpenChange={setAcceptOpen}
          invitation={invitation}
        />
      </CardContent>
    </Card>
  );
}
