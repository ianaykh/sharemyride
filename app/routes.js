// Dependencies
var mongoose        = require('mongoose');
var User            = require('./data_model.js');





// Opens App Routes
module.exports = function(app) {
var duplicateUser;
    // GET Routes
    // --------------------------------------------------------
    // Retrieve records for all users in the db
    app.get('/user', function(req, res){

        // Uses Mongoose schema to run the search (empty conditions)
        var query = User.find({});
        query.exec(function(err, users){
            if(err) {
                res.send(err);
            } else {
                // If no errors are found, it responds with a JSON of all users
                res.json(users);
            }
        });
    });

    // POST Routes
    // --------------------------------------------------------
    // Provides method for saving new users in the db
    app.post('/user', function(req, res){
        // Creates a new User based on the Mongoose schema and the post bo.dy
       var query= User.find({$and:[{firstname:new RegExp(req.body.firstname,"i")},{lastname:new RegExp(req.body.lastname,"i")} ,{phone:req.body.phone}]});
       query.exec(function(err,users){
           
            if(err) {
                res.send(err);
            } else {
               
                 if(users.length==0) {
           
           var newuser = new User(req.body);
        
        
        newuser.save(function(err){
            if(err)
                res.send(err);
            else
               console.log("New User added : "+req.body.firstname +" "+req.body.lastname);
                res.json(req.body);
        });
       }
       else{
        
          res.status(400).send();
         
           console.log("This User Exists :"+ users);
            }
       }
               
       });
           
       
      
        
        
    });

    // Retrieves JSON records for all users who meet a certain set of query conditions
    app.post('/search', function(req, res){

        // Grab all of the query parameters from the body.
        var lat             = req.body.latitude;
        var long            = req.body.longitude;
        var distance        = req.body.distance;
        var male            = req.body.male;
        var female          = req.body.female;
        var other           = req.body.other;
        var minAge          = req.body.minAge;
        var maxAge          = req.body.maxAge;
        var carchoice       = req.body.carchoice;
        var reqVerified     = req.body.reqVerified;

        // Opens a generic Mongoose Query. Depending on the post body we will...
        var query = User.find({});
            
            
//        
        if(distance==null){
              distance=2;
        }
      
        
        if(distance){

            // Using MongoDB's geospatial querying features. (Note how coordinates are set [long, lat]
            query = query.where('location').near({ center: {type: 'Point', coordinates: [long, lat]},

                // Converting meters to miles. Specifying spherical geometry (for globe)
                maxDistance: distance * 1609.34, spherical: true});

        }

        // ...include filter by Gender (all options)
        if(male || female || other){
            query.or([{ 'gender': male }, { 'gender': female }, {'gender': other}]);
        }

        // ...include filter by Min Age
        if(minAge){
            query = query.where('age').gte(minAge);
        }

        // ...include filter by Max Age
        if(maxAge){
            query = query.where('age').lte(maxAge);
        }

       
        if(carchoice){
            query = query.where('carchoice').equals(carchoice);
        }

        // ...include filter for HTML5 Verified Locations
        if(reqVerified){
            query = query.where('htmlverified').equals("Location is verified");
        }

        // Execute Query and Return the Query Results
        query.exec(function(err, users){
            if(err)
                res.send(err);
            else
                // If no errors, respond with a JSON of all users that meet the criteria
                res.json(users);
        });
    });

    // DELETE Routes (Dev Only)
    // --------------------------------------------------------
    // Delete a User off the Map based on objID
    app.delete('/user/:objID', function(req, res){
        var objID = req.params.objID;
        var update = req.body;

        User.findByIdAndRemove(objID, update, function(err, user){
            if(err)
                res.send(err);
            else
                res.json(req.body);
        });
    });
};
