import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Form layout primitives. They enforce consistent spacing and hierarchy
 * across every form in the app — no more ad-hoc gap-3 here and space-y-4
 * there. Compose them like building blocks.
 */

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-h4">{title}</h3>}
          {description && <p className="text-body text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="space-y-5">{children}</div>
    </div>
  );
}

interface FormFieldProps {
  /** Renders the htmlFor on the label and the id on the wrapped input via cloneElement-friendly props. */
  htmlFor?: string;
  label: ReactNode;
  /** Helper text shown below the input. */
  hint?: ReactNode;
  /** Validation error shown below the input. Takes precedence over hint. */
  error?: string;
  /** Optional pill shown next to the label, e.g. "Optional". */
  badge?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  htmlFor,
  label,
  hint,
  error,
  badge,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="cursor-pointer text-sm leading-none font-medium">
          {label}
          {required && (
            <span className="text-destructive ml-0.5" aria-hidden>
              *
            </span>
          )}
        </label>
        {badge && <span className="text-muted-foreground text-xs">{badge}</span>}
      </div>
      {children}
      {error && (
        <p className="text-destructive flex items-start gap-1 text-xs leading-snug" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-muted-foreground text-xs leading-snug">{hint}</p>}
    </div>
  );
}

interface FormFooterProps {
  children: ReactNode;
  className?: string;
}

export function FormFooter({ children, className }: FormFooterProps) {
  return (
    <div className={cn("flex items-center justify-end gap-3 pt-2", className)}>{children}</div>
  );
}

interface FormRootErrorProps {
  message?: string;
}

export function FormRootError({ message }: FormRootErrorProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-sm"
    >
      {message}
    </div>
  );
}
