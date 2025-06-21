const { z } = require("zod");

const createSongSchema = z.object({
  input: z.object({
    title: z.string().min(1, "Title is required"),
    artist: z.string().min(1, "Artist is required"),
    album: z.string().optional(),
  }),
});

const updateSongSchema = z.object({
  title: z.string().optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
});

const songIdSchema = z.object({
  input: z.object({
    song_id: z.coerce.number().positive("Song ID must be a positive number"),
  }),
});

module.exports = {
  createSongSchema,
  updateSongSchema,
  songIdSchema,
};
