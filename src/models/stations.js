const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StationSchema = new Schema({
    segmentId:  {type: Schema.Types.ObjectId, ref: 'Segment'},
    stationId: {type: String, index: true, unique: true},
    name: {type: String},
    address: {type: String},
    image: {type:String},
    coordinates: {type: Array},
    logger: {type: String},
    sensor: {type: String},
    status: {type: String}
}, {
    timestamps: true
});

module.exports = mongoose.model('Station', StationSchema);


