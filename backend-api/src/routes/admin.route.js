const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
router.get("/total", adminController.getTotalStats);
router.delete("/delete", adminController.deleteAllUsers);
router.patch("/users/:id/block", adminController.blockUser);
router.patch("/users/:id/unblock", adminController.unblockUser);

module.exports = router;
