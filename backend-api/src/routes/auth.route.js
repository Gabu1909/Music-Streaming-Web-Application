const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const multer = require("multer");
const upload = multer();
const validate = require("../middlewares/validate.middleware");

const { baseUserSchema } = require("../schemas/user.schema");

router.post(
  "/register",
  upload.single("avatar_url"),
  validate(baseUserSchema),
  authController.createUser
);

router.post("/login", upload.none(), authController.login);

module.exports = router;
