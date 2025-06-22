const artistService = require("../services/artists.service");
const { createArtistSchema } = require("../schemas/artist.schema");

async function createArtist(req, res) {
  try {
    const parsed = createArtistSchema.safeParse({ input: req.body });

    if (!parsed.success) {
      return res.status(400).json({
        status: "error",
        message: parsed.error.errors[0].message,
      });
    }

    const { name, bio, avatar_url } = parsed.data.input;

    const newArtist = await artistService.create({ name, bio, avatar_url });

    res.status(201).json({
      status: "success",
      message: "Artist created successfully",
      data: newArtist,
    });
  } catch (error) {
    console.error("Error creating artist:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

module.exports = {
  createArtist,
};
