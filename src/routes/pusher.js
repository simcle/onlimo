const express = require('express');
const router = express.Router();

const pusherController = require('../controllers/pusher')

router.post('/power-pump', pusherController.postPowerPump)

module.exports = router;