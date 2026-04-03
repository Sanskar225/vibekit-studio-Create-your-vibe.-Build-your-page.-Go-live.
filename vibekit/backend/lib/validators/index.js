// lib/validators/index.js
const { z } = require("zod");

const THEMES = ["minimal","neo-brutal","dark-neon","pastel-soft","luxury-serif","retro-pixel"];

const signupSchema = z.object({
  name:     z.string().min(2).max(100).trim(),
  email:    z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must contain uppercase, lowercase, and number"),
});

const loginSchema = z.object({
  email:    z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

const createPageSchema = z.object({
  title:    z.string().min(2).max(200).trim(),
  theme:    z.enum(THEMES),
  slug:     z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  sections: z.array(z.any()).optional(),
});

const updatePageSchema = z.object({
  title:    z.string().min(2).max(200).trim().optional(),
  theme:    z.enum(THEMES).optional(),
  slug:     z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  sections: z.array(z.any()).min(1).optional(),
});

const contactSchema = z.object({
  name:    z.string().min(1).max(150).trim(),
  email:   z.string().email().toLowerCase().trim(),
  message: z.string().min(10).max(5000).trim(),
});

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({ field: e.path.join("."), message: e.message }));
    const err = new Error("Validation failed");
    err.statusCode = 422; err.code = "VALIDATION_ERROR"; err.details = details;
    throw err;
  }
  return result.data;
}

module.exports = { signupSchema, loginSchema, createPageSchema, updatePageSchema, contactSchema, validate, THEMES };
