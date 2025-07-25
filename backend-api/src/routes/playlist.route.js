const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playlist.controller");
const upload = require("../middlewares/upload_combined");

router.post(
  "/",
  upload.fields([{ name: "cover", maxCount: 1 }]),
  playlistController.createPlaylist
);
router.get("/", playlistController.getAllPlaylists);
router.delete("/", playlistController.deleteAllPlaylists);
router.put(
  "/:id",
  upload.fields([{ name: "cover", maxCount: 1 }]),
  playlistController.updatePlaylist
);
router.delete("/:id", playlistController.deletePlaylistById);
router.get("/:id", playlistController.getPlaylistById);
module.exports = router;
