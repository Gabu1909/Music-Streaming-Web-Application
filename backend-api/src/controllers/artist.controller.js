const artistService = require("../services/artists.service");
const { createArtistSchema } = require("../schemas/artist.schema");
const knex = require("../database/knex");

// Tạo mới artist
async function createArtist(req, res) {
  try {
    const parsed = createArtistSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        status: "error",
        message: parsed.error.errors[0].message,
      });
    }

    const { name, bio, avatar_url, user_id } = parsed.data;

    const newArtist = await artistService.create({
      name,
      bio,
      avatar_url,
      user_id,
    });

    res.status(201).json({
      status: "success",
      message: "Artist created successfully",
      data: { artist: newArtist },
    });
  } catch (error) {
    console.error("Error creating artist:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

// Xoá tất cả artists
async function deleteAllArtists(req, res) {
  try {
    await artistService.deleteAll();

    res.status(200).json({
      status: "success",
      message: "All artists have been deleted",
    });
  } catch (error) {
    console.error("Error deleting all artists:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

async function getAllArtists(req, res) {
  try {
    const artists = await artistService.findAll();

    res.status(200).json({
      status: "success",
      message: "Fetched all artists successfully",
      data: { artists },
    });
  } catch (error) {
    console.error("Error fetching artists:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

async function getArtistsByFilter(req, res) {
  try {
    const { name, page = 1, limit = 10 } = req.query;

    const result = await artistService.findAllWithFilters({
      name,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      status: "success",
      data: {
        artists: result.artists,
        metadata: result.metadata,
      },
    });
  } catch (error) {
    console.error("Error filtering artists:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

async function getArtistById(req, res) {
  try {
    const artistId = req.params.id;

    const artist = await artistService.findById(artistId);

    if (!artist) {
      return res.status(404).json({
        status: "fail",
        message: "Artist not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { artist },
    });
  } catch (error) {
    console.error("Error fetching artist by ID:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

async function updateArtistById(req, res) {
  try {
    const artistId = req.params.id;
    const updatedData = req.body;

    const artist = await artistService.updateById(artistId, updatedData);
    if (!artist) {
      return res.status(404).json({
        status: "fail",
        message: "Artist not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { artist },
    });
  } catch (error) {
    console.error("Error updating artist:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

async function deleteArtistById(req, res) {
  try {
    const artistId = req.params.id;

    const artist = await artistService.findById(artistId);
    if (!artist) {
      return res.status(404).json({
        status: "fail",
        message: "Artist not found",
      });
    }

    await knex("artists").where("artist_id", artistId).del();

    res.status(200).json({
      status: "success",
      message: `Artist with ID ${artistId} deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting artist:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}
module.exports = {
  createArtist,
  deleteAllArtists,
  getAllArtists,
  getArtistsByFilter,
  getArtistById,
  updateArtistById,
  deleteArtistById,
};
