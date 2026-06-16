import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* The inner column is flex-col so Header sits on top and main fills below. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="min-w-0 flex-1">
          <div className="w-full px-6 py-8 md:px-8 md:py-10 lg:px-12">
            {/* The page content stacks vertically. space-y-8 between sections. */}
            <div className="flex flex-col gap-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
