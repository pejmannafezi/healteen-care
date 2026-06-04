"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm the Healteen Care assistant 🌿 I can help you find herbal products or check your order's delivery status. How can I help?",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/agents/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send recent history (exclude the static greeting).
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING).slice(-12) }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? data.error ?? "Sorry, please try again." },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat with us"
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-forest text-cream shadow-soft transition-transform hover:scale-105"
      >
        {open ? <X /> : <MessageCircle />}
      </button>

      <div
        className={cn(
          "fixed bottom-24 right-5 z-50 flex w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-border bg-cream shadow-soft transition-all",
          open ? "max-h-[70vh] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        )}
      >
        <div className="flex items-center gap-2 bg-forest px-4 py-3 text-cream">
          <Leaf className="size-5 text-mint" />
          <div>
            <p className="text-sm font-bold leading-none">Healteen Care Assistant</p>
            <p className="text-[11px] text-cream/70">Products & order help</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm",
                  m.role === "user" ? "bg-forest text-cream" : "bg-white text-forest border border-border"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-border bg-white px-3 py-2 text-sm text-forest/50">…</div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-cream p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Type your message…"
              className="max-h-24 flex-1 resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="flex size-9 items-center justify-center rounded-lg bg-forest text-cream disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="size-4" />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-forest/40">
            AI assistant · not medical advice
          </p>
        </div>
      </div>
    </>
  );
}
