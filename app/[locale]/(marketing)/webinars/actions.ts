"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function registerWebinar(formData: FormData) {
  const webinarId = String(formData.get("webinar_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!webinarId) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS allows a user to insert their own registration. Ignore duplicates.
  await supabase
    .from("class_registrations")
    .insert({ webinar_id: webinarId, user_id: user!.id });

  revalidatePath(`/webinars/${slug}`);
}
