// this page is just a scratch for my personal use, and doesnt have any impact on the application.




function error(err){console.log('got error: ' + err.code + ' : ' + err.message)};
function success(pos){console.log('success: ' +  pos.coords)};
navigator.geolocation.getCurrentPosition(success , error);



