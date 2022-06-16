const EarlyWarning = require('../models/earlyWarning');

exports.getEarlyWarning = (req, res) => {
    EarlyWarning.findOne()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        res.status(400).send(err);
    });
};

exports.postEarlyWarning = (req, res) => {
    EarlyWarning.findOne()
    .then(early => {
        if(early) {
            early.maxPh= req.body.maxPh
            early.maxDo= req.body.maxDo
            early.maxCond= req.body.maxCond
            early.maxTurb= req.body.maxTurb
            early.maxTemp= req.body.maxTemp
            early.maxSalt= req.body.maxSalt
            early.maxDept= req.body.maxDept
            early.minPh= req.body.minPh
            early.minDo= req.body.minDo
            early.minCond= req.body.minCond
            early.minTurb= req.body.minTurb
            early.minTemp= req.body.minTemp
            early.minSalt= req.body.minSalt
            early.minDept= req.body.minDept  
            return early.save()
        } else {
            const earlyWarning = new EarlyWarning ({
                maxPh: req.body.maxPh,
                maxDo: req.body.maxDo,
                maxCond: req.body.maxCond,
                maxTurb: req.body.maxTurb,
                maxTemp: req.body.maxTemp,
                maxSalt: req.body.maxSalt,
                maxDept: req.body.maxDept,
                minPh: req.body.minPh,
                minDo: req.body.minDo,
                minCond: req.body.minCond,
                minTurb: req.body.minTurb,
                minTemp: req.body.minTemp,
                minSalt: req.body.minSalt,
                minDept: req.body.minDept,  
            })
            return earlyWarning.save()
        }
    })
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        res.status(400).send(err);
    });
};

