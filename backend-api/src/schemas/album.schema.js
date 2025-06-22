const { z } = require("zod");

const createAlbumSchema = z.object({
  input: z.object({
    title: z.string().min(1, "Title is required"),
    release_date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
      .optional(),
    artist: z.string(),
  }),
});

const updateAlbumSchema = z.object({
  input: z.object({
    title: z.string().optional(),
    release_date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
      .optional(),
    artist: z.string().optional(),
  }),
});
module.exports = {
  createAlbumSchema,
  updateAlbumSchema,
};
