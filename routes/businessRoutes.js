const express = require('express');
const router = express.Router();

const businessController = require('../controller/businessController');
const { uploadBusinessProfileMedia } = require('../middleware/multer');

// Authentication routes
router.post('/business-profile/register', uploadBusinessProfileMedia, businessController.addBusinessProfile);
router.get('/business-profile/all', businessController.getAllBusinessProfiles);
router.get('/business-profile/:id', businessController.getBusinessProfileById);
router.put('/business-profile/update/:id', uploadBusinessProfileMedia, businessController.updateBusinessProfile);
router.delete('/business-profile/delete/:id', businessController.deleteBusinessProfile);

module.exports = router;
