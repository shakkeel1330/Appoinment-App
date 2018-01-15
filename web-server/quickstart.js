var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var moment = require('moment');
const { DateTime } = require('luxon');


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (__dirname) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    exports.content = content;
    // Authorize a client with the loaded credentials, then call the
    // Google Calendar API.
    // authorize(JSON.parse(content), start, end, bookSlot);
    // authorize(JSON.parse(content), listEvents);
    // authorize(JSON.parse(content), availability);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
// exports.authorize = function authorize(credentials,start, end, callback) {
//     console.log("Authorize triggered")
//     var clientSecret = credentials.installed.client_secret;
//     var clientId = credentials.installed.client_id;
//     var redirectUrl = credentials.installed.redirect_uris[0];
//     var auth = new googleAuth();
//     var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

//     // Check if we have previously stored a token.
//     fs.readFile(TOKEN_PATH, function(err, token) {
//         if (err) {
//             getNewToken(oauth2Client, callback);
//         } else {
//             oauth2Client.credentials = JSON.parse(token);
//             callback(oauth2Client, start, end);
//         }
//     });
// }

function authorize(credentials, callback) {
    console.log("Authorize triggered")
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
    var calendar = google.calendar('v3');
    calendar.events.list({
        auth: auth,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var events = response.items;
        if (events.length == 0) {
            console.log('No upcoming events found.');
        } else {
            console.log('Upcoming 10 events:');
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var start = event.start.dateTime || event.start.date;
                console.log('%s - %s', start, event.summary);
            }
        }
    });
}

function createEvents(auth, start, end) {
    var calendar = google.calendar('v3');
    calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: {
            summary: "Slot booked",
            "end": {
                'dateTime': moment(end).format()
            },
            "start": {
                'dateTime': moment(start).format()
            }
        }

    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log('Slot booked');
    })
}



exports.availability = function availability(content, start, end, callback) {
    authorize(content, function(auth) {


        var calendar = google.calendar('v3');
        calendar.freebusy.query({
                auth: auth,
                resource: {
                    "timeMin": start,
                    "timeMax": end,
                    "timeZone": "Asia/Calcutta",
                    "items": [{
                        "id": "primary"
                    }]
                }

            },
            function(err, response) {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                }
                // if(response.calendars.primary.busy != 0)
                // {
                //     console.log(response.calendars.primary.busy);

                // }
                // else{console.log("Empty")}

                callback(response.calendars.primary.busy);
            });
    });
}


exports.bookSlot = function bookSlot(content, start, end) {
    authorize(content, function(auth) {
    var calendar = google.calendar('v3');
    // var inputDateTimeStart = moment("2018-01-27 19:15");
    //var start = moment(start);
    // var inputDateTimeEnd = moment("2018-01-27 19:50");
    //var end = moment(end);

    // availability(auth, start, end, function(dateobj) {

    //     if (dateobj != 0) {
    //         console.log("Slot already booked from : ")
    //         console.log(dateobj);
    //     } else {
    //         console.log("Slot availabile");
    //         createEvents(auth, start, end);
    //     }

    // })

    createEvents(auth, start, end);
});
};



// exports.availability = function availability(auth, start, end, callback) {

// var calendar = google.calendar('v3');
//         calendar.freebusy.query({
//                 auth: auth,
//                 resource: {
//                     "timeMin": start,
//                     "timeMax": end,
//                     "timeZone": "Asia/Calcutta",
//                     "items": [{
//                         "id": "primary"
//                     }]
//                 }

//             },
//             function(err, response) {
//                 if (err) {
//                     console.log('The API returned an error: ' + err);
//                     return;
//                 }
//                 // if(response.calendars.primary.busy != 0)
//                 // {
//                 //     console.log(response.calendars.primary.busy);

//                 // }
//                 // else{console.log("Empty")}

//                 callback(response.calendars.primary.busy);
//             });
//     }



// for (var i = dateobj.length - 1; i >= 0; i--) {

//     if (inputDateTimeStart.format("MMM Do YY") == moment(dateobj[i].start).format("MMM Do YY")) {
//         // console.log(moment(dateobj[i].end).format("h:mm:ss") )
//         // console.log(inputDateTimeStart.format("h:mm:ss") <= moment(dateobj[i].start).format("h:mm:ss") || inputDateTimeEnd.format("h:mm:ss") >= moment(dateobj[i].end).format("h:mm:ss"))

