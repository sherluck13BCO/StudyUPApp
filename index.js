const express = require('express');
const database = require('./database');
const File = require('./models').File;
const User = require('./models').User;
const flash = require('express-flash');
var bodyparser = require('body-parser');
const consolidate = require('consolidate');
const cookieparser = require('cookie-parser');
const session = require('express-session');
const middlewares = require("middlewares");
const multer = require('multer');
const path = require('path');
var app = express();


app.engine('html', consolidate.nunjucks);
app.set('views', './views');

// app.use(bodyparser.urlencoded());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieparser('secret-cookie'));
app.use(session({ resave: false, saveUninitialized: false, secret: 'secret-cookie' }));
app.use(flash());

app.use('/static', express.static('./static'));
app.use('/avatars', express.static('./avatar_pics'));
app.use('/uploads', express.static('./uploads'));

app.use(require('./auth'));

var user = function retrieveSignedInUser(req, res, next) {

  	const email = req.session.currentUser;

    User.findOne({ where: { email:email } }).then(function(user) {
    	// console.log("retrieveSignedInUser" + user);
    	
    	// console.log("retrieveSignedInUser2" + req.session.currentUser);
    	// 	//req.session.currentUser = user;
    	// console.log("retrieveSignedInUser3" + req.session.currentUser);
    	req.user = user;
    	console.log('hahkjahdlshdkjlhadfhlfhasdhfas')
    	console.log(req.user);
    	next();
    });
    // next();

}

app.use(user);

app.get('/profile', requireSignedIn, function(req, res) {
	

	// const email =req.session.currentUser;
		const email =req.user.email;

	User.findOne({ where: {email:email} }).then(function(user) {
		res.render('profile.html', {
			user: user
		});
	});
});

app.get('/', function(req, res) {

	console.log("HELLLOO");
	res.render('index.html');
});

app.get('/course', function(req, res) {
	
	File.findAll().then(function(results) {
		console.log(results);
		res.render('course.html', {
			files:results
		});
	});
});

app.get('/files',  function(req, res) {

	res.render('files.html');
});

const avatarpic = multer({dest: './avatar_pics'})

app.post('/upload-avatar', requireSignedIn, avatarpic.single('avatar'), function(req, res){
	
	// const email = req.session.currentUser;
	const email = req.user.email;
	User.findOne({ where: { email: email } }).then(function(user) {
		user.update({avatar: '/avatars/' + req.file.filename}).then(function(){
			res.redirect('/profile');
			console.log("HAHAA " + user.avatar);
		});
		 
	});
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    var originalname = file.originalname;
    var extension = originalname.split(".");
    filename = Date.now() + '.' + extension[extension.length-1];
    cb(null, filename);
  }
});

//const file_upload = multer({dest: './uploads'});

const file_upload = multer({storage:storage});

app.post('/uploadFile', requireSignedIn, file_upload.single('file'), function(req, res){

	// const email = req.session.currentUser;
	const email = req.user.email;

	console.log(req.session.currentUser);
	
	File.create({
            name:'/uploads/' + req.file.filename,
            course: req.body.course_code + req.body.course_number,
            user_id:req.user.id,
            description: req.body.description
        }).then(function(response) {
            //req.flash('signUpMessage', 'Signed up successfully!');
            return res.redirect('/profile');
        });

	
});



function requireSignedIn(req, res, next) {
    if (!req.session.currentUser) {
        return res.redirect('/');
    }
    next();
}


app.listen(3000, function() {
	console.log('Server is now running at port 3000');
});