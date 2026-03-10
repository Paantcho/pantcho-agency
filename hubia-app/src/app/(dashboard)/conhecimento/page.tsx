import { getKnowledgeEntries } from "./actions";
import ConhecimentoClient from "./conhecimento-client";

export default async function ConhecimentoPage() {
  const entries = await getKnowledgeEntries();

  return <ConhecimentoClient entries={entries} />;
}
