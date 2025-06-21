const express = require("express");
const router = express.Router();
const songController = require("../controllers/songs.controller");
const upload = require("../middlewares/upload_combined");
const validate = require("../middlewares/validate.middleware");
const {
  createSongSchema,
  updateSongSchema,
} = require("../schemas/song.schema");

router.post(
  "/",
  upload.fields([
    { name: "audio_files", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  validate(createSongSchema),
  songController.addSong
);
router.get("/:id", songController.getSongById);

router.put(
  "/:id",
  upload.fields([
    { name: "audio_files", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  validate(updateSongSchema),
  songController.updateSong
);

router.delete("/:id", songController.deleteSong);

module.exports = router;
