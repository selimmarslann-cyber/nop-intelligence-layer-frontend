// src/utils/validation.ts
import { z } from "zod";

// Common validation schemas
export const moderateSchema = z.object({
  text: z.string().min(1, "Text cannot be empty").max(10000, "Text too long"),
});

export const addBurnSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Valid amount required"),
  txHash: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export const approveWithdrawalSchema = z.object({
  txHash: z.string().optional().nullable(),
});

export const addressParamSchema = z.object({
  address: z.string().min(1, "Address required"),
});

export const idParamSchema = z.object({
  id: z.string().refine((val) => !isNaN(parseInt(val)), "Invalid ID"),
});

// Helper to validate request body
export async function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = schema.parse(body);
    return { success: true, data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      };
    }
    return { success: false, error: "Validation failed" };
  }
}

// Helper to validate request params
export async function validateParams<T>(
  schema: z.ZodSchema<T>,
  params: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = schema.parse(params);
    return { success: true, data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      };
    }
    return { success: false, error: "Validation failed" };
  }
}

