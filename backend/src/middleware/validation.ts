import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const VerifySignatureSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(10000, "Message too long"),
  signature: z
    .string()
    .min(1, "Signature cannot be empty")
    .regex(/^(0x)?[0-9a-fA-F]+$/, "Invalid signature format"),
});

export const validateSignatureRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    VerifySignatureSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation Error",
        message: "Invalid request data",
        details: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid request format",
        timestamp: new Date().toISOString(),
      });
    }
  }
};
