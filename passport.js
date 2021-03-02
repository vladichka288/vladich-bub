const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const GoogleStrategy = require('passport-google-oauth20');
const config = require('./config');
const crypto = require('crypto');
const user = require('./models/user');


passport.serializeUser(onSerialize);
passport.deserializeUser(onDeserialize);


function sha512(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');

    return {salt: config.secret, passwordHash: value};
}
function onSerialize(user, doneCB) {
    console.log(`ABABABABBABA=${
        user._id
    }`)

    doneCB(null, user._id);
}

function onDeserialize(id, doneCB) {
   
    user.getById(id).then(result => {
        if (!result) 
            doneCB("No user");
         else {
         
            doneCB(null, result);
        }
    })
}
passport.use(new LocalStrategy(onLogin));


function onLogin(username, password, doneCB) {
    const hashedPass = sha512(password, config.secret).passwordHash;
    user.getByLoginAndHashPass(username, hashedPass).then(result => {
        if (result) {
            console.log(result);
            doneCB(null, result);
        } else {
            console.log('it is not');
            doneCB(null, false);
        }
    }).catch(err => console.error(err))

}

passport.use(new BasicStrategy(function (username, password, done) {
    const hashedPass = sha512(password, config.secret).passwordHash;
    user.getByLoginAndHashPass(username, hashedPass).then(result => {
        if (result) {
            done(null, result);
        } else {
            done(null, false);
        }
    }).catch(err => done(err))
}));
passport.use(new GoogleStrategy({
    callbackURL: 'https://vladich-bub.herokuapp.com/auth/google/redirect',
    clientID: config.google.client_id,
    clientSecret: config.google.client_secret
}, (accessToken, refreshToken, profile, done) => {

    return user.fintUserByGoogleId(profile.id).then(userResult => {
        if (userResult) {
            done(null, userResult);
            return "user already exist";
            
        } else {
            let userGoogle =  new user("", profile.displayName, "");
            userGoogle.fullname = profile.displayName;
            userGoogle.googleId = profile.id;
            userGoogle.avaUrl = profile.coverPhoto;
            console.log(profile.picture);
            
            return user.insert(userGoogle);
        }
    }).then(result => {
        if (result != "user already exist") {
            done(null, result);
        } else {
            console.log("pyk");
        }

    }).catch(err => {
        console.error(err);
    })

}));
