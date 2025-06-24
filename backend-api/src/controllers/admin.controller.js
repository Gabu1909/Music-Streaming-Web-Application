const songService = require("../services/songs.service");
const userService = require("../services/users.service");
const albumService = require("../services/albums.service");
const artistService = require("../services/artists.service");
const JSend = require("../jsend");
const ApiError = require("../../api-error");

async function getTotalStats(req, res, next) {
  try {
    const [totalSongs, totalUsers, totalAlbums, totalArtists] =
      await Promise.all([
        songService.countSongs(),
        userService.countUsers(),
        albumService.countAlbums(),
        artistService.countArtists(),
      ]);

    res.json(
      JSend.success({
        totalSongs,
        totalUsers,
        totalAlbums,
        totalArtists,
      })
    );
  } catch (error) {
    next(new ApiError(500, error.message));
  }
}

async function deleteAllUsers(req, res, next) {
  try {
    await userService.deleteAllUsers();
    res.json(JSend.success("All users have been deleted successfully"));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
}

async function blockUser(req, res, next) {
  try {
    const userId = req.params.id;
    const user = await userService.getById(userId);

    if (!user) {
      return res.status(404).json(JSend.error("User not found"));
    }

    await userService.blockUser(userId);
    res.json(JSend.success(`User ${userId} has been blocked`));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
}

async function unblockUser(req, res, next) {
  try {
    const userId = req.params.id;
    const user = await userService.getById(userId);

    if (!user) {
      return res.status(404).json(JSend.error("User not found"));
    }

    await userService.unblockUser(userId);
    res.json(JSend.success(`User ${userId} has been unblocked`));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
}
module.exports = {
  getTotalStats,
  deleteAllUsers,
  blockUser,
  unblockUser,
};
