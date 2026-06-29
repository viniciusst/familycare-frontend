"use client";

import { ArrowLeft, Settings, Shield, Users } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FamilySettings } from "@/components/families/family-settings";
import { InviteMemberDialog } from "@/components/families/invite-member-dialog";
import { MembersTable } from "@/components/families/members-table";
import { PageHeader } from "@/components/layout/page-layout";
import { PrivacyTab } from "@/components/privacy/privacy-tab";
import { useFamily } from "@/hooks/use-families";
import { useMyRole } from "@/hooks/use-my-role";
import { ROLE_LABELS } from "@/types/api";

export default function FamilyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: family, isLoading, isError } = useFamily(id);
  const myRole = useMyRole(family);

  if (isLoading) {
    return (
      <>
        <BackLink />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </>
    );
  }

  if (isError || !family) {
    return (
      <>
        <BackLink />
        <p className="text-destructive">Could not load this family.</p>
      </>
    );
  }

  const canManage = myRole === 1 || myRole === 2;
  const isOwner = myRole === 1;

  return (
    <>
      <BackLink />

      <PageHeader
        title={family.name}
        meta={
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
            {myRole !== null && (
              <Badge variant={isOwner ? "default" : "secondary"}>You: {ROLE_LABELS[myRole]}</Badge>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {family.members.length} {family.members.length === 1 ? "member" : "members"}
            </span>
            <span>·</span>
            <span>Created {new Date(family.createdAt).toLocaleDateString()}</span>
          </div>
        }
        actions={canManage ? <InviteMemberDialog familyId={family.id} /> : null}
      />

      {/*
        IMPORTANT: explicit `block w-full` on the root Tabs because shadcn's
        recent versions render with `display: inline-flex` by default on the
        Root, which causes the TabsList and TabsContent to sit side-by-side
        instead of stacking vertically. Forcing block fixes it.
      */}
      <Tabs defaultValue="members" className="block w-full">
        <div className="w-full border-b">
          <TabsList className="flex h-auto w-fit justify-start gap-2 rounded-none bg-transparent p-0">
            <TabsTrigger value="members" className={tabTriggerClass}>
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="privacy" className={tabTriggerClass}>
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            {canManage && (
              <TabsTrigger value="settings" className={tabTriggerClass}>
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="members" className="mt-6 w-full">
          <MembersTable familyId={family.id} members={family.members} myRole={myRole} />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6 w-full">
          <PrivacyTab family={family} />
        </TabsContent>

        {canManage && (
          <TabsContent value="settings" className="mt-6 w-full">
            <FamilySettings familyId={family.id} currentName={family.name} />
          </TabsContent>
        )}
      </Tabs>
    </>
  );
}

const tabTriggerClass = `
  inline-flex items-center gap-2
  px-4 py-3 text-sm font-medium
  rounded-none border-0 border-b-2 border-transparent
  bg-transparent shadow-none
  text-muted-foreground
  hover:text-foreground transition-colors
  focus-visible:outline-none focus-visible:ring-0
  data-[state=active]:border-primary
  data-[state=active]:bg-transparent
  data-[state=active]:text-foreground
  data-[state=active]:shadow-none
`;

function BackLink() {
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
      <Link href="/families">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to families
      </Link>
    </Button>
  );
}
