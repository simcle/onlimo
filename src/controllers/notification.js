const Notifications = require('../models/notification');

exports.getNotifications = (req, res) => {
    const type =  req.query.type
    const notifications = Notifications.find({type: type}).sort({createdAt: -1}).limit(20)
    const warning = Notifications.find({$and: [{type: 'warning'},{isRead: false}]}).countDocuments()
    const activity = Notifications.find({$and: [{type: 'activity'}, {isRead: false}]}).countDocuments()

    Promise.all([
        notifications,
        warning, 
        activity
    ])
    .then(result => {
        res.status(200).json({
            notifications: result[0],
            warning: result[1],
            activity: result[2]
        })
    })
    .catch(err => {
        res.status(400).send(err)
    })
}

exports.putIsRead = (req, res) => {
    const type = req.body.type
    Notifications.updateMany({type: type}, {isRead: true})
    .then(() => {
        res.status(200).json('OK')
    })
    .catch(err => {
        res.status(400).send(err)
    })
}

exports.deletNotification = (req, res) => {
    Notifications.deleteMany()
    .then(() => {
        res.status(200).json('OK')
    })
    .catch(err => {
        res.status(400).send(err)
    })
}