const express = require("express");
const router = express.Router();
const AlbumController = require("../controllers/album.controller.js");
const upload = require("../middlewares/upload_combined.js");
const validate = require("../middlewares/validate.middleware.js");
const { createAlbumSchema } = require("../schemas/album.schema.js");


router.get("/", AlbumController.getAllAlbums);

router.post(
  "/",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "audio_files", maxCount: 20 },
  ]),
  validate(createAlbumSchema),
  AlbumController.createAlbum
);


router.put(
  "/:id",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "audio_files", maxCount: 20 },
  ]),
  validate(createAlbumSchema),
  AlbumController.updateAlbum
);

router.get("/:id", AlbumController.getAlbumById);

router.delete("/:id", AlbumController.deleteAlbum);
router.get("/:id/songs", AlbumController.getSongsByAlbum);

module.exports = router;
