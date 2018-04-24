const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done) => {
   done(null, user.id);
});

passport.deserializeUser((id, done) => {
   User.findById(id).then((user) => {
      done(null, user);
   })
})

passport.use(
   new GoogleStrategy({
      // options for google strategy
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: '/auth/google/redirect'
   }, (accessToken, refreshToken, profile, done) => {
      // check if user exist in database
      User.findOne({googleId: profile.id}).then((currentUser) => {
         if (currentUser) {
            // already have this user
            console.log('user: ', currentUser);
            done(null, currentUser);
         } else {
            // if not, create user in our db
            new User({
               googleId: profile.id,
               username: profile.displayName,
               thumbnail: profile._json.image.url
            }).save().then( (newUser) => {
               console.log('new user created: ', newUser);
               done(null, newUser);
            });
         }
      })
     
   })
);