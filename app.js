//DINNER-AND-A APP 
//Vikash Parekh GA-WDI-SF -- W5 PROJECT

//===========================
//START BOILERPLATE
var express   		= require('express');
var app				= express();
var ejs 		  	= require('ejs'); //enables the use of embedded JS template (ejs) files

var path			= require('path');
var bodyParser 		= require('body-parser'); //used to append returned URL (all of the stuff after '?')
var cookieParser 	= require('cookie-parser'); // 
var session       	= require('express-session'); //session manager 
var passport      	= require('passport'); //authentication
var LocalStrategy 	= require('passport-local').Strategy;
var methodOverride	= require ('method-override'); //patching and updating
var db			  	= require('./db.js'); //links to DB
var pg      	 	= require('pg');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: 'pickles',
  resave: false,
  saveUninitialized: true
}));

ar localStrategy = new LocalStrategy(
  function(username, password, done) {
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
  }
)

passport.use(localStrategy);

app.use(passport.initialize());
app.use(passport.session());

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
};

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
};

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

//DATABASE boilerplate
db.config = {
  database: "dinner", //database name: dinner
  host: "localhost",
  port: "5432"
}

db.connect = function(callback) {
  pg.connect(this.config, callback);
}

db.query = function(statement, params, callback) {
  this.connect(function(err, client, done){
      client.query(statement, params, callback);
    done();
  })
}

// ================
// END BOILERPLATE



//index
app.get('/', function(req, res) {
	res.render('index')
});

//new routes below
app.get('/main', function(req, res) {
	res.render('main')
});

app.get('/signup', function(req, res){
	res.render('users/new')
});


app.post('/signup', function(req, res){
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;

	db.query('INSERT INTO users(username, email, password) VALUES ($1, $2, $3)', [req.body.username, req.body.email, req.body.password], function(err, dbRes){
		//if sign-up is successful (no errors), then redirect to the homepage.
			if(!err){
				res.redirect('/main'); 
			} else {
				res.send("Error")
			}
		});
});


app.get('/results', function(req, res){
	var zip = req.query['postal_code'];

})

app.patch('/edit', function(req, res){
	db.query("UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4", 
	[req.body.username, req.body.email, req.body.password, req.params.id], function(err, dbRes){
		if(!err){
			res.redirect('/users/' + req.params.id);
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
