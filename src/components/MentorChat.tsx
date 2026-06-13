"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { categoryStyle, categoryThemes } from "@/lib/category-theme";
import { type AimuraStudentReport } from "@/lib/student-os-types";

type MentorChatProps = {
  report: AimuraStudentReport;
};

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

function createId() {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function MentorChat({ report }: MentorChatProps) {
  const theme = categoryThemes.mentor;
  const firstName = report.studentName.split(" ")[0] || "there";
  const targetRole = report.domainProfile.targetRoles[0] || "your target role";

  const greeting = `Hi ${firstName}, I'm your Aimura AI mentor. You're aiming for ${targetRole} in ${report.domainProfile.normalizedField}, and your skill score is ${report.skillScore}/100. Ask me what to learn first, how to plan your week, how to close ${report.domainProfile.missingSkills.slice(0, 2).join(" and ")}, or anything about your roadmap.`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: createId(), role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [engine, setEngine] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const engineLabel =
    engine === "foundry"
      ? "Powered by Microsoft Foundry IQ"
      : engine === "openai" || engine === "anthropic"
        ? "Live AI reasoning"
        : engine === "offline"
          ? "Foundry IQ-ready offline guidance"
          : null;

  const topGap = report.domainProfile.missingSkills[0] || "my weak areas";
  const suggestions = [
    "What should I do this week?",
    `How do I close ${topGap}?`,
    "What project should I build?",
    "How strong is my profile?",
    "Which universities fit me?",
    "How do I prepare for interviews?",
    "I feel overwhelmed, where do I start?",
    "What's the job market like?",
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = { id: createId(), role: "user", content: trimmed };
    const assistantId = createId();
    const history = [...messages, userMessage];

    setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report,
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("The mentor is unavailable right now.");
      }

      setEngine(response.headers.get("x-aimura-engine"));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamed = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        streamed += decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, content: streamed } : message,
          ),
        );
      }

      if (!streamed.trim()) {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: "I couldn't reach a clear answer just now. Try rephrasing or ask about your weekly plan." }
              : message,
          ),
        );
      }
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? { ...message, content: "I hit a connection issue. Please try that question again." }
            : message,
        ),
      );
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col gap-4" style={categoryStyle(theme)}>
      <div className="aimura-role-label flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em]">
        <Sparkles className="size-4" aria-hidden />
        Aimura AI mentor
        {engineLabel ? (
          <span className="aimura-role-value ml-auto rounded-control border px-3 py-1 text-[0.65rem] font-medium normal-case tracking-normal" style={{ background: theme.soft, borderColor: theme.border }}>
            {engineLabel}
          </span>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        className="flex max-h-[26rem] min-h-[18rem] flex-col gap-3 overflow-y-auto rounded-[1.5rem] border bg-aimura-panel/45 p-4"
        style={{ borderColor: theme.border }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7 ${
              message.role === "user"
                ? "aimura-role-title self-end border"
                : "aimura-role-body self-start border border-aimura-moss/25 bg-aimura-panel"
            }`}
            style={message.role === "user" ? { ...categoryStyle(theme), background: theme.soft, borderColor: theme.border } : undefined}
          >
            {message.content || (
                <span className="aimura-role-subtle inline-flex items-center gap-1">
                <span className="size-1.5 animate-pulse rounded-full" style={{ background: theme.accent }} />
                <span className="size-1.5 animate-pulse rounded-full [animation-delay:160ms]" style={{ background: theme.accent }} />
                <span className="size-1.5 animate-pulse rounded-full [animation-delay:320ms]" style={{ background: theme.accent }} />
              </span>
            )}
          </div>
        ))}
      </div>

      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="aimura-focus-ring aimura-role-meta rounded-control border bg-aimura-panel/50 px-3 py-1.5 text-xs transition hover:text-aimura-white disabled:opacity-40"
              disabled={isStreaming}
              onClick={() => sendMessage(suggestion)}
              style={{ borderColor: theme.border }}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(input);
        }}
      >
        <input
          aria-label="Ask the Aimura AI mentor"
          className="aimura-focus-ring aimura-role-title flex-1 rounded-control border bg-aimura-panel/50 px-4 py-3 text-sm outline-none placeholder:text-aimura-moss"
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask your mentor anything about your path..."
          style={{ borderColor: theme.border }}
          value={input}
        />
        <button
          className="aimura-focus-ring inline-flex items-center gap-2 rounded-control px-5 py-3 text-sm font-semibold text-aimura-white transition disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isStreaming || !input.trim()}
          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, boxShadow: theme.shadow }}
          type="submit"
        >
          <Send className="size-4" aria-hidden />
          {isStreaming ? "Thinking" : "Send"}
        </button>
      </form>
    </div>
  );
}
