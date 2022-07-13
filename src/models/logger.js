const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoggerSchema = new Schema({
    segmentId: {type: Schema.Types.ObjectId},
    stationId: {type: String},
    status: {type: String},
    ph: {type: Number},
    do: {type: Number},
    cond: {type: Number},
    turb: {type: Number},
    temp: {type: Number},
    salt: {type: Number},
    dept: {type: Number},
    addedAt: {type: Date}
}, {
    timestamps: true
});

module.exports = mongoose.model('Logger', LoggerSchema);