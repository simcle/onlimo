const express = require('express')
const router = express.Router();

const streamingController = require('../controllers/streaming');

router.get('/', streamingController.getStreaming );

module.exports = router;