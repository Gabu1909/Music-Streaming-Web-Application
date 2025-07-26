const artistService = require("../services/artists.service");
const { createArtistSchema } = require("../schemas/artist.schema");
const knex = require("../database/knex");
const JSend = require("../jsend");

async function createArtist(req, res) {
  try {
    const parsed = createArtistSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(JSend.fail(parsed.error.errors[0]));
    }

    const { name, bio, user_id } = parsed.data;
    const file = req.file || req.files?.avatar_url?.[0];

    let avatar_url = null;
    if (file) {
      avatar_url = `public/uploads/img/${file.filename}`;
    }

    const newArtist = await artistService.create({ name, bio, avatar_url, user_id });

    return res.status(201).json(JSend.success({ artist: newArtist }));
  } catch (error) {
    console.error("Error creating artist:", error);
    return res.status(500).json(JSend.error("Internal server error"));
  }
}

async function deleteAllArtists(req, res) {
  try {
    await artistService.deleteAll();
    return res.json(JSend.success({ message: "All artists have been deleted" }));
  } catch (error) {
    console.error("Error deleting all artists:", error);
    return res.status(500).json(JSend.error("Internal server error"));
  }
}

async function getAllArtists(req, res) {
  try {
    const artists = await artistService.findAll();
    return res.status(200).json(JSend.success({ artists }));
  } catch (error) {
    console.error("Error fetching artists:", error);
    return res.status(500).json(JSend.error("Internal server error"));
  }
}
exports.getArtistSongs = async (req, res) => {
  try {
    const artist = await artistService.findById(req.params.id)
      .populate('songs', 'title duration audioUrl coverImage')
      .select('songs');
      
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    res.json({
      status: 'success',
      data: artist.songs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function getArtistsByFilter(req, res) {
  try {
    const { name, page = 1, limit = 10 } = req.query;

    const result = await artistService.findAllWithFilters({
      name,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return res.status(200).json(JSend.success({
      artists: result.artists,
      metadata: result.metadata,
    }));
  } catch (error) {
    console.error("Error filtering artists:", error);
    return res.status(500).json(JSend.error("Internal server error"));
  }
}
async function getArtistAlbums(req, res) {
  try {
    const artistId = req.params.id;
  
    const artist = await artistService.findById(artistId);
    if (!artist) {
      return res.status(404).json(JSend.fail({ message: "Artist not found" }));
    }

    const albums = await artistService.findAlbumsByArtistId(artistId);
    
    return res.json(JSend.success({ albums }));
  } catch (error) {
    console.error("Error fetching artist albums:", error);
    return res.status(500).json(JSend.error("Internal server error"));
  }
}

async function getArtistSongs(req, res) {
  try {
    const artistId = req.params.id;
    
    const artist = await artistService.findById(artistId);
    if (!artist) {
      return res.status(404).json(JSend.fail({ message: "Artist not found" }));
    }
    const songs = await artistService.findSongsByArtistId(artistId);
    
    return res.json(JSend.success({ songs }));
  } catch (error) {
    console.error("Error fetching artist songs:", error);
    return res.status(500).json(JSend.error("Internal server error"));
  }
}

async function getArtistById(req, res) {
  try {
    const artistId = req.params.id;
    const artist = await artistService.findById(artistId);

    if (!artist) {
      return res.status(404).json(JSend.fail({ message: "Artist not found" }));
    }

    return res.json(JSend.success({ artist }));
  } catch (error) {
    console.error("Error fetching artist by ID:", error);
    return res.status(500).json(JSend.error("Internal server error"));
  }
}

async function updateArtistById(req, res) {
  try {
    const artistId = req.params.id;
    const updatedData = req.body;
    const file = req.file || req.files?.avatar_url?.[0];

    if (file) {
      updatedData.avatar_url = `public/uploads/img/${file.filename}`;
    }

    const artist = await artistService.updateById(artistId, updatedData);

    if (!artist) {
      return res.status(404).json(JSend.fail({ message: "Artist not found" }));
    }

    return res.json(JSend.success({ artist }));
  } catch (error) {
    console.error("Error updating artist:", error);
    return res.status(500).json(JSend.error("Internal server error"));
  }
}

async function deleteArtistById(req, res) {
  try {
    const artistId = req.params.id;
    const artist = await artistService.findById(artistId);

    if (!artist) {
      return res.status(404).json(JSend.fail({ message: "Artist not found" }));
    }

    await knex("artists").where("artist_id", artistId).del();

    return res.json(
      JSend.success({ message: `Artist with ID ${artistId} deleted successfully.` })
    );
  } catch (error) {
    console.error("Error deleting artist:", error);
    return res.status(500).json(JSend.error("Internal server error"));
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
  getArtistSongs,
  getArtistAlbums

};
