const pusher = require('../modules/pusher')

exports.postPowerPump = (req, res) => {
    const power = req.body.power
    pusher.trigger("logger", "power", {
        message: power
    })
    .catch(err => {
      console.log(err);
    });
    res.status(200).json(power)
}