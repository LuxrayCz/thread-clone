import { z } from "zod";

export const ThreadValidation = z.object({
  thread: z.string().nonempty().min(3, { message: "Minimum 3 characters" }),
  accountId: z.string().nonempty(),
});
export const CommentValidation = z.object({
  thread: z.string().nonempty().min(3, { message: "Minimum 3 characters" }),
});

export type ThreadFormType = z.infer<typeof ThreadValidation>;

export type CommentFormType = z.infer<typeof CommentValidation>;
