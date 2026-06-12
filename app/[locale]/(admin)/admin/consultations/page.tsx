import { Plus, Trash2, Video, Phone, CalendarClock } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminListSlots, adminListConsultations } from "@/lib/services/consultations";
import { updateConsultationSettings, addSlot, deleteSlot } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Consultation settings</CardTitle>
          <CardDescription>Pricing, duration and how clients reach you.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form action={updateConsultationSettings} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cs-price">Price (USD)</Label>
                <Input id="cs-price" name="price" type="number" step="0.01" min="0" defaultValue={((settings?.price_cents ?? 5000) / 100).toFixed(2)} />
              </div>
              <div>
                <Label htmlFor="cs-duration">Duration (minutes)</Label>
                <Input id="cs-duration" name="duration_min" type="number" min="5" defaultValue={settings?.duration_min ?? 30} />
              </div>
            </div>
            <div>
              <Label htmlFor="cs-video">Video meeting link (your personal Zoom / Google Meet room)</Label>
              <Input id="cs-video" name="video_link" defaultValue={settings?.video_link ?? ""} placeholder="https://meet.google.com/abc-defg-hij" />
            </div>
            <div>
              <Label htmlFor="cs-phone">Phone note (shown for phone bookings)</Label>
              <Textarea id="cs-phone" name="phone_note" defaultValue={settings?.phone_note ?? ""} rows={2} />
            </div>
            <label className="flex w-fit cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-medium text-forest transition-colors hover:border-nature/50 has-[:checked]:border-nature has-[:checked]:bg-mint/10">
              <input type="checkbox" name="is_enabled" defaultChecked={settings?.is_enabled ?? true} className="size-4 accent-forest" />
              Consultations enabled (visible on the site)
            </label>
            <Button type="submit">Save settings</Button>
          </form>
        </CardContent>
      </Card>

      {/* Add availability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Availability</CardTitle>
          <CardDescription>Open time slots clients can book.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form action={addSlot} className="flex flex-wrap items-end gap-3">
            <div>
              <Label htmlFor="cs-slot">New time slot</Label>
              <Input id="cs-slot" name="starts_at" type="datetime-local" className="w-64" required />
            </div>
            <Button type="submit"><Plus /> Add slot</Button>
          </form>

          {slots.length > 0 && (
            <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
              {slots.map((s) => (
                <li key={s.id} className="flex min-h-12 items-center justify-between gap-3 px-4 py-1.5 text-sm">
                  <span className="text-forest/85">
                    {new Date(s.starts_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                  {s.is_booked ? (
                    <Badge variant="nature">Booked</Badge>
                  ) : (
                    <form action={deleteSlot}>
                      <input type="hidden" name="id" value={s.id} />
                      <Button
                        variant="ghost"
                        size="sm"
                        type="submit"
                        className="h-9 w-9 p-0 text-terracotta hover:bg-terracotta/10 hover:text-terracotta"
                        aria-label="Delete slot"
                      >
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

      {/* Bookings */}
      <section>
        <div className="mb-3 flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-forest">Booked consultations</h2>
          <Badge variant="outline" className="tabular-nums">{bookings.length}</Badge>
        </div>
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
              <CalendarClock className="size-8 text-nature/40" aria-hidden />
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => (
              <li key={b.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 pt-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-nature/10 text-nature">
                        {b.type === "video" ? <Video className="size-4" aria-hidden /> : <Phone className="size-4" aria-hidden />}
                      </span>
                      <span className="font-semibold text-forest">
                        {b.scheduled_at ? new Date(b.scheduled_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                      </span>
                      <Badge variant="forest" className="capitalize">{b.type}</Badge>
                      <Badge variant="mint" className="capitalize">{b.status}</Badge>
                    </div>
                    <span className="font-medium tabular-nums text-forest/80">
                      {formatPrice((b.price_cents ?? 0) / 100, b.currency)}
                      {b.phone_number ? ` · ${b.phone_number}` : ""}
                    </span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
