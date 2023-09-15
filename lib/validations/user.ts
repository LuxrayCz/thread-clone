import * as z from "zod";

export const userValidation = z.object({
  profilePhoto: z.string().url().nonempty(),
  name: z.string().min(3).max(30).nonempty(),
  username: z.string().min(3).max(30).nonempty(),
  bio: z.string().min(3).max(1000).nonempty(),
});

export type formType = z.infer<typeof userValidation>;
