const express = require('express');
const router = express.Router();

const loggerController = require('../controllers/logger');

router.get('/', loggerController.getLogger);
router.get('/download', loggerController.download);
router.post('/modbus', loggerController.postLogger);

module.exports = router;