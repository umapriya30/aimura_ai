// Server-only reasoning engine for Aimura AI.
//
// Primary reasoning runs on the Microsoft Foundry IQ intelligence layer
// (Azure AI Foundry). If Foundry is not configured or fails to start a
// response, the chain falls back to other reasoning providers, and finally to
// a deterministic offline engine so the product never breaks. The client only
// ever sees the engine label that produced the answer ("foundry", "openai",
// "anthropic", or "offline"); no provider is presented as the app's author.

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type MentorEngine = "foundry" | "openai" | "anthropic" | "offline";

export type MentorStream = {
  generator: AsyncGenerator<string>;
  engine: MentorEngine;
};

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

const ANTHROPIC_MODEL = process.env.AIMURA_PRIMARY_MODEL || "claude-haiku-4-5-20251001";
const OPENAI_MODEL =
  process.env.AIMURA_BACKUP_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";

const MAX_TOKENS = 700;
const TEMPERATURE = 0.6;

export function hasFoundryProvider() {
  return Boolean(
    process.env.AZURE_OPENAI_ENDPOINT &&
      process.env.AZURE_OPENAI_KEY &&
      process.env.AZURE_DEPLOYMENT_NAME,
  );
}

export function hasOpenAiProvider() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function hasAnthropicProvider() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function hasAnyProvider() {
  return hasFoundryProvider() || hasOpenAiProvider() || hasAnthropicProvider();
}

function foundryUrl() {
  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT ?? "").replace(/\/$/, "");
  const deployment = process.env.AZURE_DEPLOYMENT_NAME ?? "";
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";
  return `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
}

// Reads a Server-Sent-Events body and yields each parsed `data:` JSON payload.
async function* readSseData(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<Record<string, unknown>> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") {
        if (payload === "[DONE]") return;
        continue;
      }
      try {
        yield JSON.parse(payload) as Record<string, unknown>;
      } catch {
        // Ignore keep-alive or partial frames.
      }
    }
  }
}

async function safeErrorText(response: Response) {
  try {
    return (await response.text()).slice(0, 300);
  } catch {
    return "";
  }
}

// Foundry IQ and OpenAI share the same chat-completions streaming shape.
async function* streamChatCompletions(
  url: string,
  headers: Record<string, string>,
  model: string | undefined,
  system: string,
  messages: ChatMessage[],
  tag: string,
): AsyncGenerator<string> {
  const body: Record<string, unknown> = {
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    stream: true,
    messages: [
      { role: "system", content: system },
      ...messages.map((message) => ({ role: message.role, content: message.content })),
    ],
  };
  if (model) body.model = model;

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    throw new Error(`${tag} ${response.status} ${await safeErrorText(response)}`);
  }

  for await (const event of readSseData(response.body)) {
    const choices = event.choices as Array<{ delta?: { content?: string } }> | undefined;
    const token = choices?.[0]?.delta?.content;
    if (token) yield token;
  }
}

function streamFoundry(system: string, messages: ChatMessage[]) {
  return streamChatCompletions(
    foundryUrl(),
    { "api-key": process.env.AZURE_OPENAI_KEY ?? "" },
    undefined,
    system,
    messages,
    "foundry",
  );
}

function streamOpenAi(system: string, messages: ChatMessage[]) {
  return streamChatCompletions(
    OPENAI_ENDPOINT,
    { authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}` },
    OPENAI_MODEL,
    system,
    messages,
    "openai",
  );
}

async function* streamAnthropic(system: string, messages: ChatMessage[]): AsyncGenerator<string> {
  const response = await fetch(ANTHROPIC_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      system,
      stream: true,
      messages: messages.map((message) => ({ role: message.role, content: message.content })),
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`anthropic ${response.status} ${await safeErrorText(response)}`);
  }

  for await (const event of readSseData(response.body)) {
    const delta = event.delta as { text?: string } | undefined;
    if (event.type === "content_block_delta" && delta?.text) yield delta.text;
  }
}

// Non-streaming chat completion (Foundry IQ / OpenAI compatible).
async function completeChatCompletions(
  url: string,
  headers: Record<string, string>,
  model: string | undefined,
  system: string,
  user: string,
) {
  const body: Record<string, unknown> = {
    max_tokens: 1600,
    temperature: 0.4,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  if (model) body.model = model;

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`completion ${response.status}`);
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

async function completeAnthropic(system: string, user: string) {
  const response = await fetch(ANTHROPIC_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1600,
      temperature: 0.4,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!response.ok) throw new Error(`anthropic ${response.status}`);
  const data = (await response.json()) as { content?: Array<{ text?: string }> };
  return data.content?.map((block) => block.text ?? "").join("") ?? "";
}

type Attempt = { engine: MentorEngine; make: () => AsyncGenerator<string> };

function buildStreamAttempts(system: string, messages: ChatMessage[]): Attempt[] {
  const attempts: Attempt[] = [];
  if (hasFoundryProvider()) attempts.push({ engine: "foundry", make: () => streamFoundry(system, messages) });
  if (hasAnthropicProvider()) attempts.push({ engine: "anthropic", make: () => streamAnthropic(system, messages) });
  if (hasOpenAiProvider()) attempts.push({ engine: "openai", make: () => streamOpenAi(system, messages) });
  return attempts;
}

// Non-streaming completion used for structured enrichment (career intelligence
// JSON). Returns null when no provider produces a result.
export async function completeText(
  system: string,
  user: string,
): Promise<{ text: string; engine: MentorEngine } | null> {
  const attempts: Array<{ engine: MentorEngine; run: () => Promise<string> }> = [];
  if (hasFoundryProvider()) {
    attempts.push({
      engine: "foundry",
      run: () => completeChatCompletions(foundryUrl(), { "api-key": process.env.AZURE_OPENAI_KEY ?? "" }, undefined, system, user),
    });
  }
  if (hasAnthropicProvider()) {
    attempts.push({ engine: "anthropic", run: () => completeAnthropic(system, user) });
  }
  if (hasOpenAiProvider()) {
    attempts.push({
      engine: "openai",
      run: () => completeChatCompletions(OPENAI_ENDPOINT, { authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}` }, OPENAI_MODEL, system, user),
    });
  }

  for (const attempt of attempts) {
    try {
      const text = await attempt.run();
      if (text.trim()) return { text, engine: attempt.engine };
    } catch {
      // try next provider
    }
  }
  return null;
}

// Tries each configured provider in order. A provider "succeeds" only once it
// produces its first token, so a failed handshake (missing credits, rate
// limit, network error) transparently falls through to the next provider.
export async function streamMentorReply(
  system: string,
  messages: ChatMessage[],
): Promise<MentorStream | null> {
  for (const attempt of buildStreamAttempts(system, messages)) {
    try {
      const generator = attempt.make();
      const firstResult = await generator.next();
      if (firstResult.done) continue;
      const firstChunk = firstResult.value;

      async function* combined() {
        yield firstChunk;
        yield* generator;
      }

      return { generator: combined(), engine: attempt.engine };
    } catch {
      // Move on to the next provider in the chain.
    }
  }

  return null;
}
