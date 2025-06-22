const userService = require("../services/users.service");
const ApiError = require("../../api-error");
const bcrypt = require("bcrypt");
const JSend = require("../jsend");
async function getAllUsers(req, res, next) {
  try {
    const users = await userService.getAll();
    res.json({ status: "success", data: users });
  } catch (err) {
    next(new ApiError(500, "Fetch users failed"));
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await userService.getById(req.params.id);
    if (!user) return next(new ApiError(404, "User not found"));
    res.json({ status: "success", data: user });
  } catch (err) {
    return next(new ApiError(500, "Get user failed"));
  }
}

async function updateUser(req, res, next) {
  const { id } = req.params;

  try {
    const validatedData = req.validated;
    const password_hash_new = await bcrypt.hash(validatedData.password, 5);
    const existingUser = await userService.getById(id);
    if (!existingUser) {
      return next(new ApiError(404, "User not found"));
    }
    const updatedUserData = {
      username: validatedData.username || existingUser.username,
      email: validatedData.email || existingUser.email,
      password_hash: password_hash_new || existingUser.password_hash,
      avatar_url: validatedData.avatar_url || existingUser.avatar_url || null,
      role: validatedData.role || existingUser.role,
    };
    const updatedUser = await userService.update(id, updatedUserData);
    res.json(updatedUser);
  } catch (err) {
    console.error("Update User Error:", err);
    next(new ApiError(500, "Update user failed"));
  }
}

async function deleteUser(req, res, next) {
  try {
    await userService.remove(req.params.id);
    res.json({ status: "success", message: "User deleted" });
  } catch (err) {
    next(new ApiError(500, "Delete user failed"));
  }
}
async function addFavoriteSong(req, res, next) {
  try {
    const { id } = req.params;
    const { song_id } = req.validated;

    const result = await userService.addFavoriteSong(id, song_id);

    res.status(200).json(JSend.success(result));
  } catch (err) {
    return next(new ApiError(500, "Internal Server Error"));
  }
}

async function removeFavoriteSong(req, res, next) {
  try {
    const { id } = req.params;
    const { song_id } = req.validated;

    await userService.removeFavoriteSong(id, song_id);
    return res
      .status(200)
      .json(JSend.success({ message: "Song removed from favorites" }));
  } catch (err) {
    return next(new ApiError(500, "Internal Server Error"));
  }
}
async function getFavoriteSong(req, res, next) {
  try {
    const { id } = req.params;
    const userId = Number(id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(404).json(JSend.error({ message: "Invalid User" }));
    }

    const favorites = await userService.getFavSong(userId);
    return res.status(200).json({
      status: "success",
      message: "List of favorite songs",
      data: favorites,
    });
  } catch (err) {
    console.error(err);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

module.exports = {
  deleteUser,
  addFavoriteSong,
  updateUser,
  getFavoriteSong,
  removeFavoriteSong,
  getUserById,
  getAllUsers,
};
