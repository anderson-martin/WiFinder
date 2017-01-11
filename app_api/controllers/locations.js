var mongoose = require('mongoose');
var Loc = mongoose.model('Location');


var sendJsonResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};
var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};
module.exports.locationsListByDistance = function (req, res) {
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var maxDistance = parseFloat(req.query.maxDistance);

    if ((!lng && lng !== 0) || (!lat && lat !== 0)) {
        sendJsonResponse(res, 404, {
            "message": "lang and lat query parameters are required"
        });
    }
    var point = {
        type: "Point"
        , coordinates: [lng, lat]
    };
    var options = {
        spherical: true, 
        maxDistance: maxDistance
        , num: 10
    };
    Loc.geoNear(point, options, function (err, results, stats) {
        var locations = [];
        if (err) {
            sendJsonResponse(res, 404, err);
            console.log("following error was caught " + err);
        }
        else {
            results.forEach(function (doc) {
                locations.push({
                    distance: doc.dis
                    , name: doc.obj.name
                    , address: doc.obj.address
                    , rating: doc.obj.rating
                    , facilities: doc.obj.facilities
                    , _id: doc.obj._id
                });
            });
            sendJsonResponse(res, 200, locations);
        }
    });
};
module.exports.locationsCreate = function (req, res) {
    
    Loc.create({
        name: req.body.name
        , address: req.body.address
        , facilities: req.body.facilities.split(",")
        , coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)], 
        openingTimes: [{
            days: req.body.days1
            , opening: req.body.opening1
            , closing: req.body.closing1
            , closed: req.body.closed1
    }, {
            days: req.body.days2
            , opening: req.body.opening2
            , closing: req.body.closing2
            , closed: req.body.closed2
    }]
    }, function (err, location) {
        if (err) {
            sendJsonResponse(res, 400, err);
            console.log("error is " + err);
        }
        else {
            sendJsonResponse(res, 201, location);
        }
    });
};
module.exports.locationsReadOne = function (req, res) {
    if (req.params && req.params.locationid) {
        Loc.findById(req.params.locationid).exec(function (err, location) {
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "locationid not found"
                });
                return;
            }
            else if (err) {
                sendJsonResponse(res, 404, err);
                console.log("there was following error: " + err);
                return;
            }
            sendJsonResponse(res, 200, location);
        });
    }
    else {
        sendJsonResponse(res, 404, {
            "message": "no location id in request"
        });
        console.log("no location id in request");
    }
};
module.exports.locationsUpdateOne = function (req, res) {
    if (!req.params.locationid) {
        sendJsonResponse(res, 404, {
            "message": "locationid not found"
        });
        return;
    }
    Loc.findById(req.params.locationid)
        // doesnt select (and retrieve) followings, as we we will update them in another controller function
        .select('-reviews -rating').exec(function (err, location) {
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "locationid not found"
                });
                return;
            }
            else if (err) {
                sendJsonResponse(res, 400, "error number 1: " + err);
                return;
            }
            location.name = req.body.name;
            location.address = req.body.address;
            location.facilities = req.body.facilities.split(",");
            location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
            location.openingTimes = [{
                days: req.body.days1
                , opening: req.body.opening1
                , closing: req.body.closing1
                , closed: req.body.closed1
       }, {
                days: req.body.days2
                , opening: req.body.opening2
                , closing: req.body.closing2
                , closed: req.body.closed2
       }];
            location.save(function (err, location) {
                if (err) {
                    sendJsonResponse(res, 404, "error number 2: " + err)
                }
                else {
                    sendJsonResponse(res, 200, location)
                }
            });
        });
};
module.exports.locationsDeleteOne = function (req, res) {
    var locationid = req.params.locationid;
    if (!locationid) {
        sendJsonResponse(res, 404, {
            "message": "no locationid found"
        });
        return;
    }
    Loc.findByIdAndRemove(locationid).exec(function (err, location) {
        if (err) {
            sendJsonResponse(res, 404, err);
            return;
        }
        sendJsonResponse(res, 204, {
            "message": "loocation was deleted successfully"
        });
    });
};