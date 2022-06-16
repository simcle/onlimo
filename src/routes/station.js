const express = require('express');
const router = express.Router();
const multer = require('multer');

const fileStorage =  multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/temp');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${new Date().getTime()}.${ext}`);
    }
});

const stationController = require('../controllers/station');

const upload = multer({storage: fileStorage});

router.get('/', stationController.getStation);
router.post('/create', upload.single('image'), stationController.postStation);
router.put('/update/:stationId', upload.single('image'), stationController.putStation);
router.put('/status/:stationId', stationController.putStatus);

module.exports = router;