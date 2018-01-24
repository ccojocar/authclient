'use strict';

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const crypto = require('crypto');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const http = require('http');

const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(errorHandler());

const cookieSecret = crypto.randomBytes(64).toString('hex');
app.use(session({ name: 'authclient-id', secret: cookieSecret, resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

passport.use(new OAuth2Strategy(
    {
        authorizationURL: "http://localhost:3000/oauth2/authorize",
        tokenURL: "http://localhost:3000/oauth2/token",
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: "http://localhost:3001/oauth2/callback",
        state: true,
    },
    (accessToken, refreshToken, profile, done) => {
        return done(null, accessToken);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((id, done) => done(null, id));

app.get('/', (req, res) => res.render('home'));
app.get('/userinfo', passport.authenticate('oauth2'));

app.get('/oauth2/callback',
    passport.authenticate('oauth2', { failureRedirect: '/error' }),
    (req, res) => {
        const headers = { 'Authorization': `Bearer ${req.user}` };
        http.get({
            hostname: 'localhost',
            port: 3000,
            path: '/userinfo',
            agent: false,
            headers: headers
        }, (userinfoResponse) => {
            if (userinfoResponse.statusCode != 200) {
                res.render('error');
            } 
            let userinfoData = '';
            userinfoResponse.on('data', (chunk) => {
                userinfoData += chunk;
            });
            userinfoResponse.on('end', () => {
                let userinfo = JSON.parse(userinfoData);
                res.render('userinfo', { user: userinfo });
            })
        });
    });

app.get('/error', (req, res) => res.render('error'));

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
