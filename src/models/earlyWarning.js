const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EarlyWarningSchema = new Schema({
    maxPh: {type: Number},
    maxDo: {type: Number},
    maxCond: {type: Number},
    maxTurb: {type: Number},
    maxTemp: {type: Number},
    maxSalt: {type: Number},
    maxDept: {type: Number},
    minPh: {type: Number},
    minDo: {type: Number},
    minCond: {type: Number},
    minTurb: {type: Number},
    minTemp: {type: Number},
    minSalt: {type: Number},
    minDept: {type: Number},
}, {
    timestamps: true
});
const model = mongoose.model('earlyWarning', EarlyWarningSchema)
model.find()
.then(res => {
    if(res.length < 1) {
        const doc = new model ({
            maxPh: 0,
            maxDo: 0,
            maxCond: 0,
            maxTurb: 0,
            maxTemp: 0,
            maxSalt: 0,
            maxDept: 0,
            minPh: 0,
            minDo: 0,
            minCond: 0,
            minTurb: 0,
            minTemp: 0,
            minSalt: 0,
            minDept: 0,
        })
        doc.save()
    }
})

module.exports = model