//         if (
//           ((inputDateTimeStart.format() < moment(dateobj[i].start).format()) && (inputDateTimeEnd.format() < moment(dateobj[i].start).format())) ||
//           ((inputDateTimeStart.format() > moment(dateobj[i].end).format()) && (inputDateTimeEnd.format() > moment(dateobj[i].end).format()))
//         ) {
//             var message = "Slot availabile"
//             console.log(message);
//             createEvents(auth, inputDateTimeStart, inputDateTimeEnd)

//         }
//     }
// }
// if (message != "Slot availabile") {
//             var bookedSlotStart = moment(dateobj[i].start).format("hh:mm:ss a");
//             var bookedSlotEnd = moment(dateobj[i].end).format("hh:mm:ss a");
//     console.log("Slot already booked");
//     console.log("Slot booked from : " + bookedSlotStart + " to " + bookedSlotEnd);
// } else {

// }


//       console.log(inputDateTimeStart.format("h:mm:ss"))
//          console.log(moment(dateobj[i].start).format("h:mm:ss"))
//          console.log("")
//          console.log(inputDateTimeStart.format("h:mm:ss") <= moment(dateobj[i].start).format("h:mm:ss"))
// console.log(inputDateTimeStart.format() <= moment(dateobj[i].start).format() && inputDateTimeEnd.format() >= moment(dateobj[i].end).format())


// var calendar = google.calendar('v3');
// var resource = {
//   "summary": "Slot booked",
//   "start": {
//     "dateTime": "2018-01-04T10:00:00.000-07:00"
//   },
//   "end": {
//     "dateTime": "2018-01-05T10:25:00.000-07:00"
//     }
//   };
// var request = calendar.events.insert({
//   'calendarId': 'primary',
//   'resource': resource
// });
// request.execute(function(resp) {
//   console.log(resp);
// });

// var event = {
//   'summary': 'Google I/O 2015',
//   'location': '800 Howard St., San Francisco, CA 94103',
//   'description': 'A chance to hear more about Google\'s developer products.',
//   'start': {
//     'dateTime': '2015-05-28T09:00:00-07:00',
//     'timeZone': 'America/Los_Angeles'
//   },
//   'end': {
//     'dateTime': '2015-05-28T17:00:00-07:00',
//     'timeZone': 'America/Los_Angeles'
//   },
// };

// var request = gapi.client.calendar.events.insert({
//   'calendarId': 'primary',
//   'resource': event
// });

// request.execute(function(event) {
//   appendPre('Event created: ' + event.htmlLink);
// });

// if (inputDateTimeStart.format("MMM Do YY") == moment(dateobj[i].start).format("MMM Do YY")) {
//     // console.log(moment(dateobj[i].end).format("h:mm:ss") )
//     // console.log(inputDateTimeStart.format("h:mm:ss") <= moment(dateobj[i].start).format("h:mm:ss") || inputDateTimeEnd.format("h:mm:ss") >= moment(dateobj[i].end).format("h:mm:ss"))

//     if (((inputDateTimeStart.format() <= moment(dateobj[i].start).format()) && (inputDateTimeEnd.format() <= moment(dateobj[i].start).format())) ||
//         ((inputDateTimeStart.format() >= moment(dateobj[i].start).format()) && (inputDateTimeEnd.format() >= moment(dateobj[i].start).format()))
//     ) {
//         var message = "Slot already booked"
//         var bookedSlotStart = moment(dateobj[i].start).format("hh:mm:ss a");
//         var bookedSlotEnd = moment(dateobj[i].end).format("hh:mm:ss a");
//     }
// }
// }
// if (message == "Slot already booked") {
//     console.log(message);
//     console.log("Slot booked from : " + bookedSlotStart + " to " + bookedSlotEnd);
// } else {
//     console.log("Slot availabile");
//     createEvents(auth, inputDateTimeStart, inputDateTimeEnd)
// }



// if (inputDateTimeStart.format("MMM Do YY") == moment(dateobj[i].start).format("MMM Do YY")) {
//       // console.log(moment(dateobj[i].end).format("h:mm:ss") )
//       // console.log(inputDateTimeStart.format("h:mm:ss") <= moment(dateobj[i].start).format("h:mm:ss") || inputDateTimeEnd.format("h:mm:ss") >= moment(dateobj[i].end).format("h:mm:ss"))

//         if ((inputDateTimeStart.format() < moment(dateobj[i].start).format()) && (inputDateTimeEnd.format() > moment(dateobj[i].start).format())) {
//             var message = "Slot already booked";
//             var bookedSlotStart = moment(dateobj[i].start).format("hh:mm:ss a");
//             var bookedSlotEnd = moment(dateobj[i].end).format("hh:mm:ss a");
//         }
//     }