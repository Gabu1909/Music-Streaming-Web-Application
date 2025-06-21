const playlistService = require("../services/playlist.service");
const { updatePlaylistSchema } = require("../schemas/playlist.schema");
const JSend = require("../jsend");
async function createPlaylist(req, res, next) {
  try {
    const body = req.validated;
    const playlist = await playlistService.createPlaylistWithSongs(body);
    res.status(201).json({ status: "success", data: playlist });
  } catch (err) {
    next(err);
  }
}

async function getAllPlaylists(req, res, next) {
  try {
    const playlists = await playlistService.getAllPlaylists();
    res.status(200).json({ status: "success", data: playlists });
  } catch (err) {
    next(err);
  }
}

async function deleteAllPlaylists(req, res, next) {
  try {
    await playlistService.deleteAllPlaylists();
    res.status(200).json({ status: "success", message: "Deleted playlists" });
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
async function updatePlaylist(req, res, next) {
  try {
    const {
      params: { id },
      body,
    } = req;

    const { input } = updatePlaylistSchema.parse({ input: body });

    const coverFile = req.files?.cover?.[0];

    const playlist = await playlistService.updatePlaylist(id, input, coverFile);

    res.status(200).json({ status: "success", data: playlist });
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
