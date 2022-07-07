// STATION ACTIVITY LOG
const Stations = require('../models/stations');
const Activity = require('../models/activity');
const pusher = require('./pusher')

// CONECTED STATUS
module.exports.connectionStatus = (chanel, event, message, clientId) => {
    Stations.findOne({$or: [{stationId: chanel}, {clientId: clientId}]})
    .then(station => {
        station.clientId = clientId
        station.status = event
        return station.save()
    })
    .then(result => {
        pusher.trigger('notifications', 'activity', {
            message: result
        })
        const activity = new Activity({
            chanel: chanel,
            event: event,
            message: message
        })
        activity.save()
    })
}