import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-end gap-2 border-b px-6">
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
