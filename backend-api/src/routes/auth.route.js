const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const multer = require("multer");
const uploadnone = multer();
const upload = require("../middlewares/upload_combined");
const validate = require("../middlewares/validate.middleware");

const { baseUserSchema } = require("../schemas/user.schema");

router.post(
  "/register",
  upload.fields([{ name: "avatar_url", maxCount: 1 }]),
  validate(baseUserSchema),
  authController.createUser
);
router.post("/login", upload.none(), authController.login);

module.exports = router;
