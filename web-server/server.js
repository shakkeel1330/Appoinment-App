const express = require('express');
const bodyParser = require('body-parser');
var appController = require('./appointmentAppController.js')
var gapi = require('./quickstart.js')
var app = express();
var path = require('path')
app.use(express.static(path.join(__dirname,  'Public')));
//app.use(express.static(__dirname + 'Public'))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));


app.get('/appointmentInfo', (req, res) => {


    appController.viewAll(function(err, result) {
        if (err) {
            console.log(err)
        }

        res.json(result);
    });
});

app.post('/newAppointment', (req, res) => {

    obj = { id: parseInt(req.body.id),start: new Date(req.body.start), end: new Date(req.body.end), doctorid: parseInt(req.body.doctorid), patientid: parseInt(req.body.patientid), schedule: req.body.schedule, status: req.body.status, venue: req.body.venue };
    console.log(obj.end);
    appController.addAppointment(obj, function(err, result) {
        if (err) {
            res.status(400)
                .send({
                    message: "Invalid input",
                    status: res.status
                })
        }
        res.json(result);
        gapi.authorize(JSON.parse(gapi.content), obj.start, obj.end, gapi.bookSlot);
        console.log("Appointment saved");
        
    })

});

app.post('/updateAppointment', (req, res) => {

    obj = { id: parseInt(req.body.id), key: req.body.key, value: req.body.value };
    appController.updateAppointment(obj, function(err, result) {
        if (err) {
            res.status(400)
                .send({
                    message: "Invalid input",
                    status: res.status
                })
        }
        res.json(result);
        console.log("Appointment updated");
    });
});


app.post('/cancelAppointment', (req, res) => {

    obj = { id: parseInt(req.body.id) };
    appController.deleteAppointment(obj, function(err, result) {
        if (err) {
            res.status(400)
                .send({
                    message: "Invalid input",
                    status: res.status
                })
        }
        res.json(result);
        console.log("Appointment cancelled");
    });
});


app.listen(3000, () => {
    console.log("Server is up on port 3000");
});