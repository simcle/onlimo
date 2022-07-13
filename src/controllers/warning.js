const mongoose = require('mongoose');
const Warnings = require('../models/warning');
const EarlyWarning = require('../models/earlyWarning');
const Stations = require('../models/stations');
const notification = require('../modules/notification')

exports.getWarning = (req, res) => {
    const currentPage = req.query.page || 1;
    const perPage = req.query.perPage || 20;
    let totalItems;

    const sortKey = req.query.sortKey;
    const sortOrder = (req.query.sortOrder == 'desc') ? -1 : 1;

    const key = [];
    let query;
    let addedAt;
    const date = req.query.date
    const label = req.query.label
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
        const segmentId = mongoose.Types.ObjectId(req.query.segmentId);
        key.push({segmentId: segmentId})
    }
    const stationId = req.query.stationId
    const filter = req.query.filter
    const sensor = req.query.sensor
    if(stationId) {
        key.push({stationId: stationId})
    }
    if(filter !== 'semua' ) {
        key.push({threshold: filter})
    }
    if(sensor) {
        key.push({sensor: {$in: sensor}})
    }
    
    if(key.length > 0) {
        key.push(addedAt)
        query = {$and: key}
    } else {
        query = addedAt
    }

    Warnings.find(query)
    .countDocuments()
    .then(count => {
        totalItems = count;
        return Warnings.aggregate([
            {$match: query},
            {
                $lookup: {
                    from: 'stations',
                    localField: 'stationId',
                    foreignField: 'stationId',
                    as: "station"
                }
            },
            {
                $lookup: {
                    from: 'segments',
                    localField: 'segmentId',
                    foreignField: '_id',
                    as: 'segment'
                }
            },
            {$unwind: '$segment'},
            {$unwind: '$station'},
            {$sort: {[sortKey]: sortOrder}},
            {$skip: (currentPage -1) * perPage},
            {$limit: perPage},
            {$project: {
                segment: '$segment.name',
                station: '$station.name',
                addedAt: 1,
                description: 1,
                sensor: 1,
                threshold: 1,
                value: 1,
            }},
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

exports.postWarning = async (modbus) => {
    let warning = []
    const early = await EarlyWarning.findOne()
    // maximal
    if (early.maxPh > 0 && modbus.ph > early.maxPh) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai pH tidak sesuai ambang batas maksimal',threshold: 'max', sensor: 'pH', value: modbus.ph})   
    }
    if (early.maxDo > 0 && modbus.do > early.maxDo) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai DO tidak sesuai ambang batas maksimal',threshold: 'max', sensor: 'DO', value: modbus.do})   
    }
    if (early.maxCond > 0 && modbus.cond > early.maxCond) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai COND tidak sesuai ambang batas maksimal',threshold: 'max', sensor: 'COND', value: modbus.cond})   
    }
    if (early.maxTurb > 0 && modbus.turb > early.maxTurb) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai TURB tidak sesuai ambang batas maksimal',threshold: 'max', sensor: 'TURB', value: modbus.turb})   
    }
    if (early.maxTemp > 0 && modbus.temp > early.maxTemp) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai TEMP tidak sesuai ambang batas maksimal',threshold: 'max', sensor: 'TEMP', value: modbus.temp})   
    }
    if (early.maxSalt > 0 && modbus.salt > early.maxSalt) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai SALT tidak sesuai ambang batas maksimal',threshold: 'max', sensor: 'SALT', value: modbus.salt})   
    }
    if (early.maxDept > 0 && modbus.dept > early.maxDept) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai DEPT tidak sesuai ambang batas maksimal',threshold: 'max', sensor: 'DEPT', value: modbus.dept})   
    }

    // minimal
    if (early.minPh > 0 && modbus.ph < early.minPh) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai pH tidak sesuai ambang batas minimal',threshold: 'min', sensor: 'pH', value: modbus.ph})   
    }
    if (early.minDo > 0 && modbus.do < early.minDo) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai DO tidak sesuai ambang batas minimal',threshold: 'min', sensor: 'DO', value: modbus.do})   
    }
    if (early.minCond > 0 && modbus.cond < early.minCond) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai COND tidak sesuai ambang batas minimal',threshold: 'min', sensor: 'COND', value: modbus.cond})   
    }
    if (early.minTurb > 0 && modbus.turb < early.minTurb) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai TURB tidak sesuai ambang batas minimal',threshold: 'min', sensor: 'TURB', value: modbus.turb})   
    }
    if (early.minTemp > 0 && modbus.temp < early.minTemp) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai TEMP tidak sesuai ambang batas minimal',threshold: 'min', sensor: 'TEMP', value: modbus.temp})   
    }
    if (early.minSalt > 0 && modbus.salt < early.minSalt) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai SALT tidak sesuai ambang batas minimal',threshold: 'min', sensor: 'SALT', value: modbus.salt})   
    }
    if (early.minDept > 0 && modbus.dept < early.minDept) {
        warning.push({segmentId: modbus.segmentId, stationId: modbus.stationId, addedAt: modbus.addedAt, description: 'Nilai DEPT tidak sesuai ambang batas minimal',threshold: 'min', sensor: 'DEPT', value: modbus.dept})   
    }
    try {
        Warnings.insertMany(warning)
        .then(async (result) => {
            for(let res of result) {
                const station = await Stations.findOne({stationId: res.stationId})
                let content = {
                    name: station.name,
                    threshold: res.threshold,
                    description: res.description,
                    sensor: res.sensor,
                    value: res.value
                }
                await notification.postNotification('warning', content)
            }
        })
    } catch (error) {
        console.log(error);
    }
}
