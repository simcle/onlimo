const express = require('express');
const router = express.Router();

const segmentController = require('../controllers/segment');

router.get('/', segmentController.getSegment)
router.post('/create', segmentController.postSegment);
router.put('/update/:segmentId', segmentController.putSegment);

module.exports = router;