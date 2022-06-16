const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WarningSchema = new Schema({
    segmentId: {type: Schema.Types.ObjectId},
    stationId: {type: String},
    addedAt: {type: Date},
    description: {type: String},
    sensor: {type: String},
    threshold: {type: String},
    value: {type: Number}
}, {
    timestamps: true
});

module.exports = mongoose.model('Warning', WarningSchema);