import { getCurrentOrganizationId } from "@/lib/auth-organization";
import ProjetosClient from "./projetos-client";
import { getProjetos } from "./actions";

export default async function ProjetosPage() {
  const organizationId = await getCurrentOrganizationId();
  const projetos = organizationId ? await getProjetos(organizationId) : [];

  return <ProjetosClient organizationId={organizationId ?? ""} initialProjetos={projetos} />;
}
