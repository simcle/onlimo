const express = require('express');
const router = express.Router()

const notificationController = require('../controllers/notification')

router.get('/', notificationController.getNotifications);
router.put('/isRead', notificationController.putIsRead);
router.post('/delete', notificationController.deletNotification);

module.exports = router