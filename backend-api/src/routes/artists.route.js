const express = require("express");
const router = express.Router();
const multer = require("multer"); 
const upload = multer();          

const artistController = require("../controllers/artist.controller");

router.post("/", upload.none(), artistController.createArtist);

module.exports = router;
