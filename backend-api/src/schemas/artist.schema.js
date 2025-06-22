const { z } = require("zod");

// Schema cho tạo mới artist
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
    .optional(), // Bạn có thể để optional hoặc required tùy yêu cầu

  bio: z.string().optional(),

  avatar_url: z.string().url("Invalid avatar URL").optional(),
});

// Schema cho cập nhật artist
const updateArtistSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url("Invalid avatar URL").optional(),
});

// Schema cho artist_id (dùng cho param hoặc path)
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
