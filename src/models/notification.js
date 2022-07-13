const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    type: {type: String},
    content: {type: Object},
    isRead: {type: Boolean}
}, {
    timestamps: true
})

module.exports = mongoose.model('Notification', notificationSchema);