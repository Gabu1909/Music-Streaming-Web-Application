const { z } = require("zod");

const baseUserSchema = z.object({
  input: z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const updateUserSchema = baseUserSchema.partial();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

module.exports = {
  baseUserSchema,
  updateUserSchema,
  loginSchema,
};
