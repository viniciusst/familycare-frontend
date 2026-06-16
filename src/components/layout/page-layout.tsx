import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Page-level layout primitives. Use PageHeader at the top of every screen,
 * PageSection to group content visually.
 */

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Right-side action(s) — usually a Button or two. */
  actions?: ReactNode;
  /** Slot below the title for badges, breadcrumbs, etc. */
  meta?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 pb-2",
        className,
      )}
    >
      <div className="space-y-2">
        <h1 className="text-h1">{title}</h1>
        {description && (
          <p className="text-body-lg text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
        {meta && <div className="pt-1">{meta}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || actions) && (
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-1">
            {title && <h2 className="text-h3">{title}</h2>}
            {description && (
              <p className="text-body text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
