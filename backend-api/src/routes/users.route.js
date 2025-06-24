const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");

const multer = require("multer");
const { favoriteSongSchema } = require("../schemas/favorite.schema");
const validate = require("../middlewares/validate.middleware");
const { updateUserSchema } = require("../schemas/user.schema");
const upload = require("../middlewares/upload_combined");
const uploadnone = multer();
router.get("/", usersController.getAllUsers);
router.get("/:id", usersController.getUserById);

router.delete("/:id", usersController.deleteUser);

router.post(
  "/:id/favorites",
  uploadnone.none(),
  validate(favoriteSongSchema),
  usersController.addFavoriteSong
);
router.get("/:id/favorites", usersController.getFavoriteSong);

router.delete(
  "/:id/favorites",
  uploadnone.none(),
  validate(favoriteSongSchema),
  usersController.removeFavoriteSong
);
router.put(
  "/:id",
  upload.fields([{ name: "avatar_url", maxCount: 1 }]),
  validate(updateUserSchema),
  usersController.updateUser
);
module.exports = router;
