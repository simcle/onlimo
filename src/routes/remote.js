const express = require('express');
const router = express.Router();

const remoteController = require('../controllers/remote')

router.post('/power-pump', remoteController.postPowerPump)

module.exports = router;