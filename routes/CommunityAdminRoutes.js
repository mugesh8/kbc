const express = require("express");
const router = express.Router();
const CommunityAdminController = require("../controller/CommunityAdminController");

// Add (Register)
router.post("/community_admin/register", CommunityAdminController.addCommunityAdmin);

// Get all
router.get("/community_admin/all", CommunityAdminController.getAllCommunityAdmins);

// Get by ID
router.get("/community_admin/:id", CommunityAdminController.getCommunityAdminById);

// Update
router.put("/community_admin/update/:id", CommunityAdminController.updateCommunityAdmin);

// Delete
router.delete("/community_admin/delete/:id", CommunityAdminController.deleteCommunityAdmin);

// Login
router.post("/community_admin/login", CommunityAdminController.loginCommunityAdmin);

// Logout
router.post("/community_admin/logout", CommunityAdminController.logoutCommunityAdmin);

module.exports = router;
