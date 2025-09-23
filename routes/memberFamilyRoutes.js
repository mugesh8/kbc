const express = require('express');
const router = express.Router();

const memberFamilyController = require('../controller/memberFamilyController');

// Authentication routes
router.post('/member-family/register', memberFamilyController.createMemberWithFamily);
router.get('/member-family/:id', memberFamilyController.getMemberWithFamily);
// router.get('/business-profile/:id', businessController.getBusinessProfileById);
// router.put('/business-profile/update/:id', uploadBusinessProfileMedia, businessController.updateBusinessProfile);
// router.delete('/business-profile/delete/:id', businessController.deleteBusinessProfile);

module.exports = router;
