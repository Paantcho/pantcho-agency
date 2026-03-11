"use server";

import { readFile } from "fs/promises";
import { join } from "path";

export type MemoryFile = {
  id: string;
  name: string;
  label: string;
  description: string;
  content: string;
  lastModified: string | null;
};

const MEMORY_DIR = join(process.cwd(), "..", "memory");

const FILES: { name: string; label: string; description: string }[] = [
  {
    name: "WORKING.md",
    label: "Tarefa Ativa",
    description: "Estado atual do projeto, tarefa ativa, próximos passos",
  },
  {
    name: "MEMORY.md",
    label: "Memória de Longo Prazo",
    description:
      "Decisões arquiteturais, stack padrão, preferências do usuário",
  },
  {
    name: "STATUS.md",
    label: "Status Consolidado",
    description:
      "Andamento de todos os projetos, entregas recentes, decisões pendentes",
  },
  {
    name: "LESSONS.md",
    label: "Lições Aprendidas",
    description: "Erros cometidos, correções aplicadas, loop de auto-melhoria",
  },
];

export async function getMemoryFiles(): Promise<MemoryFile[]> {
  const results: MemoryFile[] = [];

  for (const file of FILES) {
    try {
      const filePath = join(MEMORY_DIR, file.name);
      const content = await readFile(filePath, "utf-8");
      const { stat } = await import("fs/promises");
      const stats = await stat(filePath);

      results.push({
        id: file.name.replace(".md", "").toLowerCase(),
        name: file.name,
        label: file.label,
        description: file.description,
        content,
        lastModified: stats.mtime.toISOString(),
      });
    } catch {
      results.push({
        id: file.name.replace(".md", "").toLowerCase(),
        name: file.name,
        label: file.label,
        description: file.description,
        content: "Arquivo não encontrado.",
        lastModified: null,
      });
    }
  }

  return results;
}
