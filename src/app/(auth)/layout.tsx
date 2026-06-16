import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <header className="absolute top-0 z-10 flex w-full items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-2xl">🏥</span>
          <span>FamilyCare</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="w-full max-w-md">{children}</main>

      <footer className="absolute bottom-0 p-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} FamilyCare
      </footer>
    </div>
  );
}
