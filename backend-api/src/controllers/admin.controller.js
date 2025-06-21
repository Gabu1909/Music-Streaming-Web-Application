const songService = require("../services/songs.service");
const userService = require("../services/users.service");
const albumService = require("../services/albums.service");

async function getTotalStats(req, res, next) {
  try {
    const [totalSongs, totalUsers, totalAlbums] = await Promise.all([
      songService.countSongs(),
      userService.countUsers(),
      albumService.countAlbums(),
    ]);

    res.json({
      status: "success",
      data: {
        totalSongs,
        totalUsers,
        totalAlbums,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAllUsers(req, res, next) {
  try {
    await userService.deleteAllUsers(); // Gọi hàm xóa toàn bộ user
    res.json({
      status: "success",
      message: "All users have been deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function blockUser(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await userService.getById(userId);
  
      if (!user) {
        return res.status(404).json({ status: "error", message: "User not found" });
      }
  
      await userService.blockUser(userId);
      res.json({ status: "success", message: `User ${userId} has been blocked` });
    } catch (error) {
      next(error);
    }
  }
  
  async function unblockUser(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await userService.getById(userId);
  
      if (!user) {
        return res.status(404).json({ status: "error", message: "User not found" });
      }
  
      await userService.unblockUser(userId);
      res.json({ status: "success", message: `User ${userId} has been unblocked` });
    } catch (error) {
      next(error);
    }
  }
  
module.exports = {
  getTotalStats,
  deleteAllUsers,
  blockUser,
  unblockUser,
};
