const https = require('https');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const jquery = require('jquery');

const User = require('./models/user.js');
const Event = require('./models/event.js');

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

const nodemailer = require('nodemailer');
const fs = require('fs');
const multer = require('multer');
const upload = multer({dest : './public/photoEvent'});


var options = {
   key: fs.readFileSync('/etc/letsencrypt/live/lafabrique-bethune.fr-0001/privkey.pem'),
   cert: fs.readFileSync('/etc/letsencrypt/live/lafabrique-bethune.fr-0001/cert.pem'),
   ca: fs.readFileSync('/etc/letsencrypt/live/lafabrique-bethune.fr-0001/chain.pem')
};




var app = express();

var server = https.createServer(options, app);
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);
server.listen(443);



// set morgan to log info about our requests for development use.
app.use(morgan('dev'));



app.use(express.static('public'));

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());


 




// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 604800000
    }
}));


app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});


// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/');
    } else {
        next();
    }    
};






app.route('/')
    .get((req, res) => {

    	res.render('home.ejs')

    });



app.route('/login')
    .get(sessionChecker, (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            var username = req.session.user.username;
        } else {

        }
        res.render('login.ejs', {username: username});
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        User.findOne({ where: { username: username } }).then(function (user) {
            if (!user) {
                res.redirect('/login');
            } else if (!user.validPassword(password)) {
                res.redirect('/login');
            } else {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            }
        });
    });



// *********    LOGOUT     ************  



app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/');
    }
});

app.route('/smart-city')
    .get((req, res) => {

    	res.render('smart-city.ejs')

    });

app.route('/co-working')
    .get((req, res) => {

    	res.render('co-working.ejs')

    });

app.route('/fablab')
    .get((req, res) => {

    	res.render('fablab.ejs')

    });


app.route('/bookkafe')
    .get((req, res) => {

    	res.render('bookkafe.ejs')

    });



app.route('/location')
    .get((req, res) => {

    	res.render('location.ejs')

    });



app.route('/event')
    .get((req, res) => {

        var d = new Date((new Date()).valueOf() - 1000*3600*24);

        Event.findAll({
            where: {
                date: {
                  [Op.gte]: d
                }
            }
        })
        .then(events => {
                var allevents = events;
                console.log(allevents);
                res.render('event.ejs', {allevents: allevents});
            })

    	

    });

app.get('/fablab/formation', (req, res) => {
    res.redirect('/event?event=fablab')
})


app.route('/signup')
    .get ((req, res) => {
        res.render("signup.ejs");
    })
    .post ((req, res) => {
        User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,

            isadmin: false,

            })
            .then(user => {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            })
            .catch(error => {
                res.redirect('/signup');
                console.log('This error occured', error);
            })
        
    });

app.route('/dashboard')
    .get ((req, res) => {
        if (req.session.user && req.cookies.user_sid && req.session.user.isadmin) {
            var username = req.session.user.username;
            res.render('dashboard.ejs');
        } else if (req.session.user && req.cookies.user_sid) {
            console.log('Not admin');
            res.send('Désolé, vous n\'êtes pas autorisés à accéder à cette page');
        } else {
            console.log('Not login');
            res.redirect('/login'); 
        }
    })


    .post(upload.single("photo"), (req, res) => {
        var chemin;
        var lienFacebook;
        if (req.file) 
        {   
            
            chemin = req.file.path.substring(7)
        } else {
            chemin = "img/logoLaFabrique.svg";
        }
        if (req.body.lienFacebook) 
        {   
            
            lienFacebook = req.body.lienFacebook;
        } else {
            lienFacebook = "https://www.facebook.com/lafabriquebethune/";
        }
        Event.create({
                titre: req.body.titre,
                description: req.body.description,
                photo: chemin,
                organisateur: req.body.organisateur,
                lienFacebook: lienFacebook,
                date: req.body.date,
                time: req.body.time,
                timeend: req.body.end,
                
        })
        .then(event => {
                res.redirect('/event');
            })
        .catch(error => console.log('This error occured', error));
        

    })





app.route('/contact')
    .get((req, res) => {

        res.render('contact.ejs',{result: ''});
    })
    .post((req, res) => {

        let mailOpts, smtpTrans;
        smtpTrans = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
            user: 'lafabriquebethune@gmail.com',
            pass: 'Lafabrique2018Carnot'
                }
        });
        mailOpts = {
            from: req.body.name,
            sender: req.body.email,
            replyTo: req.body.email,
            to: 'lafabriquebethune@gmail.com;contact@lafabrique-bethune.fr;',
            subject: req.body.subject,
            html: `<h3>Nouveau message de : ${req.body.name} <${req.body.email}></h3></br> <p>${req.body.message}</p>`
        };
        smtpTrans.sendMail(mailOpts, function (error, response) {
            if (error) {
            res.render('contact.ejs', {result : "Votre message na pas été envoyé. Veuillez réessayer"});
            }
            else {
                        res.render('contact.ejs', {result : "Votre message a bien été envoyé, merci pour votre retour !"});

            }
        });
    });

app.route('/contactLocation')
    .get((req, res) => {

        res.render('contactLocation.ejs',{result: ''});
    })
    .post((req, res) => {

        let mailOpts, smtpTrans;
        smtpTrans = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
            user: 'lafabriquebethune@gmail.com',
            pass: 'Lafabrique2018Carnot'
                }
        });
        mailOpts = {
            from: req.body.name,
            sender: req.body.email,
            replyTo: req.body.email,
            to: 'lafabriquebethune@gmail.com;contact@lafabrique-bethune.fr;',
            subject: req.body.subject,
            html: `<h3>Nouveau message de : ${req.body.name} <${req.body.email}></h3></br>Societe : ${req.body.societe}</br>Numéro de téléphone : ${req.body.phone}</br></br> <p>${req.body.message}</p>`
        };
        smtpTrans.sendMail(mailOpts, function (error, response) {
            if (error) {
            res.render('contact.ejs', {result : "Votre message na pas été envoyé. Veuillez réessayer"});
            }
            else {
                        res.render('contact.ejs', {result : "Votre message a bien été envoyé, merci pour votre retour !"});

            }
      });
});



app.use(function (req, res, next) {

    res.status(404).render('404.ejs')
});