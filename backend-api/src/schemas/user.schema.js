const { z } = require("zod");

const baseUserSchema = z.object({
  input: z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const updateUserSchema = z.object({
  input: z.object({
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.string().optional(),
  }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

module.exports = {
  baseUserSchema,
  updateUserSchema,
  loginSchema,
};
