const { z } = require("zod");

const favoriteSongSchema = z.object({
  input: z.object({
    user_id: z.coerce.number().optional(),
    song_id: z.coerce.number().int().optional(),
  }),
});

module.exports = {
  favoriteSongSchema,
};
