//IMPORTANT BASE CODE FOR JWT TOKENS(STRETCH FEATURE)

// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const User = require('./model/User');
// const bcrypt = require('bcrypt')

// function initialize(passport) {

//     const authenticateUser = async (email, password, done) => {
//         const user = await User.findOne({ email });
//         if (user == null) {
//           return done(null, false, { message: 'No user with that email' });
//         }
//         try {
//           const isValid = await bcrypt.compare(password, user.password);
//           if (isValid) {
//             return done(null, user);
//           }
//           return done(null, false, { message: 'Invalid password' });
//         } catch (err) {
//           return done(err);
//         }
//     };

//     passport.use(new LocalStrategy({
//       usernameField: 'email',
//       passwordField: 'password',
//     }),authenticateUser)

//     passport.serializeUser((user, done) => {
//       done(null, user.id);
//     });

//     passport.deserializeUser((id, done) => {
//       User.findById(id, (err, user) => {
//         done(err, user);
//       });
//     });
// }

// module.exports = initialize;
