import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, MODELS } from "./anthropic";
import { SOCIAL_SYSTEM } from "./brand-prompt";

/** Generates on-brand draft content for a platform about a topic. */
export async function generateSocialContent(platform: string, topic: string): Promise<string> {
  const client = getAnthropic();
  const res = await client.messages.create({
    model: MODELS.smart,
    max_tokens: 700,
    system: SOCIAL_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Write a ${platform} ${platform === "email" ? "newsletter" : platform === "blog" ? "blog intro" : "post"} about: "${topic}".
Follow the platform tone and ALL brand content rules. Output only the ready-to-use content (include hashtags/subject line where appropriate). Do not add commentary.`,
      },
    ],
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
