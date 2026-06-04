import { Plus, Trash2, Video, Phone } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminListSlots, adminListConsultations } from "@/lib/services/consultations";
import { updateConsultationSettings, addSlot, deleteSlot } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export default async function AdminConsultationsPage() {
  const db = createSupabaseAdminClient();
  const [{ data: settings }, slots, bookings] = await Promise.all([
    db.from("consultation_settings").select("*").eq("id", 1).single(),
    adminListSlots(),
    adminListConsultations(),
  ]);

  return (
    <div className="space-y-8">
      {/* Settings */}
      <div>
        <h2 className="mb-3 text-lg font-bold">Consultation settings</h2>
        <Card>
          <CardContent className="p-5">
            <form action={updateConsultationSettings} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Price (USD)</Label>
                  <Input name="price" type="number" step="0.01" min="0" defaultValue={((settings?.price_cents ?? 5000) / 100).toFixed(2)} />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input name="duration_min" type="number" min="5" defaultValue={settings?.duration_min ?? 30} />
                </div>
              </div>
              <div>
                <Label>Video meeting link (your personal Zoom / Google Meet room)</Label>
                <Input name="video_link" defaultValue={settings?.video_link ?? ""} placeholder="https://meet.google.com/abc-defg-hij" />
              </div>
              <div>
                <Label>Phone note (shown for phone bookings)</Label>
                <Textarea name="phone_note" defaultValue={settings?.phone_note ?? ""} rows={2} />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="is_enabled" defaultChecked={settings?.is_enabled ?? true} />
                Consultations enabled (visible on the site)
              </label>
              <Button type="submit">Save settings</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Add availability */}
      <div>
        <h2 className="mb-3 text-lg font-bold">Availability</h2>
        <Card>
          <CardContent className="p-5">
            <form action={addSlot} className="flex flex-wrap items-end gap-3">
              <div>
                <Label>New time slot</Label>
                <Input name="starts_at" type="datetime-local" className="w-64" required />
              </div>
              <Button type="submit"><Plus /> Add slot</Button>
            </form>

            {slots.length > 0 && (
              <ul className="mt-5 divide-y divide-border">
                {slots.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-forest/80">
                      {new Date(s.starts_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                    {s.is_booked ? (
                      <span className="rounded-full bg-nature/10 px-2 py-0.5 text-xs font-semibold text-nature">Booked</span>
                    ) : (
                      <form action={deleteSlot}>
                        <input type="hidden" name="id" value={s.id} />
                        <Button variant="ghost" size="icon" type="submit" className="text-terracotta" aria-label="Delete slot">
                          <Trash2 />
                        </Button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bookings */}
      <div>
        <h2 className="mb-3 text-lg font-bold">Booked consultations ({bookings.length})</h2>
        {bookings.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-forest/60">No bookings yet.</CardContent></Card>
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                  <div className="flex items-center gap-2">
                    {b.type === "video" ? <Video className="size-4 text-nature" /> : <Phone className="size-4 text-nature" />}
                    <span className="font-semibold text-forest">
                      {b.scheduled_at ? new Date(b.scheduled_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                    </span>
                    <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs capitalize text-forest">{b.type}</span>
                    <span className="rounded-full bg-mint/20 px-2 py-0.5 text-xs text-forest">{b.status}</span>
                  </div>
                  <span className="text-forest/70">
                    {formatPrice((b.price_cents ?? 0) / 100, b.currency)}
                    {b.phone_number ? ` · ${b.phone_number}` : ""}
                  </span>
                </CardContent>
              </Card>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
