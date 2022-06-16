const mongoose = require('mongoose');
const Loggers = require('../models/logger');
const Warning = require('../models/earlyWarning');

exports.getChart =  (req, res) => {
    const date = req.query.date;
    const label = req.query.label;
    const stationId = req.query.stationId;

    const key = [];
    let query;
    let addedAt;
    let start;
    let end;
    switch (label) {
		case 'Hari ini':
			start = new Date(date)
			start.setHours(0,0,0,0)

			end = new Date(date)
			end.setHours(23,59,59,999)
			
			addedAt = {addedAt: {$gte: start, $lt: end}}
			break;
		case 'Kemarin':
			start = new Date(date)
			start.setDate(start.getDate() -1)
			start.setHours(0,0,0,0)

			end = new Date(date)
			end.setDate(end.getDate() -1)
			end.setHours(23,59,59,999)
			
			addedAt = {addedAt: {$gte: start, $lt: end}}
			break;
		case '7 Hari terakhir':
			start = new Date(date)
			start.setDate(start.getDate() -7)
			start.setHours(0,0,0,0)

			addedAt = {addedAt: {$gte: start}}
			break;
		case '30 Hari terakhir':
			start = new Date(date)
			start.setDate(start.getDate()-30)
			start.setHours(0,0,0,0)

			addedAt = {addedAt: {$gte: start}}
			break;
		case 'Bulan ini':
			start = new Date(date)
			addedAt = {addedAt: {$gte: start}}
			break;
		case 'Per Hari':
			start = new Date(date)
			start.setHours(0,0,0,0)

			end = new Date(date)
			end.setHours(23,59,59,999)
			
			addedAt = {addedAt: {$gte: start, $lt: end}}
			break;
		case 'Per Bulan':
			start = new Date(date)
			addedAt = {addedAt: {$gte: start}}
			break;
		case 'Per Tahun':
			start = new Date(date)
			start.setHours(0,0,0,0)

			end = new Date(date)
			end.setMonth(11)
			end.setDate(31)
			end.setHours(23,59,59,999)

			addedAt = {addedAt:{$gte: start, $lt: end}}
			break;
	}
	if(req.query.segmentId) {
		const segmentId = mongoose.Types.ObjectId(req.query.segmentId)
		key.push({segmentId: segmentId});
	}
	if(stationId) {
		key.push({stationId: stationId})
	}
	if(key.length > 0) {
		key.push(addedAt)
		query = {$and: key}
	} else {
		query = addedAt
	}

    if(label !== 'Per Tahun') {
        const early = Warning.findOne()
        const loggers = Loggers.find(query)
        Promise.all([
            early,
            loggers
        ])
        .then(result => {
            res.status(200).json({
                early: result[0],
                loggers: result[1]
    
            });
        })
        .catch(err => {
            res.status(400).send(err);
        });
    }

    if(label == 'Per Tahun') {
        const early = Warning.findOne()
        const loggers = Loggers.aggregate([
            {$match: query},
				{$lookup: {
					from: 'stations',
					localField: 'stationId',
					foreignField: 'stationId',
					as: 'station'
				}},
				{$unwind: '$station'},
				{$group: {
					_id:{stationId:'$stationId', m: {$month: '$addedAt'}, d: {$dayOfMonth: '$addedAt'},  y: {$year: '$addedAt'}},
					addedAt: {$first: {$dateToString: {format: '%Y-%m-%d', date: '$addedAt'}}},
					station: {$first: '$station.name'},
					ph: {$avg: '$ph'},
					do: {$avg: '$do'},
					cond: {$avg: '$cond'},
					turb: {$avg: '$turb'},
					temp: {$avg: '$temp'},
					salt: {$avg: '$salt'},
					dept: {$avg: '$dept'},
				}},
				{$sort: {addedAt: -1}},
        ])

        Promise.all([
            early,
            loggers
        ])
        .then(result => {
            res.status(200).json({
                early: result[0],
                loggers: result[1]
    
            });  
        })
        .catch(err => {
            res.status(400).send(err);
        });
    }
}