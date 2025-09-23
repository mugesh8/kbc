const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

router.get('/notifications/:member_id', notificationController.getNotifications);
router.post('/profileview', notificationController.profileViewNotification);
router.patch('/mark-read/:id', notificationController.markAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);

module.exports = router;
