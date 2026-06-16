import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🏥</span>
          <span className="tracking-tight">FamilyCare</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="p-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FamilyCare · Built with care
      </footer>
    </div>
  );
}
