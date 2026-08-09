// Bud Guardian V10 — client-side driver for the external AI conversation.
// Talks to app/api/bud-guardian/chat/route.ts (the only thing that ever
// sees GUARDIAN_AI_API_KEY) and, whenever the model asks for a tool, runs it
// locally through tool-executor.ts before continuing the conversation.
//
// Why tool execution happens here instead of on the server: every store
// Bud Guardian can read from (product catalog, orders, payments, CRM,
// inventory, analytics) is localStorage-backed and only exists in the
// browser — see tool-executor.ts and, e.g., data/shop/order-store.ts's own
// header. A Node route handler has no access to it. So the split is: the
// MODEL CALL is server-only (keeps the API key out of the browser bundle),
// and TOOL EXECUTION is client-only (it's the only place the data lives) —
// this module is the loop that stitches the two together, one HTTP
// round-trip per model turn, capped so it always terminates.
//
// Used by both surfaces that talk to the AI: the public chat
// (ai-provider.ts's ExternalAIProvider) and the staff copilot
// (staff-guardian-engine.ts's respondToStaffQueryAI) — mode/tool scope is
// the only thing that differs between them (see ToolExecContext).

import type { Locale } from "@/lib/i18n/types";
import type { StaffRole } from "@/types/staff-order";
import type { AnalyticsSnapshot } from "./analytics-engine";
import { executeGuardianTool, type ToolExecContext } from "./tool-executor";
import type { GuardianToolName } from "./guardian-tools";

export type GuardianAiTurn = { role: "user" | "bot"; text: string };

export type GuardianAiConversationInput = {
  message: string;
  locale: Locale;
  history: GuardianAiTurn[];
  mode: "public" | "staff";
  analyticsSnapshot?: AnalyticsSnapshot;
  staffRole?: StaffRole;
};

export type GuardianAiConversationResult =
  | { ok: true; answer: string; toolsUsed: GuardianToolName[]; productId?: string }
  | { ok: false; reason: string };

const CHAT_ENDPOINT = "/api/bud-guardian/chat";
const MAX_ROUNDS = 4;
const CONVERSATION_TIMEOUT_MS = 20000;

type AnthropicMessage = { role: "user" | "assistant"; content: unknown };

type ChatApiResponse =
  | { status: "final" | "blocked"; answer: string }
  | { status: "tool_use"; toolCalls: { id: string; name: string; input: Record<string, unknown> }[]; assistantContent: unknown }
  | { status: "error"; message: string };

async function callChatApi(payload: Record<string, unknown>, signal: AbortSignal): Promise<ChatApiResponse> {
  const res = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  // 502/503 are documented, expected "provider unavailable" responses (see
  // route.ts) with a JSON body of their own — only a truly unexpected
  // status is treated as a hard failure here.
  if (!res.ok && res.status !== 502 && res.status !== 503) {
    throw new Error(`guardian_chat_http_${res.status}`);
  }
  return res.json();
}

export async function runGuardianAiConversation(input: GuardianAiConversationInput): Promise<GuardianAiConversationResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONVERSATION_TIMEOUT_MS);

  const toolsUsed = new Set<GuardianToolName>();
  let productId: string | undefined;
  const toolCtx: ToolExecContext = {
    locale: input.locale,
    mode: input.mode,
    staffRole: input.staffRole,
    analyticsSnapshot: input.analyticsSnapshot,
  };

  try {
    let priorTurns: AnthropicMessage[] = [];

    for (let round = 0; round <= MAX_ROUNDS; round++) {
      const data = await callChatApi(
        {
          mode: input.mode,
          locale: input.locale,
          message: input.message,
          history: input.history,
          round,
          priorTurns,
        },
        controller.signal
      );

      if (data.status === "final" || data.status === "blocked") {
        return { ok: true, answer: data.answer, toolsUsed: [...toolsUsed], productId };
      }

      if (data.status === "error") {
        return { ok: false, reason: data.message };
      }

      if (data.status !== "tool_use") {
        return { ok: false, reason: "unexpected_response" };
      }

      const toolResults = data.toolCalls.map((call) => {
        toolsUsed.add(call.name as GuardianToolName);
        const result = executeGuardianTool({ id: call.id, name: call.name, input: call.input }, toolCtx);
        if (result.meta?.productId) productId = result.meta.productId;
        return { type: "tool_result", tool_use_id: call.id, content: JSON.stringify(result.output) };
      });

      priorTurns = [...priorTurns, { role: "assistant", content: data.assistantContent }, { role: "user", content: toolResults }];
    }

    return { ok: false, reason: "too_many_tool_rounds" };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "network_error" };
  } finally {
    clearTimeout(timeout);
  }
}
