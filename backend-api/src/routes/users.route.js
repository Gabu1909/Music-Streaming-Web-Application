const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");
const adminController = require("../controllers/admin.controller");

const upload = require("../middlewares/upload_combined");
const multer = require("multer");
const uploadnone = multer();

const validate = require("../middlewares/validate.middleware");
const {
  authenticateJWT,
  authorizeSelfOrAdmin,
  authorizeRole,
} = require("../middlewares/auth.middleware");

const { updateUserSchema } = require("../schemas/user.schema");
const { favoriteSongSchema } = require("../schemas/favorite.schema");
const {
  favoriteLimiter,
  updateUserLimiter,
} = require("../middlewares/rate_limit");

router.get("/", authenticateJWT, authorizeRole("admin"), usersController.getAllUsers);
router.get("/:id", authenticateJWT, usersController.getUserById);

router.put(
  "/:id",
  authenticateJWT,
  authorizeSelfOrAdmin,
  updateUserLimiter,
  upload.fields([{ name: "avatar_url", maxCount: 1 }]),
  validate(updateUserSchema),
  usersController.updateUser
);

router.delete("/:id", authenticateJWT, authorizeSelfOrAdmin, usersController.deleteUser);

router.post(
  "/:id/favorites",
  authenticateJWT,
  uploadnone.none(),
  validate(favoriteSongSchema),
  usersController.addFavoriteSong
);

router.get(
  "/:id/favorites",
  authenticateJWT,
  usersController.getFavoriteSong
);

router.delete(
  "/:id/favorites",
  authenticateJWT,
  favoriteLimiter,
  uploadnone.none(),
  validate(favoriteSongSchema),
  usersController.removeFavoriteSong
);

router.get("/total", authenticateJWT, authorizeRole("admin"), adminController.getTotalStats);
router.delete("/delete", authenticateJWT, authorizeRole("admin"), adminController.deleteAllUsers);
router.patch("/:id/block", authenticateJWT, authorizeRole("admin"), adminController.blockUser);
router.patch("/:id/unblock", authenticateJWT, authorizeRole("admin"), adminController.unblockUser);


module.exports = router;
