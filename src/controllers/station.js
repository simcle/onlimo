const sharp = require('sharp');
const Stations = require('../models/stations');
const fs = require('fs');
const path = require('path');

exports.getStation = (req, res) => {
    Stations.find().sort({name: -1})
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        res.status(400).send(err);
    });
};


exports.postStation = async (req, res) => {
    let fileName = ''
    if(req.file) {
        const {filename: image} = req.file;
        const filePath = `./public/img/station/${req.file.filename}`
        await sharp(req.file.path)
        .resize({height: 300})
        .toFile(filePath);
        fs.unlinkSync(req.file.path);
        fileName = `public/img/station/${req.file.filename}`
    } else {
        fileName = ''
    }
    const station = new Stations({
        segmentId: req.body.segmentId,
        stationId: req.body.stationId,
        name: req.body.name,
        address: req.body.address,
        logger: req.body.logger,
        sensor: req.body.sensor,
        segmentation: req.body.segmentation,
        idpel: req.body.idpel,
        sim: req.body.sim,
        image: fileName,
        coordinates: JSON.parse(req.body.coordinates)
    })
    station.save()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        res.status(400).send(err);
    })
};

exports.putStation = async (req, res) => {
    let fileName = ''
    const stationId = req.params.stationId;
    if(req.file) {
        const {filename: image} = req.file;
        const filePath = `./public/img/station/${req.file.filename}`
        await sharp(req.file.path)
        .resize({height: 300})
        .toFile(filePath);
        fs.unlinkSync(req.file.path);
        fileName = `public/img/station/${req.file.filename}`
    } else {
        fileName = ''
    }
    Stations.findById(stationId)
    .then(station => {
        if(fileName) {
            if(station.image) {
                removeImage(station.image)
            }
            station.image = fileName
        }
        station.stationId = req.body.stationId
        station.name = req.body.name
        station.address = req.body.address
        station.logger = req.body.logger
        station.sensor = req.body.sensor
        station.segmentation = req.body.segmentation,
        station.idpel = req.body.idpel
        station.sim = req.body.sim
        station.coordinates = JSON.parse(req.body.coordinates)
        return station.save()
    })
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        res.status(400).send(err);
    });
}

exports.putStatus = (req, res) => {
    const stationId = req.params.stationId
    Stations.findById(stationId)
    .then(station => {
        station.status = req.body.status
        return station.save()
    })
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => {
        res.status(400).send(err)
    })
}

const removeImage = (filePath) => {
    filePath = path.join(__dirname, '../..', filePath);
    fs.unlink(filePath, err => {
        console.log(err);
        console.log(filePath);
       if(err) return;
    })
}