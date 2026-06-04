import { z } from "zod";

export const bookingSchema = z.object({
  slotId: z.string().uuid(),
  type: z.enum(["video", "phone"]),
});

export type BookingInput = z.infer<typeof bookingSchema>;
