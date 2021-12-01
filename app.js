var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
const flash = require('express-flash');
require("dotenv").config();
const bodyParser = require("body-parser");
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const PassportConfig = require("./config/passport");
const Mail = require("./mail");
const Mongoose = require("mongoose");
const app = express();

//the bootup/startup file for stuff I've added to the app
//const boot = require("./config/boot");

  // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

const expires = 1000 * 60 * 60 * 24 * 14;
const sessionStore = new session.MemoryStore;

app.use(session({ 
  secret: 'burke burke burke', 
  cookie: { maxAge: expires },
  resave: true,
  saveUninitialized: true,
  store: sessionStore
}));

let passport = PassportConfig.init({
  GoogleSettings: {
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET
  },
  GithubSettings: {
    clientID: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    scope: ["user:email"]
  }
});


app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function(req,res,next){
  res.locals.user = req.session.user;
  res.locals.info = req.flash('info');
  res.locals.success = req.flash('success');
  res.locals.errors = req.flash('errors');
  console.log(res.locals.errors);
  next();
});

  
app.use('/', indexRouter);
app.use('/auth', authRouter);
   
  // catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
  
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

Mail.init({
  host: process.env.SMTP_HOST,
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD
});

Mongoose.connect(process.env.DATABASE_URL).then(()=> {
  console.log("Mongo connected to", process.env.DATABASE_URL)
});
module.exports = app;