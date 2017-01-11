angular.module('loc8rApp', []);
// formatting distance to a human readable format
var _isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};
var formatDistance = function () {
    return function (distance) {
        var numDistance, unit;
        console.log('till here has been done');
        if (distance && _isNumeric(distance)) {
            if (distance > 1000) {
                numDistance = (parseFloat(distance) / 1000).toFixed(1);
                unit = 'km';
            }
            else {
                numDistance = parseFloat(distance).toFixed();
                unit = 'm';
            }
            return numDistance + unit;
        }
        else {
            return "?";
        }
    };
}
var ratingStars = function () {
    return {
        scope: {
            thisRating: '=rating'
        }
        , templateUrl: "angular/rating-stars.html"
    };
};


var loc8rData = function ($http) {
    // u should pass arguments(like followings) to a service constructor via its methods. 
    var locationsByCoords = function (lat, lng) {
        return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=100000');
    };
    return {
        locationsByCoords: locationsByCoords
    };
};
var geolocation = function () {
    var getPosition = function (cbSuccess, cbError, cbNoGeo) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
        }
        else {
            cbNoGeo();
        }
    };
    return {
        getPosition: getPosition
    };
};
var locationsListCtrl = function ($scope, loc8rData, geolocation) {
    $scope.message = 'Trying to find your location';
    $scope.success = function (position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        $scope.message = "searching for data";
        loc8rData.locationsByCoords(lat, lng).success(function (retrievedData) {
            $scope.message = retrievedData.length > 0 ? "" : "No location found";
            $scope.data = {
                locations: retrievedData
            };
        }).error(function (e) {
            $scope.message = "sorry, something went wroong";
            console.log('this is error: ' + e);
        })
    };
    $scope.error = function (err) {
        $scope.$apply(function () {
            $scope.message = err.message;
        });
    };
    $scope.noGeo = function () {
        $scope.$apply(function () {
            $scope.message = "Your browser doesnt support Geolocation";
        });
    };
    geolocation.getPosition($scope.success, $scope.error, $scope.noGeo);
};


angular.module('loc8rApp').controller('locationsListCtrl', locationsListCtrl).filter('formatDistance', formatDistance).directive('ratingStars', ratingStars).service('loc8rData', loc8rData).service('geolocation', geolocation);