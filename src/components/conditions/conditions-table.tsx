"use client";

import { Check, MoreHorizontal, Pencil } from "lucide-react";
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
  DropdownMenuSeparator,
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
import { UpdateChronicConditionDetailsDialog } from "./update-condition-details-dialog";
import { useResolveChronicCondition } from "@/hooks/use-chronic-conditions";
import { ApiError } from "@/lib/api/client";
import type { EnrichedChronicCondition } from "@/types/chronic-conditions";

interface ChronicConditionsTableProps {
  conditions: EnrichedChronicCondition[];
}

export function ChronicConditionsTable({ conditions }: ChronicConditionsTableProps) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Diagnosed</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conditions.map((c) => (
            <ConditionRow key={c.id} condition={c} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ConditionRow({ condition }: { condition: EnrichedChronicCondition }) {
  const [editOpen, setEditOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const resolve = useResolveChronicCondition();

  const handleResolve = async () => {
    try {
      await resolve.mutateAsync(condition.id);
      toast.success(`${condition.name} marked as resolved.`);
      setResolveOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.problem.title : "Could not resolve.");
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{condition.memberName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{condition.memberName}</div>
            <div className="text-muted-foreground text-xs">{condition.familyName}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{condition.name}</div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(condition.diagnosedAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        {condition.isActive ? (
          <Badge variant="default">Active</Badge>
        ) : (
          <Badge variant="secondary">Resolved</Badge>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground max-w-xs text-sm">
        {condition.notes ? (
          <span className="line-clamp-2">{condition.notes}</span>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit details
            </DropdownMenuItem>
            {condition.isActive && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setResolveOpen(true)}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark as resolved
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <UpdateChronicConditionDetailsDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          condition={condition}
        />

        <AlertDialog open={resolveOpen} onOpenChange={setResolveOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Resolve {condition.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark the condition as no longer active for {condition.memberName}. The
                record stays in history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResolve}>Mark as resolved</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}
