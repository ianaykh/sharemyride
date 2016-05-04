
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Creates a User Schema. This will be the basis of how user data is stored in the db
var Users_schema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: Number, required: true },
    car: [{ Name: { type: String, required: true }, capacity: { type: Number, required: true } }],
    passengers_info: [{ passenger_number: { type: Number } ,  passenger_pos: { type: String } }],
    location: { type: [Number], required: true }, // [Long, Lat]
    password: { type: String },
    htmlverified: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    phone: { type: Number, required: true }

});

// Users_schema.path('car').validate(function (car) {
//    if(!car){
//        return false;
//    }
//    else if(car.length==0){
//        return false;
//    }
//    return true;

// },'Car must have features.Please enter details again');

// Sets the created_at parameter equal to the current time
Users_schema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now
    }
    next();
});

// Indexes this schema in geoJSON format (critical for running proximity searches)
Users_schema.index({ location: '2dsphere' });

// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-user"
module.exports = mongoose.model('shareMyRide', Users_schema);
