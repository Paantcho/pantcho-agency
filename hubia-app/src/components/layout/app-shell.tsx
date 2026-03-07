"use client";

import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-base-500">
      <Sidebar />
      <main id="hubia-main" className="hubia-main-transition ml-[280px] flex-1 p-[30px]">
        {children}
      </main>
    </div>
  );
}
