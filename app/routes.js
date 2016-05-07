// Dependencies
var mongoose = require('mongoose');
var User = require('./data_model.js');
var textbelt = require('textbelt');
// Opens App Routes
module.exports = function (app, io) {
    var duplicateUser;
    // GET Routes
    // --------------------------------------------------------
    // Retrieve records for all users in the db

    app.put('/deleteposition/:id', function (req, res, next) {
        var passengerpickedup = req.body.passenger_pos;
        var pnum = req.body.passenger_number;
        var pid = req.body._id;
        var did = req.params.id;

        var query = User.findByIdAndUpdate({ _id: did }, { $pull: { "passengers_info": { "_id": pid, "passenger_number": pnum, "passenger_pos": passengerpickedup } } });

        query.exec(function (err, users) {
            if (err) {
                res.send(err);
            }
            else {
                console.log("passenger picked up at " + passengerpickedup);
                // textbelt(pnum.toString(), 'Please confirm ,your driver is' + users._doc.firstname + ' ' + users._doc.lastname + ',with phone number: ' + users._doc.phone, function (err) {
                //     if(err)
                //     console.log(err);
                //     else
                //      console.log("message sent to passenger "+pnum +" to confirm driver details for "+ users._doc.firstname + ' ' + users._doc.lastname +" with phone number "+users._doc.phone);
                // });
                //  textbelt(users._doc.phone.toString(), 'Please confirm ,your passenger is at' + passengerpickedup +',with phone number: ' + pnum, function (err) {
                //    if(err)
                //     console.log(err);
                //     else
                //     console.log("message sent to driver "+users._doc.phone+" to confirm passenger details for "+ passengerpickedup +" with phone number "+pnum);
                // });

                io.emit("delete:passenger", { pass_id: pid, driverdata: users });
                res.json(users);
                next();
            }
        });
    });



    app.get('/user', function (req, res, next) {

        // Uses Mongoose schema to run the search (empty conditions)
        var query = User.find({});
        query.exec(function (err, users) {
            if (err) {
                res.send(err);
            } else {
                // If no errors are found, it responds with a JSON of all users
                res.json(users);
                next();
            }
        });
    });

    app.get('/driverlogin', function (req, res, next) {
        var query = User.findOne({ "password": req.query.password, "phone": req.query.phone });
        query.exec(function (err, users) {
            if (err) {
                console.log(err);
                res.send(err);
            }
            else if (users == null) {
                console.log("You are not registered as a driver");
                res.send("no");
            }
            else {
                console.log("this person has logged in " + users._doc.firstname + " " + users._doc.lastname);
                var phonenumber = users._doc.phone.toString();
                // textbelt(phonenumber, users._doc.firstname + ' ' + users._doc.lastname + ' has signed in.Please see your logiin portal for passenger requests', function (err) {
                //     if(err)
                //     console.log(err);
                //     else
                //     console.log("Login message sent to "+users._doc.firstname+ ' ' + users._doc.lastname);
                // });
                res.json(users);
                next();
            }
        });

    });

    app.put('/update', function (req, res, next) {

        var findquery = User.find({ "passengers_info.passenger_number": req.body.passphone }, { "passengers_info.passenger_pos": req.body.address });

        var passengerphone = req.body.passphone;
        var passengeraddress = req.body.address;

        findquery.exec(function (err, users) {
            if (err) {
                console.log("Not a duplicate user");

                res.send(err);
            }
            else {

                if (users == 0) {
                    var query = User.findByIdAndUpdate({ _id: req.body.driver._id }, { $addToSet: { "passengers_info": { "passenger_number": req.body.passphone, "passenger_pos": req.body.address } } }, { "passengers_info._id": 1 });

                    query.exec(function (err, users) {
                        if (err) {
                            console.log("couldn't update the count check log for details");

                            res.send(err);
                        }
                        else {

                            var findpassid = User.find({ "passengers_info.passenger_number": req.body.passphone, "passengers_info.passenger_pos": req.body.address }, { "passengers_info._id": 1 });
                            findpassid.exec(function (err, myusers) {
                                if (err) {
                                    res.send(err);
                                }
                                else {

                                    data_inserted = { p_p: passengerphone, p_a: passengeraddress, id: myusers[0]._doc._id };

                                    // textbelt(users._doc.phone.toString(), 'New passenger request ! Please route your vehicle to ' + passengeraddress + '.You can contact the passenger at ' + passengerphone, function (err) {
                                    //     if(err)
                                    //     console.log(err);
                                    //     else
                                    //     console.log('New passenger request ! Please route your vehicle to ' + passengeraddress + '.You can contact the passenger at ' + passengerphone);
                                    // });
                                    //  textbelt(passengerphone.toString(), 'The driver has received your message and will be calling you shortly ! Please confirm the driver is ' + users._doc.firstname+' '+users._doc.lastname + '.You can contact the driver at ' +users._doc.phone , function (err) {
                                    //     if(err)
                                    //     console.log(err);
                                    //     else
                                    //     console.log('The driver has received your message and will be calling you shortly ! Please confirm the driver is ' + users._doc.firstname+' '+users._doc.lastname + '.You can contact the driver at ' +users._doc.phone);
                                    // });
                                    io.emit("addpassenger", { data: data_inserted, driverdata: users });
                                    res.json(users);
                                    next();
                                }
                            });

                        }

                    });
                }
                else {
                    //
                    var query = User.findById({ _id: users[0]._doc._id });
                    query.exec(function (err, driver) {
                        if (err) {


                            res.send(err);
                        }
                        else {

                            duplicateUser = { ddata: driver._doc, updated: "no" };
                            // textbelt(passengerphone.toString(),'Your request has already been handled. '+driver._doc.firstname+' '+driver._doc.lastname+ ' has received your message and will be at your location shortly ! Please stay at your location ', function (err) {
                            //             console.log(err);
                            //         });
                            res.json(duplicateUser);
                            
                            console.log("passenger has already a requested ride with " + driver._doc.firstname);
                            next();
                        }
                    });


                }

            }



        });
    });

    // POST Routes
    // --------------------------------------------------------
    // Provides method for saving new users in the db
    app.post('/user', function (req, res) {
        // Creates a new User based on the Mongoose schema and the post bo.dy
        var query = User.find({ $and: [{ firstname: new RegExp(req.body.firstname, "i") }, { lastname: new RegExp(req.body.lastname, "i") }, { phone: req.body.phone }] });
        query.exec(function (err, users) {

            if (err) {
                res.send(err);
            } else {

                if (users.length == 0) {

                    var newuser = new User(req.body);


                    newuser.save(function (err) {
                        if (err)
                            res.send(err);
                        else
                            console.log("New User added : " + req.body.firstname + " " + req.body.lastname);
                        res.json(req.body);
                    });
                }
                else {

                    res.status(400).send();

                    console.log("This User Exists :" + users);
                }
            }

        });





    });

    // Retrieves JSON records for all users who meet a certain set of query conditions
    app.post('/search', function (req, res, next) {

        // Grab all of the query parameters from the body.
        var lat = req.body.latitude;
        var long = req.body.longitude;
        var distance = req.body.distance;
        var male = req.body.male;
        var female = req.body.female;
        var other = req.body.other;
        var minAge = req.body.minAge;
        var maxAge = req.body.maxAge;
        var carchoice = req.body.carchoice;
        var reqVerified = req.body.reqVerified;

        // Opens a generic Mongoose Query. Depending on the post body we will...
        var query = User.find({});


        //        
        if (distance == null) {
            distance = 2;
        }


        if (distance) {

            // Using MongoDB's geospatial querying features. (Note how coordinates are set [long, lat]
            query = query.where('location').near({
                center: { type: 'Point', coordinates: [long, lat] },

                // Converting meters to miles. Specifying spherical geometry (for globe)
                maxDistance: distance * 1609.34, spherical: true
            });

        }

        // ...include filter by Gender (all options)
        if (male || female || other) {
            query.or([{ 'gender': male }, { 'gender': female }, { 'gender': other }]);
        }

        // ...include filter by Min Age
        if (minAge) {
            query = query.where('age').gte(minAge);
        }

        // ...include filter by Max Age
        if (maxAge) {
            query = query.where('age').lte(maxAge);
        }


        if (carchoice) {
            query = query.where('carchoice').equals(carchoice);
        }

        // ...include filter for HTML5 Verified Locations
        if (reqVerified) {
            query = query.where('htmlverified').equals("Location is verified");
        }

        // Execute Query and Return the Query Results
        query.exec(function (err, users) {
            if (err)
                res.send(err);
            else
                // If no errors, respond with a JSON of all users that meet the criteria
                res.json(users);
            next();
        });

    });
    
};
