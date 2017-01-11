// I have required this file in app.js, right near the top, so the connection opens up early in the application's life

var mongoose = require('mongoose');
var gracefulShutdown;

// define database connection
var dbURI =  'mongodb://localhost/Loc8r';

//when NODE_ENV is set to production, Heroku can run this on production mode, in their servers
if (process.env.NODE_ENV === 'production'){

  //i defined my own variable as MONGOLAB_URI, to prevent exposing my credentials into public
  dbURI = process.env.MONGOLAB_URI;
}
mongoose.connect(dbURI);

//listen for Mongoose connection events

mongoose.connection.on('connected', function(){
  console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', function(err){
  console.log('Mongoose connection error ' + err);
});

mongoose.connection.on('disconnected', function(){
  console.log('Mongoose disconnected');
});

// reusable function to close Mongoose connection


gracefulShutdown =  function(msg, callback){
  mongoose.connection.close(function(){
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};



//listen to Node processes for termination or restart signals


// for nodemon restarts
process.once('SIGUSR2', function(){
  gracefulShutdown('nodemon restarts', function(){
    process.kill(process.pid, 'SIGUSR2');
  });
});

// for app termination
process.on('SIGNIN', function(){
  gracefulShutdown('app termination', function(){
  process.exit(0);
  });
});


// for Heroku app termination
process.on('SIGTERM', function(){
  gracefullShutdown('Heroku app sut down', function(){
  process.exit(0);
  });
});

require('./locations');
