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


// var user = function retrieveSignedInUser(req, res, next) {
//   	const email = req.session.currentUser;

//     User.findOne({ where: { email:email } }).then(function(user) {
//     	// console.log("retrieveSignedInUser" + user);
    	
//     	// console.log("retrieveSignedInUser2" + req.session.currentUser);
//     	// 	//req.session.currentUser = user;
//     	// console.log("retrieveSignedInUser3" + req.session.currentUser);
//     	req.user = user;
//     	currentUse =user;
//     	console.log('hahkjahdlshdkjlhadfhlfhasdhfas')
//     	console.log(req.user);
//     	// next();
//     });
//     next();

// }

// app.use(user);




app.get('/profile', requireSignedIn, function(req, res) {
	console.log()
	const email =req.session.currentUser;

	User.findOne({ where: {email:email} }).then(function(user) {
		res.render('profile.html', {
			user: user
		});
	});
});

// app.get('/profile',function(req, res) {
// 	// const email = req.user;
// 	// const name = email;
// 	// User.findOne({ where: {name: name} }).then(function(user) {
// 	// 	res.render('profile.html', {
// 	// 		user: user
// 	// 	});
// 	// });

// 	res.render('profile.html',{
// 		useravatar:req.user.av
// 	});
// });

app.get('/', function(req, res) {
	console.log("HELLLOO");
	res.render('index.html');
});

app.get('/course', function(req, res) {
	// const email = req.user;
	// const name = email;
	// User.findOne({ where: {name: name} }).then(function(user) {
	// 	res.render('profile.html', {
	// 		user: user
	// 	});
	// });
	res.render('course.html');
});

app.get('/files',  function(req, res) {
	// const email = req.user;
	// const name = email;
	// User.findOne({ where: {name: name} }).then(function(user) {
	// 	res.render('profile.html', {
	// 		user: user
	// 	});
	// });
	res.render('files.html');
});

const avatarpic = multer({dest: './avatar_pics'})

app.post('/upload-avatar', requireSignedIn, avatarpic.single('avatar'), function(req, res){

console.log("wokieeeeeeeeeeee-----------------------------------------------------------")
	console.log(req.file)
	const email = req.session.currentUser;
	console.log(email);
console.log("KAJSKDFASDKFHASDFHLASDHLFD----------------------------------------------------------")

		// console.log(req.user);
		console.log("wokieeeeeeeeeeee-----------------------------------AKSHDJLFLJKSDAF------------------------")


	User.findOne({ where: { email: email } }).then(function(user) {
		user.update({avatar: '/avatars/' + req.file.filename}).then(function(){
			res.redirect('/profile');
			console.log("HAHAA " + user.avatar);
		});
		 
	});

	
});

const file_upload = multer({dest: './uploads'});

app.post('/uploadFile', requireSignedIn, file_upload.single('file'), function(req, res){

	const email = req.session.currentUser;
	
	File.create({
            name:'/uploads/' + req.file.filename,
            course: req.body.course_code + req.body.course_number,
            user:email.id
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