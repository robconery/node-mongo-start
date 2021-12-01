
const express = require('express');
const router = express.Router();
const passport = require("passport");
const Mailer = require("../mail");
const {User} = require("../lib/models/");
const shortid = require("shortid");

router.get("/login",function(req,res){
  res.render('login');
})
router.get("/register",function(req,res){
  res.render('register');
})

router.post("/register", async function(req, res){
  if(req.body.email && req.body.name){
    const newUser = await User.register({name: req.body.name, email: req.body.email, password: shortid.generate()});
    if(newUser){
      const rootUrl = `${req.protocol}://${req.get("host")}/auth/validate`;
      await Mailer.sendMagicLink(rootUrl, newUser.email);
      req.flash("info", "You've been registered and will receive a login link in just a minute...")
      
    }else{
      req.flash("errors", newUser.message);
    }
  }else{
    req.flash("errors","Your name and an email are required...");
    
  }
  res.redirect("/auth/register");
});

router.get("/validate/:token", async function(req,res){
  const token = req.params.token;
  if(token){
    console.log(token);
    const found = await User.tokenLogin(req.params.token);
    if(found){
      req.flash("info","Welcome back - you're logged in...");
      req.user = found;
      req.session.user = found;
      req.session.save();
      const redirectTo = "/";
      
      res.redirect(redirectTo);
    }else{
      req.flash("errors","That token is invalid or expired.");
      res.redirect("/auth/login");
    }
  }else{
    res.redirect("/auth/login");
  }
});

router.post("/login", async function(req,res){
  const email = req.body.email;
  const rootUrl = `${req.protocol}://${req.get("host")}/auth/validate`;
  if(email){
    //do we have this user? if not, we could create an account for them on the fly
    //or we force them to register. this is up to your needs
    const exists = await User.findOne({email: email});
    if(exists){
      try{
        await Mailer.sendMagicLink(rootUrl, email);
        req.flash("success","Email is on its way - you should see it in just a minute.");
      }catch(err){
        console.log(err);
        req.flash("errors","There was a problem sending this email. The server might not be responding...");       
      }
    }else{
      req.flash("errors","That email doesn't exist in our system");
    }
  }else{
    req.flash("errors","Please give an email... thanks...");
  }
  console.log("Redirecting...");
  res.redirect("/auth/login");
});


router.get("/logout", function(req,res){
  //kill the session
  req.session.user = null;
  req.session.save();
  res.redirect("/");
});


router.get('/google', (req,res,next) => {
  passport.authenticate('google', { 
    callbackUrl: `${req.protocol}://${req.get("host")}/auth/google/callback`,
    scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
    ] 
  })(req, res, next)
});

router.get('/github', (req, res, next) => {
  passport.authenticate('github', {
    callbackUrl: `${req.protocol}://${req.get("host")}/auth/github/callback`,
  })(req, res, next)
});


router.get('/google/callback', passport.authenticate('google'), function(req,res){
  req.session.user = req.user;
  const redirectTo = "/";
  req.flash("success","Successfully logged in");
  res.redirect(redirectTo);
});

router.get('/github/callback', passport.authenticate('github'), function(req,res){
  req.session.user = req.user;
  const redirectTo = "/";
  req.flash("success","Successfully logged in");
  res.redirect(redirectTo);
});



module.exports = router;