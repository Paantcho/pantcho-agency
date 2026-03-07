import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { getCreators } from "./actions";
import CreatorsListClient from "./creators-list-client";

export default async function CreatorsPage() {
  const organizationId = await getCurrentOrganizationId();
  const creators = organizationId ? await getCreators(organizationId) : [];

  return (
    <CreatorsListClient
      creators={creators}
      organizationId={organizationId}
    />
  );
}
