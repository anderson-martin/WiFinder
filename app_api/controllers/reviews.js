var mongoose = require('mongoose');
var Loc = mongoose.model('Location');
var sendJsonResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};
var updateAverageRating = function (locationid) {
    Loc.findById(locationid).select("rating reviews").exec(function (err, location) {
        if (err) {
            sendJsonResponse(res, 404, err);
        }
        else {
            doSetAverageRating(location);
        }
    });
};

var doSetAverageRating = function (location) {
    var i, reviewCount, ratingAverage, ratingTotal;
    if (location.reviews && location.reviews.length > 0) {
        ratingTotal = 0;
        reviewCount = location.reviews.length;
        for (i = 0; i < reviewCount; i++) {
            ratingTotal = ratingTotal + location.reviews[i].rating;
        }
        ratingAverage = parseInt(ratingTotal / reviewCount, 10);
        location.rating = ratingAverage;
        location.save(function (err, location) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("average rating updated to " + ratingAverage);
            }
        });
    }
};
var doAddReview = function (req, res, location) {
    if (!location) {
        sendJsonResponse(res, 404, {
            "message": "location id not found"
        });
    }
    else {
        location.reviews.push({
            author: req.body.author
            , rating: req.body.rating
            , reviewText: req.body.reviewText
        });
        location.save(function (err, location) {
            var thisReview;
            if (err) {
                sendJsonResponse(res, 400, err);
                console.log(err);
            }
            else {
                updateAverageRating(location._id);
                thisReview = location.reviews[location.reviews.length - 1];
                sendJsonResponse(res, 201, thisReview);
            }
        });
    }
};
module.exports.reviewsCreate = function (req, res) {

    var locationid = req.params.locationid;
    
    if (locationid) {
        Loc.findById(locationid).select('reviews').exec(function (err, location) {
            if (err) {                
                sendJsonResponse(res, 400, err);
                return;
            }
            else if (!location) {
                sendJsonResponse(res, 400, {
                    "message": "no such location found"
                });
                return;
            }

            doAddReview(req, res, location);
        });
    }
    else {

        sendJsonResponse(res, 404, {
            "message": "not found, location id required"
        });
    }
};
module.exports.reviewsReadOne = function (req, res) {
    if (req.params && req.params.locationid && req.params.reviewid) {
        var review, response;
        Loc.findById(req.params.locationid).select('name reviews').exec(function (err, location) {
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "locationid not found"
                });
                return;
            }
            else if (err) {
                sendJsonResponse(res, 404, err);
                return;
            }
            if (location.reviews && location.reviews.length > 0) {
                review = location.reviews.id(req.params.reviewid);
                if (!review) {
                    sendJsonResponse(res, 404, {
                        "message": "reviewid not found"
                    });
                    return;
                }
                response = {
                    location: {
                        name: location.name
                        , id: req.params.locationid
                    }
                    , review: review
                };
                sendJsonResponse(res, 200, response);
            }
            else {
                sendJsonResponse(res, 404, {
                    "message": "no review found"
                });
                return;
            }
        });
    }
    else {
        sendJsonResponse(res, 404, {
            "message": "Not found. Both review and location ids are required"
        });
        console.log("Not found. Both review and location ids are required");
    }
};
module.exports.reviewsUpdateOne = function (req, res) {
    if (req.params.reviewid && req.params.locationid) {
        var thisReveiew;
        Loc.findById(req.params.locationid).select("reviews").exec(function (err, location) {
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "no such location found"
                });
                return;
            }
            else if (err) {
                sendJsonResponse(res, 400, "number 1 " + err);
                return;
            }
            if ((location.reviews) && (location.reviews.length > 0)) {
                // finding subdocument
                thisReview = location.reviews.id(req.params.reviewid);
                if (!thisReview) {
                    sendJsonResponse(res, 404, {
                        "message": "no such review found"
                    });
                    return;
                }
                thisReview.author = req.body.author;
                thisReview.rating = req.body.rating;
                thisReview.reviewText = req.body.reviewText;
                location.save(function (err, location) {
                    if (err) {
                        sendJsonResponse(res, 400, err);
                    }
                    else {
                        updateAverageRating(location._id);
                        sendJsonResponse(res, 200, location)
                    }
                });
            }
            else {
                sendJsonResponse(res, 404, {
                    "message": "no review found"
                });
                return;
            }
        });
    }
    else {
        sendJsonResponse(res, 404, {
            "message": "both locationid and reviewi are required"
        });
        return;
    }
};
module.exports.reviewsDeleteOne = function (req, res) {
    var locationid, reviewid;
    if (!req.params.locationid || !req.params.reviewid) {
        sendJsonResponse(res, 404, {
            "message": "both locationid and reviewid are required"
        });
        return;
    }
    locationid = req.params.locationid;
    reviewid = req.params.reviewid;
    Loc.findById(locationid).select("reviews").exec(function (err, location) {
        if (err) {
            sendJsonResponse(res, 400, err);
            return;
        }
        else if (!location) {
            sendJsonResponse(res, 400, {
                "message": "no such location found"
            });
            return;
        }
        if (location.reviews && location.reviews.length > 0) {
            location.reviews.id(reviewid).remove();
            location.save(function (err, location) {
                if (err) {
                    sendJsonResponse(res, 400, err);
                    return;
                }
                sendJsonResponse(res, 204, {
                    "message": "review was deleted succesfully"
                });
                updateAverageRating(locationid);
            });
        }
        else {
            sendJsonResponse(res, 404, {
                "message": "no review found for this location"
            });
        }
    });
};