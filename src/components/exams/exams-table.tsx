"use client";

import { MoreHorizontal, Pencil } from "lucide-react";
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
import { UpdateExamResultsDialog } from "./update-exam-results-dialog";
import type { EnrichedExam } from "@/types/exams";

interface ExamsTableProps {
  exams: EnrichedExam[];
}

export function ExamsTable({ exams }: ExamsTableProps) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Exam type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Laboratory</TableHead>
            <TableHead>Results</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <ExamRow key={exam.id} exam={exam} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ExamRow({ exam }: { exam: EnrichedExam }) {
  const [updateOpen, setUpdateOpen] = useState(false);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{exam.memberName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{exam.memberName}</div>
            <div className="text-muted-foreground text-xs">{exam.familyName}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{exam.examType}</div>
        {exam.requestedBy && (
          <div className="text-muted-foreground text-xs">Requested by {exam.requestedBy}</div>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(exam.examDate).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {exam.laboratory ?? <span className="text-muted-foreground/60">—</span>}
      </TableCell>
      <TableCell className="max-w-xs">
        {exam.results ? (
          <span className="line-clamp-2 text-sm">{exam.results}</span>
        ) : (
          <Badge variant="secondary">Pending</Badge>
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
            <DropdownMenuItem onClick={() => setUpdateOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              {exam.results ? "Update results" : "Add results"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <UpdateExamResultsDialog open={updateOpen} onOpenChange={setUpdateOpen} exam={exam} />
      </TableCell>
    </TableRow>
  );
}
