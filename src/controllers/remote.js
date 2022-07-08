const pusher = require('../modules/pusher')
exports.postPowerPump = (req, res) => {
    const power = req.body.power;
    const stationId = req.body.stationId;
    pusher.trigger(stationId, "power", {
        message: power
    })
    .catch(err => {
      console.log(err);
    });
    res.status(200).json(power)
}