"use client";

import {
  Activity,
  Crown,
  FlaskConical,
  MoreHorizontal,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  Syringe,
  UserMinus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditMemberDialog } from "./edit-member-dialog";
import { RegisterAllergyForMemberDialog } from "@/components/allergies/register-allergy-for-member-dialog";
import { RegisterChronicConditionForMemberDialog } from "@/components/conditions/register-condition-for-member-dialog";
import { RegisterExamForMemberDialog } from "@/components/exams/register-exam-for-member-dialog";
import { RegisterVaccineForMemberDialog } from "@/components/vaccines/register-vaccine-for-member-dialog";
import { useChangeMemberRole, useRemoveMember, useTransferOwnership } from "@/hooks/use-families";
import { useMe } from "@/hooks/use-me";
import { ApiError } from "@/lib/api/client";
import { RELATIONSHIP_LABELS, ROLE_LABELS, type FamilyMember, type Role } from "@/types/api";

interface MembersTableProps {
  familyId: string;
  members: FamilyMember[];
  myRole: Role | null;
}

export function MembersTable({ familyId, members, myRole }: MembersTableProps) {
  const { data: me } = useMe();
  const canManage = myRole === 1 || myRole === 2;
  const isOwner = myRole === 1;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Relationship</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <MemberRow
            key={member.id}
            familyId={familyId}
            member={member}
            canManage={canManage}
            isOwner={isOwner}
            isMe={member.userId === me?.id}
          />
        ))}
      </TableBody>
    </Table>
  );
}

interface MemberRowProps {
  familyId: string;
  member: FamilyMember;
  canManage: boolean;
  isOwner: boolean;
  isMe: boolean;
}

function MemberRow({ familyId, member, canManage, isOwner, isMe }: MemberRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [registerExamOpen, setRegisterExamOpen] = useState(false);
  const [registerAllergyOpen, setRegisterAllergyOpen] = useState(false);
  const [registerVaccineOpen, setRegisterVaccineOpen] = useState(false);
  const [registerConditionOpen, setRegisterConditionOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const removeMember = useRemoveMember(familyId);
  const changeRole = useChangeMemberRole(familyId);
  const transferOwnership = useTransferOwnership(familyId);

  const isMemberOwner = member.role === 1;

  const showActionsMenu = canManage || isMe;
  const canEditThisMember = canManage || isMe;
  const canRegisterMedicalForThisMember = canManage || isMe;
  const showManagementActions = canManage && !isMemberOwner && !isMe;

  const handleRoleChange = async (role: Role) => {
    try {
      await changeRole.mutateAsync({ memberId: member.id, role });
      toast.success(`Role changed to ${ROLE_LABELS[role]}.`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.problem.title : "Could not change role.");
    }
  };

  const handleRemove = async () => {
    try {
      await removeMember.mutateAsync(member.id);
      toast.success("Member removed.");
      setRemoveOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.problem.title : "Could not remove member.");
    }
  };

  const handleTransfer = async () => {
    try {
      await transferOwnership.mutateAsync(member.id);
      toast.success(`Ownership transferred to ${member.displayName}.`);
      setTransferOpen(false);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.problem.title : "Could not transfer ownership."
      );
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{member.displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {member.displayName}
              {isMe && <span className="text-muted-foreground ml-2 text-xs">(you)</span>}
            </div>
            {member.email && <div className="text-muted-foreground text-xs">{member.email}</div>}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={isMemberOwner ? "default" : "secondary"}>
          {isMemberOwner && <Crown className="mr-1 h-3 w-3" />}
          {ROLE_LABELS[member.role]}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {RELATIONSHIP_LABELS[member.relationship]}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(member.joinedAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        {showActionsMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Manage member</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {canEditThisMember && (
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit details
                </DropdownMenuItem>
              )}

              {canRegisterMedicalForThisMember && (
                <>
                  <DropdownMenuItem onClick={() => setRegisterExamOpen(true)}>
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Register exam
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRegisterAllergyOpen(true)}>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Register allergy
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRegisterVaccineOpen(true)}>
                    <Syringe className="mr-2 h-4 w-4" />
                    Register vaccine
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRegisterConditionOpen(true)}>
                    <Activity className="mr-2 h-4 w-4" />
                    Register condition
                  </DropdownMenuItem>
                </>
              )}

              {showManagementActions && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Change role
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {([2, 3, 4, 5] as Role[]).map((role) => (
                        <DropdownMenuItem
                          key={role}
                          disabled={role === member.role}
                          onClick={() => handleRoleChange(role)}
                        >
                          {ROLE_LABELS[role]}
                          {role === member.role && " (current)"}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  {isOwner && (
                    <DropdownMenuItem onClick={() => setTransferOpen(true)}>
                      <Crown className="mr-2 h-4 w-4" />
                      Transfer ownership
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setRemoveOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove from family
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <EditMemberDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          familyId={familyId}
          member={member}
        />

        <RegisterExamForMemberDialog
          open={registerExamOpen}
          onOpenChange={setRegisterExamOpen}
          memberId={member.id}
          memberName={member.displayName}
        />

        <RegisterAllergyForMemberDialog
          open={registerAllergyOpen}
          onOpenChange={setRegisterAllergyOpen}
          memberId={member.id}
          memberName={member.displayName}
        />

        <RegisterVaccineForMemberDialog
          open={registerVaccineOpen}
          onOpenChange={setRegisterVaccineOpen}
          memberId={member.id}
          memberName={member.displayName}
        />

        <RegisterChronicConditionForMemberDialog
          open={registerConditionOpen}
          onOpenChange={setRegisterConditionOpen}
          memberId={member.id}
          memberName={member.displayName}
        />

        <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {member.displayName}?</AlertDialogTitle>
              <AlertDialogDescription>
                This member will lose access to the family. Their medical data within this family
                will also be removed. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemove}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={transferOpen} onOpenChange={setTransferOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Transfer ownership to {member.displayName}?</AlertDialogTitle>
              <AlertDialogDescription>
                {member.displayName} will become the new owner. You will be demoted to Admin. This
                action cannot be undone — only the new owner can transfer it back.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleTransfer}>Transfer ownership</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}
