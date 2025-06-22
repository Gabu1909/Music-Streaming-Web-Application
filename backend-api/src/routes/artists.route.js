const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload_combined");
const artistController = require("../controllers/artist.controller");

router.post(
  "/",
  upload.fields([{ name: "avatar_url", maxCount: 1 }]),
  artistController.createArtist
);
router.delete("/", artistController.deleteAllArtists);

router.get("/", artistController.getArtistsByFilter);
router.get("/:id", artistController.getArtistById);
router.put(
  "/:id",
  upload.fields([{ name: "avatar_url", maxCount: 1 }]),
  artistController.updateArtistById
);
router.delete("/:id", artistController.deleteArtistById);

module.exports = router;
