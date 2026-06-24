"use client";

import { MoreHorizontal, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { ChangeSeverityDialog } from "./change-severity-dialog";
import { SeverityBadge } from "./severity-badge";
import type { EnrichedAllergy } from "@/types/allergies";

interface AllergiesTableProps {
  allergies: EnrichedAllergy[];
}

export function AllergiesTable({ allergies }: AllergiesTableProps) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Substance</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Reaction</TableHead>
            <TableHead>First observed</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allergies.map((allergy) => (
            <AllergyRow key={allergy.id} allergy={allergy} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AllergyRow({ allergy }: { allergy: EnrichedAllergy }) {
  const [changeOpen, setChangeOpen] = useState(false);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{allergy.memberName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{allergy.memberName}</div>
            <div className="text-muted-foreground text-xs">{allergy.familyName}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 font-medium">
          {allergy.severity === 4 && (
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          {allergy.substance}
        </div>
      </TableCell>
      <TableCell>
        <SeverityBadge severity={allergy.severity} />
      </TableCell>
      <TableCell className="text-muted-foreground max-w-xs text-sm">
        {allergy.reaction ? (
          <span className="line-clamp-2">{allergy.reaction}</span>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {allergy.firstObservedAt ? (
          new Date(allergy.firstObservedAt).toLocaleDateString()
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
            <DropdownMenuItem onClick={() => setChangeOpen(true)}>Change severity</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ChangeSeverityDialog open={changeOpen} onOpenChange={setChangeOpen} allergy={allergy} />
      </TableCell>
    </TableRow>
  );
}
