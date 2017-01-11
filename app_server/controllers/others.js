/* Get 'about' page */

module.exports.about = function(req, res){
  res.render('generic-text' , { title : 'About',
    content: ' WiFinder is a location aware RESTful serive. It finds the nearest WiFi hotspots around you.'   

  });
};
