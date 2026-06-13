"use client";

import { useRef, useState, type ElementType } from "react";
import Image from "next/image";
import { Bold, Link2, List, Check, X, ImageUp, Loader2 } from "lucide-react";
import { useEditMode } from "./edit-mode";
import { cn } from "@/lib/utils";

type EditableType = "text" | "rich" | "image";

interface EditableProps {
  /** site_content key, e.g. "hero.title". */
  id: string;
  /** Current page locale (text is stored per-locale). */
  locale: string;
  /** Resolved value: text/HTML for text|rich, image URL for image. */
  value: string;
  type?: EditableType;
  /** Tag to render for text/rich (e.g. "h1", "p", "span"). */
  as?: ElementType;
  className?: string;
  // Image-only props (forwarded to next/image):
  alt?: string;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

const HOVER_AFFORD =
  "cursor-text rounded-md hover:outline hover:outline-2 hover:outline-dashed hover:outline-nature/50 hover:outline-offset-2";
const EDIT_RING = "rounded-md outline outline-2 outline-dashed outline-nature/60 outline-offset-2";

async function postJson(body: { key: string; locale: string; type: EditableType; value: string }) {
  const res = await fetch("/api/admin/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Save failed (${res.status})`);
  }
}

export function Editable(props: EditableProps) {
  const { id, locale, type = "text", as = "div", className } = props;
  const { editMode } = useEditMode();
  const [value, setValue] = useState(props.value);
  const As = as as ElementType;

  // ── Not in edit mode (or not admin): render plain output, zero extra DOM. ──
  if (!editMode) {
    if (type === "image") {
      return (
        <Image src={value} alt={props.alt ?? ""} fill={props.fill} sizes={props.sizes}
          width={props.width} height={props.height} priority={props.priority} className={className} />
      );
    }
    if (type === "rich") return <As className={className} dangerouslySetInnerHTML={{ __html: value }} />;
    return <As className={className}>{value}</As>;
  }

  if (type === "image") {
    return <EditableImage {...props} value={value} onSaved={setValue} />;
  }
  return <EditableText id={id} locale={locale} type={type} as={As} className={className} value={value} onSaved={setValue} />;
}

function EditableText({
  id, locale, type, as: As, className, value, onSaved,
}: {
  id: string; locale: string; type: EditableType; as: ElementType; className?: string;
  value: string; onSaved: (v: string) => void;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref callback: seed the uncontrolled contentEditable once, so re-renders
  // (busy/error) never clobber the admin's in-progress edits.
  const seed = (node: HTMLElement | null) => {
    ref.current = node;
    if (node && node.dataset.seeded !== "1") {
      if (type === "rich") node.innerHTML = value;
      else node.textContent = value;
      node.dataset.seeded = "1";
    }
  };

  function start() {
    setError(null);
    setEditing(true);
    requestAnimationFrame(() => ref.current?.focus());
  }

  async function commit() {
    const node = ref.current;
    if (!node) return;
    const next = type === "rich" ? node.innerHTML : (node.textContent ?? "").trim();
    setBusy(true);
    try {
      await postJson({ key: id, locale, type, value: next });
      onSaved(next);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function cmd(command: string, arg?: string) {
    document.execCommand(command, false, arg);
    ref.current?.focus();
  }

  if (!editing) {
    const handlers = {
      onClick: start,
      role: "button" as const,
      tabIndex: 0,
      title: "Click to edit",
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter") { e.preventDefault(); start(); }
      },
      className: cn(className, HOVER_AFFORD),
    };
    if (type === "rich") return <As {...handlers} dangerouslySetInnerHTML={{ __html: value }} />;
    return <As {...handlers}>{value}</As>;
  }

  return (
    <span className="relative inline-block w-full align-top">
      <span className="absolute -top-11 start-0 z-50 flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-lift">
        {type === "rich" && (
          <>
            <ToolBtn onClick={() => cmd("bold")} label="Bold"><Bold className="size-4" /></ToolBtn>
            <ToolBtn onClick={() => { const u = prompt("Link URL"); if (u) cmd("createLink", u); }} label="Link"><Link2 className="size-4" /></ToolBtn>
            <ToolBtn onClick={() => cmd("insertUnorderedList")} label="List"><List className="size-4" /></ToolBtn>
            <span className="mx-1 h-5 w-px bg-border" />
          </>
        )}
        <ToolBtn onClick={commit} label="Save" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4 text-nature" />}
        </ToolBtn>
        <ToolBtn onClick={() => setEditing(false)} label="Cancel"><X className="size-4 text-terracotta" /></ToolBtn>
      </span>

      <As ref={seed as never} contentEditable suppressContentEditableWarning
        className={cn(className, EDIT_RING, "block focus:outline-nature")} />

      {error && <span className="absolute -bottom-6 start-0 text-xs font-medium text-terracotta">{error}</span>}
    </span>
  );
}

function EditableImage({
  id, locale, value, onSaved, alt, fill, sizes, width, height, priority, className,
}: EditableProps & { onSaved: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("key", id);
      fd.append("locale", locale);
      fd.append("file", file);
      const res = await fetch("/api/admin/content", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) onSaved(data.url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Image src={value} alt={alt ?? ""} fill={fill} sizes={sizes} width={width} height={height}
        priority={priority} className={cn(className, EDIT_RING)} />
      <button type="button" onClick={() => inputRef.current?.click()}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1.5 rounded-2xl text-cream opacity-0 transition-all hover:bg-forest/55 hover:opacity-100 focus-visible:bg-forest/55 focus-visible:opacity-100 focus-visible:outline-none">
        {busy ? <Loader2 className="size-7 animate-spin" /> : <ImageUp className="size-7" />}
        <span className="text-sm font-semibold">{busy ? "Uploading…" : "Change image"}</span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
    </>
  );
}

function ToolBtn({ onClick, label, children, disabled }: { onClick: () => void; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick} disabled={disabled}
      aria-label={label} title={label}
      className="flex size-8 items-center justify-center rounded-lg text-forest transition-colors hover:bg-forest/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {children}
    </button>
  );
}
