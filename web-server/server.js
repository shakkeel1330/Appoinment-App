const express = require('express');
const bodyParser = require('body-parser');
var moment = require('moment');
var passport = require('passport');
var session = require('express-session');
const CassandraStore = require("cassandra-store");
var appController = require('./appointmentAppController.js')
var gapi = require('./quickstart.js')
var cookieParser = require('cookie-parser');
var app = express();
var path = require('path')
app.use(express.static(path.join(__dirname, 'Public')));

require('./config/passport')(passport); // pass passport for configuration

// required for passport


app.use(express.static(__dirname + 'Public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));


var options = {
    "table": "sessions",
    "client": null,
    "clientOptions": {
        "contactPoints": [ "127.0.0.1" ],
        "keyspace": "appointment_app",
        "queryOptions": {
            "prepare": true
        }
    }
}



// From 'express-session'
app.use(session({ secret: 'secretkeysecret', key: 'user_sid', store: new CassandraStore(options), cookie: { expires: 600000 }, resave: false, saveUninitialized: false })); // session secret

// Initializes passportjs.
app.use(passport.initialize());

// Integrates passport with express-session.
app.use(passport.session()); // persistent login sessions
// app.use(session({
//     key: 'user_sid',
//     secret: 'somerandonstuffs',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         expires: 600000
//     }
// }));

// // This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// // This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
// app.use((req, res, next) => {
//     if (req.cookies.user_sid && !req.session.user) {
//         res.clearCookie('user_sid');
//     }
//     next();
// });



// var sessionChecker = (req, res, next) => {
//     if (req.session.user && req.cookies.user_sid) {
//         res.redirect('/members');
//     } else {
//         next();
//     }
// };


// app.get('/members', sessionChecker, (req, res) => {
//     res.redirect('/login');
// });


app.get('/#/', (req, res) => {
    // res.render('../index.html');
    res.clearCookie('user_sid');
    req.session.destroy();
})

app.get('/main',checkAuthentication,function(req,res){
    res.redirect("/main.html");
});

// app.get('/index2', (req, res) => {
//     res.render('index2.html');
// })

app.get('/logout', (req, res) => {
    if (req.cookies.user_sid) {
        res.clearCookie('user_sid');
        // req.session = null;
        req.session.destroy(function(err){
            
        });
        res.redirect('/');
       } 

    // req.logout();
    // res.redirect('/');
    // res.clearCookie('user_sid');
    // req.session.destroy();
    //  else {
    //     res.redirect('/');
    //     req.session.destroy();
    //     res.clearCookie('user_sid');
    // }
});





app.get('/appointmentInfo', (req, res) => {


    // appController.viewAll(function(err, result) {
    //     if (err) {
    //         console.log(err)
    //     }

    // res.json(result);
    // console.log(req.body);
    var startTime = moment().format();
    var endTime = moment().month(1).format();
    // gapi.authorize(JSON.parse(gapi.content), startTime, endTime, gapi.availability);
    gapi.availability(JSON.parse(gapi.content), startTime, endTime, function(freeBusy) {
        // console.log(freeBusy);
        res.json(freeBusy);
    });

});

app.post('/newAppointment', (req, res) => {

    // obj = { id: parseInt(req.body.id), start: new Date(req.body.start), end: new Date(req.body.end), doctorid: parseInt(req.body.doctorid), patientid: parseInt(req.body.patientid), schedule: req.body.schedule, status: req.body.status, venue: req.body.venue };
    // console.log(obj.end);
    // appController.addAppointment(obj, function(err, result) {
    //     if (err) {
    //         res.status(400)
    //             .send({
    //                 message: "Invalid input",
    //                 status: res.status
    //             })
    //     }
    //     res.json(result);
    // gapi.authorize(JSON.parse(gapi.content), obj.start, obj.end, gapi.bookSlot);
    // console.log("Appointment saved");
    // console.log(req.body.end);
    // console.log(req.body.start);
    gapi.bookSlot(JSON.parse(gapi.content), req.body.start, req.body.end);
    //alert('Appointment confirmed')

});

// app.post('/updateAppointment', (req, res) => {

//     obj = { id: parseInt(req.body.id), key: req.body.key, value: req.body.value };
//     appController.updateAppointment(obj, function(err, result) {
//         if (err) {
//             res.status(400)
//                 .send({
//                     message: "Invalid input",
//                     status: res.status
//                 })
//         }
//         res.json(result);
//         console.log("Appointment updated");
//     });
// });


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


app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// the callback after google has authenticated the user
app.get('/auth/google/callback',
    passport.authenticate('google', {
        // successRedirect: '/index2.html',
        successRedirect: '/main',
        failureRedirect: '/'
    }));

function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        //if user is logged in, req.isAuthenticated() will return true 
        next();
    } else{
        res.redirect("/");
    }
}


server_test = app.listen(8080, () => {
    console.log("Server is up on port 8080");
});

module.exports = server_test;

// $.get( "appointmentInfo", function( data ) {
//   $( ".result" ).html( data ); // insert fullCalendar function here.
//   alert( "Load was performed." );
// });