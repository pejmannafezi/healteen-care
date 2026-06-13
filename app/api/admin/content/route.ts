import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sanitizeRichText, sanitizePlainText } from "@/lib/sanitize";

const BUCKET = "site-content";

/** Server-side admin gate (real authorisation; the edit UI is only cosmetic). */
async function isAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin";
}

async function ensureBucket(db: ReturnType<typeof createSupabaseAdminClient>) {
  const { data } = await db.storage.getBucket(BUCKET);
  if (!data) await db.storage.createBucket(BUCKET, { public: true, fileSizeLimit: "12MB" });
}

async function upload(db: ReturnType<typeof createSupabaseAdminClient>, file: File, prefix: string) {
  await ensureBucket(db);
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${prefix}/${Date.now()}.${ext}`;
  const { error } = await db.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (error) return null;
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const contentType = req.headers.get("content-type") || "";

  // ── Text / rich text (JSON) ──
  if (contentType.includes("application/json")) {
    const { key, locale, type, value } = await req.json().catch(() => ({}));
    if (!key || !locale) return NextResponse.json({ error: "Missing key or locale" }, { status: 400 });

    const clean = type === "rich" ? sanitizeRichText(String(value ?? "")) : sanitizePlainText(String(value ?? ""));
    const { error } = await db
      .from("site_content")
      .upsert({ key, locale, text_value: clean || null, updated_at: now }, { onConflict: "key,locale" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, value: clean });
  }

  // ── Image (multipart) — stored once, shared across locales ("_") ──
  const form = await req.formData();
  const key = String(form.get("key") ?? "");
  const file = form.get("file");
  if (!key || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing key or file" }, { status: 400 });
  }
  const url = await upload(db, file, "inline");
  if (!url) return NextResponse.json({ error: "Upload failed" }, { status: 500 });

  const { error } = await db
    .from("site_content")
    .upsert({ key, locale: "_", image_url: url, updated_at: now }, { onConflict: "key,locale" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, url });
}
