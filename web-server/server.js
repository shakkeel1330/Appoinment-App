const express = require('express');
const bodyParser = require('body-parser');
var passport = require('passport')
var session = require('express-session')
var appController = require('./appointmentAppController.js')
var gapi = require('./quickstart.js')
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var path = require('path')
app.use(express.static(path.join(__dirname, 'Public')));

require('./config/passport')(passport); // pass passport for configuration

// required for passport
// app.use(session({ secret: 'secretkeysecret' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(express.static(__dirname + 'Public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));

// app.get('/login', (req, res) => {
//     res.render('login.html');

//     });
// });

// app.get('/', function(req, res) {
//     res.render('index.html');
// })

// app.get('/members',sessionChecker,)

app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});



var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/members');
    } else {
        next();
    }
};


app.get('/members', sessionChecker, (req, res) => {
    res.redirect('/login');
});


app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});


// app.get('/login', function(req, res) {
//     res.render('login.html');
// });



app.get('/appointmentInfo', (req, res) => {


    appController.viewAll(function(err, result) {
        if (err) {
            console.log(err)
        }

        res.json(result);
    });
});

app.post('/newAppointment', (req, res) => {

    obj = { id: parseInt(req.body.id), start: new Date(req.body.start), end: new Date(req.body.end), doctorid: parseInt(req.body.doctorid), patientid: parseInt(req.body.patientid), schedule: req.body.schedule, status: req.body.status, venue: req.body.venue };
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


app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// the callback after google has authenticated the user
app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/index2.html',
        failureRedirect: '/'
    }));



app.listen(8080, () => {
    console.log("Server is up on port 8080");
});