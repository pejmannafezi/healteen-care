import "server-only";
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    // Prefer HEALTEEN_ANTHROPIC_KEY (avoids collision with an empty
    // ANTHROPIC_API_KEY in some shells); fall back to the standard name.
    const key = process.env.HEALTEEN_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("HEALTEEN_ANTHROPIC_KEY / ANTHROPIC_API_KEY is not set");
    client = new Anthropic({ apiKey: key });
  }
  return client;
}

export const MODELS = {
  fast: "claude-haiku-4-5", // customer chat — fast & inexpensive
  smart: "claude-sonnet-4-6", // content generation — higher quality
} as const;
