"use client";

import { Sidebar } from "./sidebar";

export type OrgOption = { id: string; name: string };

export function AppShell({
  children,
  organizations,
  currentOrganizationId,
}: {
  children: React.ReactNode;
  organizations: OrgOption[];
  currentOrganizationId: string | null;
}) {
  return (
    <div className="flex min-h-screen bg-base-500">
      <Sidebar
        organizations={organizations}
        currentOrganizationId={currentOrganizationId}
      />
      <main id="hubia-main" className="hubia-main-transition ml-[280px] flex-1 p-[30px]">
        {children}
      </main>
    </div>
  );
}
