const Stations = require('../models/stations')

exports.getStreaming = (req, res) => {
    let start = new Date()
    start.setHours(start.getHours()-24)
    Stations.aggregate([
        {$lookup: {
            from: 'loggers',
            localField: 'stationId',
            foreignField: 'stationId',
            let: {startDate: start},
            pipeline: [
                {$match: {
                    $expr: {$gte: ['$addedAt', '$$startDate']}
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
        {
            $sort: {status: 1}
        }
    ])
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        res.status(400).send(err)
    })
}