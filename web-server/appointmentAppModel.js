var XCassandra = require('express-cassandra');

var models = XCassandra.createClient({
    clientOptions: {
        contactPoints: ['127.0.0.1'],
        protocolOptions: { port: 9042 },
        keyspace: 'appointment_app',
        queryOptions: { consistency: XCassandra.consistencies.one }
    },
    ormOptions: {
        defaultReplicationStrategy: {
            class: 'SimpleStrategy',
            replication_factor: 1
        },
        migration: 'safe',
    }
});

var userProfile = models.loadSchema('user_profile', {
    fields: {
        id: "int",
        age: "int",
        calender_id: "int",
        googleplusid: "text",
        profile_pic: "text",
        name: "text"
    },
    key: ["id"]
});

var userAccount = models.loadSchema('user_account', {
    fields: {
        user_id: "int",
        role: "text",
        status: "text"
    },
    key: ["user_id"]
});

var appointment = models.loadSchema('appointment', {
    fields: {
        id: "int",
        start: "timestamp",
        end: "timestamp",
        doctorid: "int",
        patientid: "int",
        schedule: "text",
        status: "text",
        venue: "text"
    },
    key: ["id"]



});

userAccount.syncDB(function(err, result) {
    if (err) throw err;
});

appointment.syncDB(function(err, result) {
    if (err) throw err;
});

// var newEntry = new models.instance.user_account({ user_id: 123, role: 'Admin', status: 'Active' });
// newEntry.save(function(err) {
//     if (err) console.log(err);
//     else console.log('Entry saved');
// });

// var newAppointment = new models.instance.appointment({ id: 123, doctorid: 111, patientid: 222, schedule: 'twelve', status: 'Active', venue: 'Bangalore' });
// newAppointment.save(function(err) {
//     if (err) console.log(err);
//     else console.log('Entry saved');
// });




// userAccount.find({}, { raw: true, allow_filtering: true }, function(err, details) {
//     console.log("findone", err);
//     console.log("details", details);
// })

// appointment.find({ id: 123 }, { raw: true, allow_filtering: true }, function(err, details) {
//     console.log("findone", err);
//     console.log("details", details);
// })

module.exports = {appointment,userAccount,userProfile};