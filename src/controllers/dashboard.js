const Segments = require('../models/segmen');
const EarlyWarning = require('../models/earlyWarning');

exports.getDashboard = (req, res) => {

    let start = new Date()
    start.setDate(start.getDate()-30)
    start.setHours(0,0,0,0)
    const early = EarlyWarning.findOne()
    const segments = Segments.aggregate([
        {
            $lookup: {
                from: 'stations',
                localField: '_id',
                foreignField: 'segmentId',
                let: {ssId: '$_id', startDate: start},
                pipeline: [
                    {$lookup: {
                        from: 'loggers',
                        localField: 'stationId',
                        foreignField: 'stationId',
                        let: {startDate: start},
                        pipeline: [
                            {$match: {
                                $expr: {$gt: ['$addedAt', '$$startDate']}
                            }},
                            {$group: {
                                _id: '$stationId',
                                maxPh: {$max: '$ph'},
                                minPh: {$min: '$ph'},
                                avgPh: {$avg: '$ph'},
                                maxDo: {$max: '$do'},
                                minDo: {$min: '$do'},
                                avgDo: {$avg: '$do'},
                                maxCond: {$max: '$cond'},
                                minCond: {$min: '$cond'},
                                avgCond: {$avg: '$cond'},
                                maxTurb: {$max: '$turb'},
                                minTurb: {$min: '$turb'},
                                avgTurb: {$avg: '$turb'},
                                maxTemp: {$max: '$temp'},
                                minTemp: {$min: '$temp'},
                                avgTemp: {$avg: '$temp'},
                                maxSalt: {$max: '$salt'},
                                minSalt: {$min: '$salt'},
                                avgSalt: {$avg: '$salt'},
                                maxDept: {$max: '$dept'},
                                minDept: {$min: '$dept'},
                                avgDept: {$avg: '$dept'},
                            }}
                        ],
                        as: 'logger'
                    }},
                ],
                as: 'station'
            },
        }
    ])
    Promise.all([
        early,
        segments
    ])
    .then(result => {
        res.status(200).json({
            early: result[0],
            segments: result[1]
        })
    })
    .catch(err => {
        res.status(400).send(err)
    })
}