const Notification  = require('../models/notification');
const pusher = require('./pusher');

exports.postNotification = async (type, content) => {
    const notification = new Notification({
        type: type,
        content: content,
        isRead: false
    })
    await notification.save()
    .then(result => {
        pusher.trigger('notification', result.type, {
            message: result
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err => {
        throw err
    })
}
