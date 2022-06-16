const express = require('express');
const router = express.Router()

const statisticsController = require('../controllers/statistics');

router.get('/', statisticsController.getChart);

module.exports = router;