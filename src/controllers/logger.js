const Loggers = require('../models/logger');
const warning = require('../controllers/warning');
const excel = require('exceljs');
const mongoose = require('mongoose');

exports.getLogger = (req, res) => {
	const currentPage = req.query.page || 1;
	const perPage = req.query.perPage || 20;
	let totalItems;
	const key = [];
	let query;
	let addedAt;
	const date = req.query.date;
	const label = req.query.label;
	const filter = req.query.filter;
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
		key.push({segmentId: segmentId})
	}
	const stationId = req.query.stationId
	if(stationId) {
		key.push({stationId: stationId})
	}
	if(key.length > 0) {
		key.push(addedAt)
		query = {$and: key}
	} else {
		query = addedAt
	}
	if(filter == '1 Jam') {
		Loggers.find(query)
		.countDocuments()
		.then(count => {
			totalItems = count
			return Loggers.aggregate([
				{$match: query},
				{$lookup: {
					from: 'stations',
					localField: 'stationId',
					foreignField: 'stationId',
					as: 'station'
				}},
				{$lookup: {
					from: 'segments',
					localField: 'segmentId',
					foreignField: '_id',
					as: 'segment'
				}},
				{$unwind: '$station'},
				{$unwind: '$segment'},
				{$sort: {addedAt: -1}},
				{$skip: (currentPage -1) * perPage},
				{$limit: perPage},
				
				{$project: {
					segment: '$segment.name',
					station: '$station.name',
					addedAt: 1,
					ph: 1,
					do: 1,
					cond: 1,
					turb: 1,
					temp: 1,
					salt: 1,
					dept: 1,
				}}
			])
		})
		.then(result => {
			const last_page = Math.ceil(totalItems / perPage)
			res.status(200).json({
				data: result,
				pages: {
					current_page: currentPage,
					last_page: last_page
				}
			});
		})
		.catch(err => {
			res.status(400).send(err);
		});
	}
	// PER SATU HARI
	if(filter == '1 Hari') {
		Loggers.aggregate([
			{$match: query},
			{$group: {
				_id:{stationId:'$stationId', y: {$year: '$addedAt'}, m: {$month: '$addedAt'}, d: {$dayOfMonth: '$addedAt'}},
			}},
			{$count: 'stationId'}
		])
		.then(count => {
			totalItems = count[0].stationId;
			return Loggers.aggregate([
				{$match: query},
				{$lookup: {
					from: 'stations',
					localField: 'stationId',
					foreignField: 'stationId',
					as: 'station'
				}},
				{$lookup: {
					from: 'segments',
					localField: 'segmentId',
					foreignField: '_id',
					as: 'segment'
				}},
				{$unwind: '$segment'},
				{$unwind: '$station'},
				{$group: {
					_id:{stationId:'$stationId', m: {$month: '$addedAt'}, d: {$dayOfMonth: '$addedAt'},  y: {$year: '$addedAt'}},
					addedAt: {$first: {$dateToString: {format: '%Y-%m-%d', date: '$addedAt'}}},
					segment: {$first: '$segment.name'},
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
				{$skip: (currentPage -1) * perPage},
				{$limit: perPage},
			])
		})
		.then(result => {
			const last_page = Math.ceil(totalItems / perPage)
			res.status(200).json({
				data: result,
				pages: {
					current_page: currentPage,
					last_page: last_page
				}
			});
		})
		.catch(err => {
			console.log(err)
			res.status(400).send(err);
		});
	}
};

exports.download = (req, res) => {
	let workbook = new excel.Workbook()
	let worksheet = workbook.addWorksheet('loggers')
	worksheet.columns = [
		{key: 'addedAt', width: 25},
		{key: 'station', width: 25},
		{key: 'ph',  width: 10},
		{key: 'do',  width: 10},
		{key: 'turb',  width: 10},
		{key: 'salt',  width: 10},
		{key: 'cond',  width: 10},
		{key: 'dept', width: 10},
		{key: 'temp', width: 10},
	]
	const key = [];
	let query;
	let addedAt;
	const date = req.query.date;
	const label = req.query.label;
	const filter = req.query.filter;
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
		key.push({segmentId: segmentId})
	}
	const segment = req.query.segmentName
	const stationId = req.query.stationId
	const station = req.query.station
	if(stationId) {
		key.push({stationId: stationId})
	}
	if(key.length > 0) {
		key.push(addedAt)
		query = {$and: key}
	} else {
		query = addedAt
	}
	worksheet.getRow(1).values = [label, segment, station, 'Per '+filter]
	if(filter == '1 Jam') {
		Loggers.aggregate([
			{$match: query},
			{$lookup: {
				from: 'stations',
				localField: 'stationId',
				foreignField: 'stationId',
				as: 'station'
			}},
			{$unwind: '$station'},
			{$sort: {addedAt: -1}},
			{$project: {
				station: '$station.name',
				addedAt: {$dateToString: {format: '%d-%m %H:%M:%S%Z', date: '$addedAt', timezone: '+07:00'}},
				ph: 1,
				do: 1,
				turb: 1,
				salt: 1,
				cond: 1,
				dept: 1,
				temp: 1,
			}}
		])
		.then(async result => {
			worksheet.getRow(3).values = ['Tanggal', 'Nama Stasiun', 'pH', 'DO', 'TURB','SALT', 'COND', 'DEPT', 'TEMP']
			worksheet.addRows(result)
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			);
			res.setHeader(
				"Content-Disposition",
				"attachment; filename=" + "tutorials.xlsx"
			);
			await workbook.xlsx.write(res);
			res.status(200).end();
		})
	}
	if(filter == '1 Hari') {
		Loggers.aggregate([
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
					addedAt: {$first: {$dateToString: {format: '%d-%m-%Y', date: '$addedAt'}}},
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
		.then(async result => {
			worksheet.getColumn('C').numFmt = '0.00'
			worksheet.getColumn('D').numFmt = '0.00'
			worksheet.getColumn('E').numFmt = '0.00'
			worksheet.getColumn('F').numFmt = '0.00'
			worksheet.getColumn('G').numFmt = '0.00'
			worksheet.getColumn('H').numFmt = '0.00'
			worksheet.getColumn('I').numFmt = '0.00'
			worksheet.getRow(3).values = ['Tanggal', 'Stasiun', 'pH', 'DO', 'TURB','SALT', 'COND', 'DEPT', 'TEMP']
			worksheet.addRows(result)
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			);
			res.setHeader(
				"Content-Disposition",
				"attachment; filename=" + "tutorials.xlsx"
			);
			await workbook.xlsx.write(res);
			res.status(200).end();
		})
	}
},

exports.postLogger = (req, res) => {
	const stationId = req.user.stationId
	
	const logger = new Loggers({
		segmentId: req.user.segmentId, 
		stationId: req.user.stationId,
		ph: req.body.ph,
		do: req.body.do,
		cond: req.body.cond,
		turb: req.body.turb,
		temp: req.body.temp,
		salt: req.body.salt,
		dept: req.body.dept,
		addedAt: req.body.addedAt
	})
	logger.save()
	.then(result => {
		warning.postWarning(result);
		res.status(200).json('OK');
	})
	.catch(err => {
		res.status(400).send(err);
	});
}