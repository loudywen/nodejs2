const GoogleStrategy = require('passport-google-oauth20').Strategy;

const mongoose = require('mongoose');
const User = mongoose.model('user');

const keys = require('./key');

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy({
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: '/auth/google/callback',
            proxy: true
        }, (accessToken, refresToken, profile, done) => {

            const image = profile.photos[0].value.substring(0, profile.photos[0].value.indexOf('?'));

            const newUser = {
                googleID: profile.id,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
                image: image
            }

            // check for existing user
            User.findOne({
                googleID: profile.id
            }).then(user => {
                if (user) {
                    done(null, user);
                } else {
                    new User(newUser)
                        .save()
                        .then(user => {
                            done(null, user);
                        })
                }
            })
        })
    )

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {

        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};