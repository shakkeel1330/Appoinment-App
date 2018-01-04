var Xcassandra = require('express-cassandra');
const express = require('express');

//require import {userProfile, userAccount, appointment} from '/appointmentAppModel.js'
var models = require('./appointmentAppModel');

exports.viewAll = function(callback) {
    models.appointment.find({}, { raw: true }, function(err, details) {
        callback(err, details);
    });
};



exports.addAppointment = function(obj, callback) {
    var newEntry = new models.appointment({ id: obj.id, start: obj.start, end: obj.end, doctorid: obj.doctorid, patientid: obj.patientid, schedule: obj.schedule, status: obj.status, venue: obj.venue });
    newEntry.save(function(err, result) {
        if (err) console.log(err);
        else console.log('Entry saved in DB');
        callback(err, newEntry)
    });

};



exports.updateAppointment = function(obj, callback) {
    var query_object = { id: obj.id };
    var update_values_object = { schedule: obj.schedule };
    // var options = {conditions: {email: 'typo@gmail.com'}};
    var updatedEntry = models.appointment.update(query_object, update_values_object, function(err, result) {
        if (err) console.log(err);
        else console.log('Entry updated');
        callback(err, result);
    });
};





exports.deleteAppointment = function(obj,callback) {

var query_object = {id: obj.id};
models.appointment.delete(query_object, function(err,result){
    if(err) console.log(err);
    else console.log('Appointment cancelled');
    callback(err,result)
});
};



