const playlistService = require("../services/playlist.service");
const {
  createPlaylistSchema,
  updatePlaylistSchema,
} = require("../schemas/playlist.schema");
const JSend = require("../jsend");

async function createPlaylist(req, res, next) {
  try {
    const { input } = createPlaylistSchema.parse({ input: req.body });
    const coverFile = req.files?.cover?.[0];
    const playlist = await playlistService.createPlaylistWithSongs(
      input,
      coverFile
    );
    res.status(201).json(JSend.success(playlist));
  } catch (err) {
    next(err);
  }
}

async function getAllPlaylists(req, res, next) {
  try {
    const playlists = await playlistService.getAllPlaylists();
    res.status(200).json(JSend.success(playlists));
  } catch (err) {
    next(err);
  }
}

async function deleteAllPlaylists(req, res, next) {
  try {
    await playlistService.deleteAllPlaylists();
    res.status(200).json(JSend.success({ message: "Deleted all playlists" }));
  } catch (err) {
    next(err);
  }
}

async function updatePlaylist(req, res, next) {
  try {
    const { id } = req.params;
    const { input } = updatePlaylistSchema.parse({ input: req.body });
    const coverFile = req.files?.cover?.[0];
    const playlist = await playlistService.updatePlaylist(id, input, coverFile);
    res.status(200).json(JSend.success(playlist));
  } catch (err) {
    next(err);
  }
}

async function deletePlaylistById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await playlistService.deletePlaylistById(id);
    res.status(200).json(JSend.success(result));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPlaylist,
  getAllPlaylists,
  deleteAllPlaylists,
  updatePlaylist,
  deletePlaylistById,
};
