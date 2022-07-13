// STATION ACTIVITY LOG
const Stations = require('../models/stations');
const Activity = require('../models/activity');
const notification = require('../modules/notification');

// CONECTED STATUS
exports.connectionStatus = (chanel, event, message, clientId) => {
    Stations.findOne({$or: [{stationId: chanel}, {clientId: clientId}]})
    .then(station => {
        if(station) {
            station.clientId = clientId
            station.status = event
            return station.save()
        }
    })
    .then(result => {
        if(result) {
            const activity = new Activity({
                chanel: chanel,
                event: event,
                message: message
            })
            activity.save()
    
            let content = {
                name: result.name,
                event: event,
                message: message
            }
            notification.postNotification('activity', content)
        }
    })
};
