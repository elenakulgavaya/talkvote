import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

export const talkSchema = z.object({
  title: z.string().min(1, "title is required").max(200),
  speaker: z.string().min(1, "speaker is required").max(100),
  abstract: z.string().min(1, "abstract is required").max(2000),
  track: z.enum(["frontend", "backend", "qa", "devops"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
});

export const statusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
