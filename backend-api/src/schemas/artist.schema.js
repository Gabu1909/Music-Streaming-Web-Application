const { z } = require("zod");

const createArtistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  avatar_url: z.string().url("Invalid avatar URL").optional(),
});

const updateArtistSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url("Invalid avatar URL").optional(),
});

const artistIdSchema = z.object({
  artist_id: z.coerce.number().positive("Artist ID must be a positive number"),
});

module.exports = {
  createArtistSchema,
  updateArtistSchema,
  artistIdSchema,
};
