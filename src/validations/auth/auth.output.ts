import z from "zod";

export const registerErrorSchema = z.object({
  email: z.array(z.string()).optional(),
  password: z.array(z.string()).optional(),
});

export const loginErrorSchema = z.object({
  email: z.array(z.string()).optional(),
  password: z.array(z.string()).optional(),
});

export type RegisterError = z.infer<typeof registerErrorSchema>;
export type LoginError = z.infer<typeof loginErrorSchema>;
