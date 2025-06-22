const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const artistController = require("../controllers/artist.controller");

router.post("/createArtist", upload.none(), artistController.createArtist);
router.delete("/deleteAll", artistController.deleteAllArtists);
router.get("/getAll", artistController.getAllArtists);
router.get("/getArtistsByFilter", artistController.getArtistsByFilter);
router.get("/:id", artistController.getArtistById);
router.put("/:id", upload.none(), artistController.updateArtistById);
router.delete("/:id", artistController.deleteArtistById);

module.exports = router;
