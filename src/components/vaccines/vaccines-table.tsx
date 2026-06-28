"use client";

import { AlertCircle, MoreHorizontal, Pencil } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { UpdateVaccineDetailsDialog } from "./update-vaccine-details-dialog";
import { isNextDoseOverdue, type EnrichedVaccine } from "@/types/vaccines";

interface VaccinesTableProps {
  vaccines: EnrichedVaccine[];
}

export function VaccinesTable({ vaccines }: VaccinesTableProps) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Vaccine</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Dose</TableHead>
            <TableHead>Manufacturer</TableHead>
            <TableHead>Next dose</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vaccines.map((vaccine) => (
            <VaccineRow key={vaccine.id} vaccine={vaccine} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function VaccineRow({ vaccine }: { vaccine: EnrichedVaccine }) {
  const [editOpen, setEditOpen] = useState(false);
  const overdue = isNextDoseOverdue(vaccine);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{vaccine.memberName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{vaccine.memberName}</div>
            <div className="text-muted-foreground text-xs">{vaccine.familyName}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{vaccine.name}</div>
        {vaccine.batchNumber && (
          <div className="text-muted-foreground text-xs">Lot {vaccine.batchNumber}</div>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(vaccine.appliedAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {vaccine.doseNumber ? (
          `#${vaccine.doseNumber}`
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {vaccine.manufacturer ?? <span className="text-muted-foreground/60">—</span>}
      </TableCell>
      <TableCell className="text-sm">
        {vaccine.nextDoseDue ? (
          <div className="flex items-center gap-2">
            <span className={overdue ? "text-destructive font-medium" : "text-muted-foreground"}>
              {new Date(vaccine.nextDoseDue).toLocaleDateString()}
            </span>
            {overdue && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Overdue
              </Badge>
            )}
          </div>
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
          </DropdownMenuContent>
        </DropdownMenu>

        <UpdateVaccineDetailsDialog open={editOpen} onOpenChange={setEditOpen} vaccine={vaccine} />
      </TableCell>
    </TableRow>
  );
}
