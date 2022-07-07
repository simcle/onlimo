const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StationSchema = new Schema({
    segmentId:  {type: Schema.Types.ObjectId, ref: 'Segment'},
    stationId: {type: String, index: true, unique: true},
    clientId: {type: String},
    name: {type: String},
    address: {type: String},
    image: {type:String},
    coordinates: {type: Array},
    logger: {type: String},
    sensor: {type: String},
    idpel: {type: String},
    sim: {type: String},
    status: {type: String}
}, {
    timestamps: true
});

module.exports = mongoose.model('Station', StationSchema);


