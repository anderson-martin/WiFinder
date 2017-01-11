var request = require('request');
var apiOptions = {
    server: "http://localhost:3000"
};
if (process.env.NODE_ENV === "production") {
    apiOptions.server = "tranquil-island-41577.herokuapp.com";
}

var _showError = function (req, res, statusCode) {
    if (statusCode === 404) {
        res.render('generic-text', {
            title: "404, page not found"
            , content: "Oh dear. Looks like we can't find this page. Sorry"
        })
    }
    else {
        res.render('generic-text', {
            title: statusCode + "soomething gone wrong"
            , content: "Something somewhere gone wrong. Sorry"
        })
    }
};
/* Get 'Home' pages */
module.exports.homelist = function (req, res) {
    renderHomepage(req, res);
};
var renderHomepage = function (req, res) {

    res.render('locations-list', {
        title: 'Loc8r - find a place to work with wifi'
        , pageHeader: {
            title: 'Loc8r'
            , strapline: 'Find places to work with wifi near you'
        }
        , sidebar: 'Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you are looking for.'
    });
};
var getLocationInfo = function (req, res, callback) {
        var requestOptions, path, data;
        path = '/api/locations/' + req.params.locationid;
        requestOptions = {
            url: apiOptions.server + path
            , method: 'GET'
            , json: {}
        };
        request(requestOptions, function (err, HTTPresponse, responseBody) {
            data = responseBody;
            if (HTTPresponse.statusCode === 200) {
                data.coords = {
                    lng: responseBody.coords[0]
                    , lat: responseBody.coords[1]
                }
                callback(req, res, data);
            }
            else {
                _showError(req, res, HTTPresponse.statusCode);
            }
        });
    }
    /* Get 'Location info' pages */
module.exports.locationInfo = function (req, res) {
    //?? figure out what would be the result if u just put getLocationInfo(req, res, renderDetailPage(req, res, responseData))        
    getLocationInfo(req, res, function (req, res, responseData) {
        renderDetailPage(req, res, responseData);
    });
};
var renderDetailPage = function (req, res, locationData) {
    // for security reason, Google Token should be saved as an environmental variable named googletoken
    var token = process.env.googletoken;


        res.render('location-info', {
            title: locationData.name
            , pageHeader: {
                title: locationData.name
            }
            , sidebar: {
                context: locationData.name + ' is on Loc8r because it has accessible wifi and space to sit down with your laptop.'
                , callToAction: 'if you\'ve been and you like it - or if you dont\'t - please leave a review to help oother people.'
            }
            , location: locationData
            , token: token
        });
    }
    /* Get/see 'Add review' pages */
module.exports.addReview = function (req, res) {
    getLocationInfo(req, res, function (req, res, responseData) {
        renderReviewForm(req, res, responseData);
    });
};
var renderReviewForm = function (req, res, locDetails) {
    res.render('location-review-form', {
        title: "Review " + locDetails.name + " on Loc8r"
        , pageHeader: {
            title: 'Review ' + locDetails.name
        }
        , error: req.query.err
        , url: req.originalUrl
    });
};
/* POST a new review */
module.exports.doAddReview = function (req, res) {
    var locationid, requestOptions, path, postData;
    locationid = req.params.locationid;
    path = '/api/locations/' + locationid + '/reviews';
    postData = {
        'author': req.body.name
        , 'rating': parseInt(req.body.rating, 10)
        , 'reviewText': req.body.review
    };
    requestOptions = {
        url: apiOptions.server + path
        , method: 'POST'
        , json: postData
    };
    // ?? if any of this data is falsey, then it redirects. search more about falsey
    if (!postData.author || !postData.rating || !postData.reviewText) {
        res.redirect('/location/' + locationid + '/review/new?err=val');
    }
    else {
        request(requestOptions, function (err, HTTPresponse, responseBody) {
            if (HTTPresponse.statusCode === 201) {
                res.redirect('/location/' + locationid);
            }
            else if (HTTPresponse.statusCode === 400 && responseBody.name && responseBody.name === "ValidationError") {
                res.redirect('/location/' + locationid + '/review/new?err=val');
            }
            else {
                _showError(req, res, HTTPresponse);
            }
        });
    }
};