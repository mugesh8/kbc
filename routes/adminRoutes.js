const express = require('express');
const router = express.Router();

const adminController = require('../controller/adminController');
const { adminValidator, adminLoginValidator, updateProfileValidator, changePasswordValidator } = require('../validators/adminValidator');
const { verifyAdminToken } = require('../controller/adminController');
const { uploadAdminImage } = require('../middleware/multer');

// Authentication routes
router.post('/admin/register', uploadAdminImage, adminController.admin);
router.post('/admin/login', adminLoginValidator, adminController.adminLogin);

// Profile routes - protected by authentication middleware
router.get('/admin/profile', verifyAdminToken, adminController.getAdminProfile);
router.put('/admin/profile', verifyAdminToken, updateProfileValidator, uploadAdminImage, adminController.updateAdminProfile);

// Password change route
router.put('/admin/change-password', verifyAdminToken, changePasswordValidator, adminController.changeAdminPassword);

module.exports = router;
