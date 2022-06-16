const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SegmentSchema = new Schema({
    name: {type: String, unique: true, lowercase: true},
}, {
    timestamps: true
})

module.exports = mongoose.model('Segment', SegmentSchema);