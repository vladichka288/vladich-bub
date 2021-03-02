var express = require('express');
var router = express.Router();
var user = require('./models/user')
const config = require('./config');
const crypto = require('crypto');

router.get(('/register'), function (req, res) {
    if (req.query.err) {
        res.render('registration', {error: req.query.err})
    } else {
        res.render('registration')
    }
});

const passport = require("passport")
require('./passport');
function sha512(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');

    return {salt: config.secret, passwordHash: value};
}
router.post(('/register'), function (req, res) {
    if(req.body.userName.length > 5 && req.body.userName.length < 20 ){
        if ( (req.body.pass == req.body.confirm_pass) &&  (req.body.pass.length > 8) && req.body.pass.length < 20) {
            if((req.body.login.length > 5) && (req.body.login.length < 20)){
                user.getAll().then(allUsers => {
                    for (let oneOfUsers of allUsers) {
                        if (oneOfUsers.login == req.body.login) {
                            console.log("mu tyta");
                            res.redirect(`/auth/register?err=${
                                req.body.login
                            }+alreay+exists`)
                            return Promise.reject("login alreaty exist");
                        }
                    }
        
                    let newUser = new user(req.body.login, req.body.userName, sha512(req.body.pass, config.secret).passwordHash)
                    return user.insert(newUser);
        
                }).then(result => {
                    res.render('autho');
                    return;
                }).catch(error => {
                    console.log(error)
                    return;
                })
            }else{
                res.status(400);
                res.render('err', {err : "invalid login"})
            }
           
    
        } else {
            res.redirect(`/auth/register?err=passwords+do+not+match`)
        }
    }else{
        
            res.status(400);
            res.render('err', {err : "invalid username"})
        
    }
    
})

router.get(('/login'), function (req, res) {
    if (req.query.chatId) {
        res.render("autho", {chatId: req.query.chatId});
    } else {
        res.render("autho");
    }
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/auth/login'}), function (req, res) {
    if (req.body.chatId) {
        console.log(req.body.chatId + "AYE ");
        return user.findByChatId(req.body.chatId, req.user.id).then(result => {
            console.log("pim pyp");
            res.status(200);
            res.redirect('/');
        }).catch(err => console.log("XYAS"));
    } else {
        res.status(200);
        res.redirect('/');
    }
});

router.get('/google', passport.authenticate('google', {scope: ['profile']}));


router.get('/google/redirect', passport.authenticate('google', {scope: ['profile']}), function (req, res) {
    
    res.redirect('/');
});
router.get('/logout', function (req, res) {
    if (req.user) {
        req.logout();
        res.redirect('/auth/login');
    } else {
        res.redirect('/auth/login');
    }
});


module.exports = router;
