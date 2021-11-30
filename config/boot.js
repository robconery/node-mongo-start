const Mongoose = require("mongoose");
const Mail = require("../mail");
const Passport = require("./passport");
const consola = require("consola");
const settings = require("../package.json");
require("dotenv").config();

exports.theApp = async function(rootUrl){
  

  consola.info(`Connecting to ${process.env.DATABASE_URL}`)
  let db = await Mongoose.connect(process.env.DATABASE_URL);  


  consola.info("Initializing Passport service...");
  let passport = Passport.init({
    GoogleSettings: {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackUrl: `${rootUrl}/auth/google/callback`
    },
    GithubSettings: {
      clientID: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackUrl: `${rootUrl}/auth/github/callback`,
      scope: ["user:email"]
    }
  });

  consola.info("Initializing email...")
  Mail.init({
    host: process.env.SMTP_HOST,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD
  })

  return{
    db: db,
    passport: passport
  }
}