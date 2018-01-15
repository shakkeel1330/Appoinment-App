var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


// load up the user model
var User = require('../appointmentAppModel');

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

    // // used to serialize the user for the session
    // passport.serializeUser(function(user, done) {
    //     done(null, user.id);
    // });

    // // used to deserialize the user
    // passport.deserializeUser(function(id, done) {
    //     // User.findById(id, function(err, user) {
    //         // done(null, id);
    //         done(err, id);
    //     // });
    // });


    // used to serialize the user for the session
    // passport.serializeUser(function(user, done) {
    //     console.log("ser");
    //     console.log(user);
    //     done(null, user.id);
    // });

    // // used to deserialize the user
    // passport.deserializeUser(function(id, done) {
    //     // console.log(user);
    //     // console.log(err);
    //     User.userProfile.findOne({ id: id }, function(err, user) {
    //         // User.findById(id, function(err, user) {
    //         console.log("des");
    //         done(err, user);
    //         // console.log(`deserialized user ${user}`);
    //         // done(err, id);
    //     });
    // });

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,

        },
        function(token, refreshToken, profile, done) {
            // console.log(profile);
            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Google
            process.nextTick(function() {
                // return done(null, profile);

                // try to find the user based on their google id
                User.userProfile.findOne({ 'id': profile.id }, { raw: true }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if a user is found, log them in
                        return done(null, user);
                    } else {
                        // if the user isnt in our database, create a new user
                        var newUser = new User.userProfile({ id: profile.id, token: token, name: profile.displayName });

                        // set all of the relevant information
                        // newUser.google.id    = profile.id;
                        // newUser.google.token = token;
                        // newUser.google.name  = profile.displayName;
                        // newUser.google.email = profile.emails[0].value; // pull the first email

                        // save the user
                        newUser.save(function(err) {
                            if (err) 
                                throw err;
                            // } else {
                            //     req.login(newUser.id, function(err) {
                            //             console.log('UserId attached to session!')
                            //         }
                                    return done(null, newUser);

                                // )
                            })
                        }
                    })
                });
            });

        }));


    // function(token, refreshToken, profile, done) {
    //     // console.log(profile);
    //     // make the code asynchronous
    //     // User.findOne won't fire until we have all our data back from Google
    //     process.nextTick(function() {
    //         // return done(null, profile);

    //         // try to find the user based on their google id
    //         User.userProfile.findOne({ 'id': profile.id }, { raw: true }, function(err, user) {
    //             if (err)
    //                 return done(err);

    //             if (user) {

    //                 // if a user is found, log them in
    //                 return done(null, user);
    //             } else {
    //                 // if the user isnt in our database, create a new user
    //                 var newUser = new User.userProfile({ id: profile.id, token: token, name: profile.displayName });

    //                 // set all of the relevant information
    //                 // newUser.google.id    = profile.id;
    //                 // newUser.google.token = token;
    //                 // newUser.google.name  = profile.displayName;
    //                 // newUser.google.email = profile.emails[0].value; // pull the first email

    //                 // save the user
    //                 newUser.save(function(err) {
    //                     if (err)
    //                         throw err;
    //                     User.userProfile.findOne({ 'id': profile.id }, { raw: true }, function(err, results) {
    //                         console.log(results[0]);
    //                         req.login(results[0], function(err) {
    //                             console.log('UserId attached to session!')
    //                         })
    //                         // return done(null, newUser);
    //                     })
    //                 });
    //             }
    //         });
    //     });

    // }));

    passport.serializeUser(function(user, done) {
        console.log("ser");
        console.log(user);
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
        console.log("des");
        done(null, user);

    });

};