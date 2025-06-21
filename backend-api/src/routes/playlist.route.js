const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playlist.controller");
const validate = require("../middlewares/validate.middleware");
const upload = require("../middlewares/upload_combined.js");
const {
  createPlaylistSchema,
  updatePlaylistSchema,
} = require("../schemas/playlist.schema");

router.post(
  "/",
  upload.fields([{ name: "cover", maxCount: 1 }]),
  validate(createPlaylistSchema),
  playlistController.createPlaylist
);

router.get("/", playlistController.getAllPlaylists);

router.delete("/", playlistController.deleteAllPlaylists);

router.put(
  "/:id",
  upload.fields([{ name: "cover", maxCount: 1 }]),
  validate(updatePlaylistSchema),
  playlistController.updatePlaylist
);
router.delete("/:id", playlistController.deletePlaylistById);

module.exports = router;
