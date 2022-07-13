const Segment = require('../models/segmen');

exports.getSegment = (req, res) => {
    Segment.aggregate([
        {$lookup: {
            from: 'stations',
            localField: '_id',
            foreignField: 'segmentId',
            as: 'stations'
        }},
        {$sort: {createdAt: -1}}
    ])
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => {
        console.log(err);
        res.status(400).json(err)
    })
}

exports.postSegment = (req, res) => {
    const segment = new Segment({
        name: req.body.name,
        lokasi: req.body.lokasi
    })
    segment.save()
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => {
        res.status(400).send(err)
    })
}

exports.putSegment = (req, res) => {
    const segmentId = req.params.segmentId;
    Segment.findById(segmentId)
    .then(segment => {
        segment.name = req.body.name
        segment.lokasi = req.body.lokasi
        return segment.save()
    })
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => {
        res.status(400).send(err)
    })
}