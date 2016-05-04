// Dependencies
/// <reference path="typings/node/node.d.ts"/>
/// <reference path="typings/express/express.d.ts"/>
/// <reference path="typings/mongoose/mongoose.d.ts"/>
/// <reference path="typings/angularjs/angular.d.ts"/>
/// <reference path="typings/serve-static/serve-static.d.ts"/>
/// <reference path="typings/express-serve-static-core/express-serve-static-core.d.ts"/>
/// <reference path="typings/jquery/jquery.d.ts"/>
/// <reference path="typings/socket.io/socket.io.d.ts"/>


var express = require('express');
var mongoose = require('mongoose');
var port = process.env.PORT || 3000;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var methodOverride = require('method-override');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Express Configuration
// -----------------------------------------------------
// Sets the connection to MongoDB
mongoose.connect("mongodb://localhost:27017/DB1");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection failed'));
db.once('open', function () {

    console.log("Connection successfull- Connected to database");
});

app.use('/partials', express.static(path.join(__dirname, 'public/partials')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Logging and Parsing
app.use(express.static(__dirname + '/public'));                 // sets the static files location to public
app.use('/bower_components', express.static(__dirname + '/bower_components')); // Use BowerComponents
app.use(morgan('dev'));                                         // log with Morgan
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.urlencoded({ extended: true }));               // parse application/x-www-form-urlencoded
app.use(bodyParser.text());                                     // allows bodyParser to look at raw text
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));  // parse application/vnd.api+json as json
app.use(methodOverride());




// Routes
// ------------------------------------------------------
require('./app/routes.js')(app,io);
// Listen
// -------------------------------------------------------
http.listen(port);
console.log('App listening on port ' + port);