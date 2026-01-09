import z from "zod";

export const registerInputSchema = z.object({
  email: z.email().nonempty({ error: "Email is required." }),
  password: z.string().min(7),
});

export const loginInputSchema = z.object({
  email: z.email().nonempty({ error: "Email is required." }),
  password: z.string(),
});

export type RegisterSchema = z.infer<typeof registerInputSchema>;
export type LoginResponse = z.infer<typeof loginInputSchema>;
