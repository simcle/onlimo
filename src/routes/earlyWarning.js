const express = require('express');
const router = express.Router();

const earlyWarningController = require('../controllers/earlyWarning');

router.get('/', earlyWarningController.getEarlyWarning);
router.post('/create', earlyWarningController.postEarlyWarning);

module.exports = router;
