var request = require('request');
var apiOptions = {
    server: "http://localhost:3000"
    
};
if (process.env.NODE_ENV === "production") {
    apiOptions.server = "http://wifinder-v1-1.herokuapp.com";
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
        title: 'WiFinder - find nearby WiFi hotspots'
        , pageHeader: {
            title: 'WiFinder'
            , strapline: 'Now WiFi hootspot is more accessible'
        }
        , sidebar: ' WiFinder helps you to find nearby hotspots'
    });
};
var getLocationInfo = function (req, res, callback) {
        console.log('till here has been done - three');
        var requestOptions, path, data;
        path = '/api/locations/' + req.params.locationid;
        requestOptions = {
            url: apiOptions.server + path
            , method: 'GET'
            , json: {}
            
        };
        console.log('4 - this is the url = ' + apiOptions.server + path);
        request(requestOptions, function (err, HTTPresponse, responseBody) {
            console.log('5- this is error: ' + err)
            console.log('6 - this is the HTTPresponse=' + HTTPresponse);
            console.log('7 - this is the responseBody=' + responseBody);
            data = responseBody;
            if (HTTPresponse.statusCode === 200) {
                data.coords = {
                    lng: responseBody.coords[0]
                    , lat: responseBody.coords[1]
                }
                callback(req, res, data);
            }
            else {
                console.log('7 - this is the HTTPresponse=' + HTTPresponse);
                _showError(req, res, HTTPresponse.statusCode);
            }
        });
    }
    /* Get 'Location info' pages */
module.exports.locationInfo = function (req, res) {
    console.log('till here has been done - one');
    getLocationInfo(req, res, function (req, res, responseData) {
        console.log('till here has been done - two');
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
                context: locationData.name + ' is on WiFinder because it proovides free WiFi foor public!'
                , callToAction: 'if you\'ve been here, please make a reivew.'
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
        title: "Review " + locDetails.name + " on WiFinder"
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