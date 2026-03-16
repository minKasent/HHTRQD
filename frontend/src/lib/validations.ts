import { z } from "zod";

export const sessionSchema = z.object({
  name: z.string().min(1, "Tên phiên là bắt buộc").max(255),
  description: z.string().optional(),
});

export type SessionForm = z.infer<typeof sessionSchema>;
