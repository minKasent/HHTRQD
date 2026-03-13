import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

export const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  full_name: z.string().min(2, "Tên ít nhất 2 ký tự").max(255),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirm_password"],
});

export const sessionSchema = z.object({
  name: z.string().min(1, "Tên phiên là bắt buộc").max(255),
  description: z.string().optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type SessionForm = z.infer<typeof sessionSchema>;
