import { getMemoryFiles } from "./actions";
import MemoriaClient from "./memoria-client";

export default async function MemoriaPage() {
  const files = await getMemoryFiles();

  return <MemoriaClient files={files} />;
}
