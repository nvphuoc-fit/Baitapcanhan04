const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); // Adjust the path as necessary

// Configure the local strategy for use by Passport.
passport.use(new LocalStrategy(
    {
        usernameField: 'email', // Define the field for the username
        passwordField: 'password' // Define the field for the password
    },
    async (email, password, done) => {
        try {
            // Find the user by email
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            // Check if the password is correct
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            // If everything is correct, return the user
            return done(null, user);
        } catch (err) {
            // Handle any errors
            return done(err);
        }
    }
));

// Serialize user information into the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user information from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;
// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Middleware to ensure the user is an admin
function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.redirect('/not-authorized');
}

module.exports = {
    passport,
    ensureAuthenticated,
    ensureAdmin
};