import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, MODELS } from "./anthropic";
import { SUPPORT_SYSTEM } from "./brand-prompt";
import { TOOL_DEFINITIONS, executeTool } from "./tools";

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Runs the customer support / shopping agent with a tool-use loop. */
export async function runSupportAgent(history: ChatMessage[]): Promise<string> {
  const client = getAnthropic();
  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  for (let i = 0; i < 5; i++) {
    const res = await client.messages.create({
      model: MODELS.fast,
      max_tokens: 1024,
      system: SUPPORT_SYSTEM,
      tools: TOOL_DEFINITIONS,
      messages,
    });

    if (res.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: res.content });
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of res.content) {
        if (block.type === "tool_use") {
          const out = await executeTool(block.name, block.input as Record<string, unknown>);
          toolResults.push({ type: "tool_result", tool_use_id: block.id, content: out });
        }
      }
      messages.push({ role: "user", content: toolResults });
      continue;
    }

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return text || "I'm here to help! Could you rephrase that?";
  }

  return "Sorry, I'm having trouble answering right now. Please email info@healteencare.com.";
}
