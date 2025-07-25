const { z } = require("zod");

const createArtistSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(1, "Name is required"),

  user_id: z
    .string()
    .regex(/^\d+$/, "User ID must be a number")
    .transform((val) => parseInt(val, 10))
    .optional(),

  bio: z.string().optional(),

  avatar_url: z.string().url("Invalid avatar URL").optional(),
});

const updateArtistSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url("Invalid avatar URL").optional(),
});

const artistIdSchema = z.object({
  artist_id: z.coerce
    .number()
    .int("Artist ID must be an integer")
    .positive("Artist ID must be a positive number"),
});

module.exports = {
  createArtistSchema,
  updateArtistSchema,
  artistIdSchema,
};
