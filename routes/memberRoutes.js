const express = require('express');
const router = express.Router();

const memberController = require('../controller/memberController');
const { uploadBusinessProfileMedia } = require('../middleware/multer');

// Authentication routes
router.post('/member/register', uploadBusinessProfileMedia, memberController.registerMember);
router.post('/member/login', memberController.loginMember);
router.post('/member/logout/:id', memberController.logoutMember);

// Profile routes - protected by authentication middleware
router.get('/member/all', memberController.getAllMembers);
router.get('/member/:id', memberController.getMemberById);
router.put('/member/update/:id', uploadBusinessProfileMedia, memberController.updateMember);
router.put('/business-profile/update/:id', uploadBusinessProfileMedia, memberController.updateBusinessProfile);
router.put('/family-details/update/:id', memberController.updateFamilyDetails);
router.delete('/member/delete/:id', memberController.deleteMember);

router.delete('/business/delete/:id', memberController.deleteBusinessProfile);
router.delete('/family/delete/:id', memberController.deleteFamily);

router.post('/business-profile/:member_id', uploadBusinessProfileMedia, memberController.addBusinessProfileForMember);
router.get('/business-profile/all', memberController.getAllBusinessProfiles);
router.get('/business-profile/:id', memberController.getBusinessProfileById);

router.post('/family/:member_id', memberController.addFamilyForMember);



// Password change route
// router.put('/admin/change-password', memberController.changeAdminPassword);

module.exports = router;
