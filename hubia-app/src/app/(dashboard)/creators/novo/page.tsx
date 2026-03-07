import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { redirect } from "next/navigation";
import CreatorFormClient from "./creator-form-client";

export default async function CreatorsNovoPage() {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) redirect("/login");

  return (
    <div className="hubia-fade-in flex flex-col gap-6">
      <h1 className="text-heading-xs text-ink-500">Novo creator</h1>
      <p className="text-body-sm text-base-700">
        Preencha os dados básicos. Aparência, ambientes, looks e voz podem ser configurados na página do creator depois.
      </p>
      <CreatorFormClient organizationId={organizationId} />
    </div>
  );
}
