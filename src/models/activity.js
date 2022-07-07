const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
    chanel: {type: String},
    event: {type: String},
    message: {type: String},
}, {
    timestamps: true
})

module.exports = mongoose.model('Activity', ActivitySchema);