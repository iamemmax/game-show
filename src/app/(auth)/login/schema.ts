import { z } from "zod";

export const loginSchema = z.object({
  login_code: z
    .string()
    .min(6,"Contestant ID must be at least 6 characters")
    .max(6, "Contestant ID cannot exceed 6 characters")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Contestant ID must contain only letters and numbers"
    ).trim(),
    game_episode:z.string().min(1)
});

export type LoginFormData = z.infer<typeof loginSchema>;
