// ============================================================
// HUBIA — API: Process ZIP para auto-fill de Creator
// Extrai arquivos de texto do ZIP → envia para LLM → retorna dados estruturados
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { getCurrentOrganizationId } from "@/lib/auth-organization";
import { resolveProvider } from "@/lib/agents/provider";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// Tipos de arquivo de texto que serão lidos
const TEXT_EXTENSIONS = [
  ".txt",
  ".md",
  ".json",
  ".csv",
  ".yaml",
  ".yml",
  ".xml",
  ".html",
  ".htm",
  ".rtf",
  ".doc",
  ".pdf",
];

export type CreatorAutoFillData = {
  name?: string;
  bio?: string;
  metadata?: {
    age?: number;
    city?: string;
    state?: string;
    birthdate?: string;
    platforms?: string[];
  };
  appearance?: {
    basePrompt?: string;
    markers?: string[];
  };
  environments?: {
    name: string;
    description?: string;
    prompt: string;
  }[];
  looks?: {
    name: string;
    description?: string;
    prompt: string;
  }[];
  voice?: {
    tone?: string;
    style?: string;
    rules?: string[];
    examples?: string[];
  };
  filesExtracted: string[];
};

const SYSTEM_PROMPT = `Você é um assistente especializado em processar documentos de creators digitais para a plataforma Hubia.

Analise os documentos fornecidos e extraia informações estruturadas sobre o creator digital.

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`, sem explicações) com a seguinte estrutura:
{
  "name": "Nome do creator (se encontrado)",
  "bio": "Biografia curta (máx 200 chars)",
  "metadata": {
    "age": número ou null,
    "city": "cidade" ou null,
    "state": "UF" ou null,
    "birthdate": "YYYY-MM-DD" ou null,
    "platforms": ["instagram", "tiktok", etc] ou []
  },
  "appearance": {
    "basePrompt": "Prompt completo descrevendo aparência física do creator para geração de imagens. Inclua detalhes como cor de pele, cabelo, olhos, corpo, estilo visual.",
    "markers": ["marcador1", "marcador2"] - características únicas identificáveis
  },
  "environments": [
    {
      "name": "Nome do ambiente",
      "description": "Descrição do ambiente",
      "prompt": "Prompt para gerar imagens neste ambiente"
    }
  ],
  "looks": [
    {
      "name": "Nome do look/visual",
      "description": "Descrição do visual",
      "prompt": "Prompt para gerar imagens com este visual/roupa"
    }
  ],
  "voice": {
    "tone": "Tom de voz (ex: descontraído, profissional, etc)",
    "style": "Estilo de escrita",
    "rules": ["regra1", "regra2"],
    "examples": ["exemplo de post 1", "exemplo 2"]
  }
}

Preencha apenas os campos que você encontrar nos documentos. Para campos não encontrados, use null ou array vazio.
Para aparência, seja o mais detalhado possível no basePrompt, descrevendo cada característica física.
Para ambientes e looks, crie prompts completos e descritivos para geração de imagens.`;

export async function POST(req: NextRequest) {
  try {
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json(
        { error: "Sem organização" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Verificar se é ZIP
    if (
      !file.name.endsWith(".zip") &&
      file.type !== "application/zip" &&
      file.type !== "application/x-zip-compressed"
    ) {
      return NextResponse.json(
        { error: "Apenas arquivos .zip são aceitos" },
        { status: 400 }
      );
    }

    // Limitar tamanho (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande (máx 50MB)" },
        { status: 400 }
      );
    }

    // Extrair conteúdo do ZIP
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const extractedFiles: string[] = [];
    let combinedContent = "";

    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;

      // Ignorar arquivos do sistema
      if (
        path.startsWith("__MACOSX/") ||
        path.startsWith(".") ||
        path.includes("/.") ||
        path.endsWith(".DS_Store")
      ) {
        continue;
      }

      const ext = "." + path.split(".").pop()?.toLowerCase();
      if (TEXT_EXTENSIONS.includes(ext)) {
        try {
          const content = await zipEntry.async("text");
          if (content.trim()) {
            extractedFiles.push(path);
            combinedContent += `\n\n=== ARQUIVO: ${path} ===\n${content}`;
          }
        } catch {
          // Arquivo binário que não pode ser lido como texto
        }
      } else {
        // Registrar arquivo não-texto (imagens, etc)
        extractedFiles.push(path);
      }
    }

    if (!combinedContent.trim()) {
      return NextResponse.json({
        data: {
          filesExtracted: extractedFiles,
        } as CreatorAutoFillData,
        aiProcessed: false,
        message:
          "Nenhum arquivo de texto encontrado no ZIP. Os arquivos foram registrados mas não foi possível extrair dados automaticamente.",
      });
    }

    // Tentar processar com IA
    const provider = await resolveProvider(organizationId);

    if (!provider) {
      // Sem provider: retornar apenas os arquivos extraídos
      return NextResponse.json({
        data: {
          filesExtracted: extractedFiles,
        } as CreatorAutoFillData,
        aiProcessed: false,
        message:
          "Provedor de IA não configurado. Os arquivos foram extraídos mas o preenchimento automático requer um provedor de IA configurado em Config > Provedores.",
        rawContent: combinedContent.slice(0, 5000), // Preview do conteúdo
      });
    }

    // Processar com IA
    const aiResult = await processWithAI(
      provider,
      combinedContent,
    );

    return NextResponse.json({
      data: {
        ...aiResult,
        filesExtracted: extractedFiles,
      } as CreatorAutoFillData,
      aiProcessed: true,
      message: "Dados extraídos com sucesso via IA. Revise e complete os campos.",
    });
  } catch (error) {
    console.error("Erro ao processar ZIP:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao processar arquivo",
      },
      { status: 500 }
    );
  }
}

async function processWithAI(
  provider: { type: string; apiKey: string; model: string; baseUrl?: string; maxTokens?: number },
  content: string,
): Promise<Partial<CreatorAutoFillData>> {
  // Truncar conteúdo se muito grande
  const maxChars = 30000;
  const truncatedContent =
    content.length > maxChars
      ? content.slice(0, maxChars) + "\n\n[... conteúdo truncado ...]"
      : content;

  const userMessage = `Analise os seguintes documentos de um creator digital e extraia as informações estruturadas:\n\n${truncatedContent}`;

  let responseText = "";

  if (provider.type === "anthropic") {
    const client = new Anthropic({ apiKey: provider.apiKey });
    const response = await client.messages.create({
      model: provider.model,
      max_tokens: provider.maxTokens || 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    responseText = response.content
      .filter((block) => block.type === "text")
      .map((block) => {
        if (block.type === "text") return block.text;
        return "";
      })
      .join("");
  } else {
    const client = new OpenAI({
      apiKey: provider.apiKey,
      baseURL: provider.baseUrl,
    });

    const response = await client.chat.completions.create({
      model: provider.model,
      max_tokens: provider.maxTokens || 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    responseText = response.choices[0]?.message?.content || "";
  }

  // Limpar resposta (remover possíveis backticks de markdown)
  responseText = responseText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(responseText);
  } catch {
    console.error("IA retornou JSON inválido:", responseText.slice(0, 500));
    return {};
  }
}
