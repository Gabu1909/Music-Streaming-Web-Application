const { z } = require("zod");
const playlistInputSchema = z.object({
  name: z.string({ required_error: "Name is required" }),
  user_id: z.coerce.number().optional(),
  is_public: z.coerce.boolean().optional(),
  is_system: z.coerce.boolean({ required_error: "is_system is required" }),
  song_ids: z.preprocess((val) => {
    if (!val || val === "") return undefined;
    if (typeof val === "string") {
      return val
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((n) => !isNaN(n));
    }
    if (Array.isArray(val)) {
      return val.map((v) => Number(v)).filter((n) => !isNaN(n));
    }
    return [];
  }, z.array(z.number().int().positive()).optional()),
});

const createPlaylistSchema = z.object({
  input: playlistInputSchema,
});

const updatePlaylistSchema = z.object({
  input: playlistInputSchema.partial(),
});

module.exports = { createPlaylistSchema, updatePlaylistSchema };
