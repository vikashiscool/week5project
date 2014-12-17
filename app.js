//DINNER-AND-A APP 
//Vikash Parekh GA-WDI-SF -- W5 PROJECT

//===========================
//START BOILERPLATE
var express   		= require('express');
var bodyParser 		= require('body-parser'); //used to append returned URL (all of the stuff after '?')
var app				= express();
var ejs 		  	= require('ejs'); //enables the use of embedded JS template (ejs) files

var path			= require('path');
var cookieParser 	= require('cookie-parser'); // 
var session       	= require('express-session'); //session manager 
var passport      	= require('passport'); //authentication
var LocalStrategy 	= require('passport-local').Strategy;
var methodOverride	= require ('method-override'); //patching and updating
var db			  	= require('./db.js'); //links to DB
var pg      	 	= require('pg');

app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: 'pickles',
  resave: false,
  saveUninitialized: true
}));

//===========================
//Passport Boilerplate

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	db.query('SELECT * FROM users WHERE id = $1', [id], function(err, dbRes) {
		if (!err) {
			done(err, dbRes.rows[0]);
		}
	});
});

app.listen(8080, function(){
	console.log('Server running on PORT 8080.');
});

var localStrategy = new LocalStrategy(
	function(email, password, done) {
		console.log('I got this far!');

		db.query('SELECT * FROM users WHERE email = $1', [email], function(err, dbRes) {
			var user = dbRes.rows[0];
			console.log(email)

			console.log(user);
		//  function(username, password, done) {
		//    findByUsername(username, function(err, user) {


		    if (err) { return done(err); }
		    if (!user) { return done(null, false, { message: 'Unknown user ' + email }); }
		    if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
		    return done(null, user);
		});
	}
);
passport.use(localStrategy);
app.use(passport.initialize());
app.use(passport.session());

// ================
// END BOILERPLATE

// =====================================================================

//index
app.get('/', function(req, res) {
	res.render('index', { user: req.user })
});

app.get('/users/new', function(req, res){
	res.render('users/new')
});

// app.post('/sessions',
//   passport.authenticate('local'),
//   function(req, res) {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     res.redirect('/users/' + req.user.id);
//   });

app.post('/sessions', passport.authenticate('local', 
  {failureRedirect: '/garbage'}), function(req, res) {
    res.send('success!!!!');
});

app.post('/users', 
	function(req, res){
		db.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [req.body.username, req.body.email, req.body.password], function(err, dbRes){
			if(!err){
				res.redirect('/'); 
			} else {
				res.send("Error")
			}
			}
		);
		// res.send('i got this far');
	}
);


//main page-- once registered or logged in
app.get('/main', function(req, res) {
	// Get rid of var user and replace the ": user" with ": req.user" 
	var user = {name: "TEST USER", id: 109409};
	res.render('main', {user: user})
});

//return results
app.get('/results', function(req, res){
	var zip = req.query['zip'];
	var price = req.query['price'];
	request('https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in'+zip+'&key=AIzaSyDHS9pwkFM12gb1N0nM2sV8u6GzfI6OP3s&minprice='+price+'&maxprice='+price+'&open_now=true', function(error, response, body){
		res.render('results'); //
	});
});

//update user data
app.patch('/users/:id', function(req, res){
	db.query("UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4", 
	[req.body.username, req.body.email, req.body.password, req.params.id], function(err, dbRes){
		if(!err){
			res.render('users/edit');
		} else {
			res.send('ERROR!');
		}
	});
});



//https://maps.googleapis.com/maps/api/place/textsearch/json?.........&key=AIzaSyDHS9pwkFM12gb1N0nM2sV8u6GzfI6OP3s

//API key:	AIzaSyDHS9pwkFM12gb1N0nM2sV8u6GzfI6OP3s
// var title = req.query['title'];
// request('http://www.omdbapi.com/?t='+title, function(error, response, body){
// 	var movie = JSON.parse(body);
// 	res.render('results', {movie: movie}); //
// });
