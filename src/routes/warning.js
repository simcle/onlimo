const express = require('express');
const router = express.Router();

const warningController = require('../controllers/warning');

router.get('/', warningController.getWarning);

module.exports = router;