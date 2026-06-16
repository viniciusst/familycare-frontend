import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="text-2xl">🏥</span>
          <span className="tracking-tight">FamilyCare</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="text-muted-foreground p-6 text-center text-xs">
        © {new Date().getFullYear()} FamilyCare · Built with care
      </footer>
    </div>
  );
}
