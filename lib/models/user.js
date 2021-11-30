const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require("shortid");

//this is a reasonable starting point for a User class
//right now the auth is handled in the model, but you might
//want to consider moving that logic to a service class
//for now, we start small and simple
const salt = crypto.randomBytes(16).toString("hex");

const hashPassword = function(pw){
  return crypto.scryptSync(pw,salt,64).toString('hex');
}

const updateStats = function(user){
  user.lastSignIn = user.signedInAt;
  user.signedInAt = Date.now();
  user.signInCount += 1;
}

const UserSchema = new Schema({
  id: {
    type: String,
    required: true,
    default: shortid.generate()
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  avatar: String,
  hashedPassword: String,
  signedInAt: {
    type: Date,
    default: Date.now
  },
  lastSignIn: {
    type: Date,
    default: Date.now
  },
  signInCount: {
    type: Number,
    default: 1
  }, 
  resetToken: String,
  resetTokenExpires: Date,
  loginToken: String,
  loginTokenExpires: {
    type: Date,
    default: Date.now
  },
  google: String,
  github: String
});


UserSchema.methods.setLoginToken = async function(){  

  this.loginToken = shortid.generate();
  const expireDate = new Date();
  expireDate.setHours(expireDate.getHours() + (24 * 14)); //expires in two weeks
  this.loginTokenExpires = expireDate;
  await this.save();
}

UserSchema.statics.tokenLogin = async function(token){  
  console.log(token);
  const found = await this.findOne({"loginToken" : token});
  if(found) {
    if(found.loginTokenExpires.getTime() > new Date().getTime()){
      updateStats(found);
      await found.save();
      return found;
    }
  }
  return null;
}

UserSchema.statics.login = async function({email, password}){  
  const found = await this.findOne({email: email});
  if(found) {
    const untrustedHash = hashPassword(password);
    if(found.hashedPassword === untrustedHash) {
      updateStats(found);
      await found.save();
      return found;
    }
  }
  return null;
}

UserSchema.statics.oAuthLogin = async function({provider, profile}){
  //the logic here is that they've validated already who they are
  //with the external provider. All we need do is log it and make sure
  //we don't trample an existing user
  //these credentials should pass back an email, some kind of identifier
  //maybe an image...
  let user = await this.findOne({email: profile.email});
  
  if(user){
    if(user[provider]){
      updateStats(user);
      return user;
    } 
    //add a provider
    user[provider] = profile.id;
    await user.save();

  }else{
    const emailHash = crypto.createHash('md5').update(profile.email).digest("hex");
    const gravatar = `https://www.gravatar.com/avatar/${emailHash}.jpg`
    
    //create user and hash the password
    const newUser = {
      id: profile.id,
      name: profile.name,
      email: profile.email,  
      avatar: profile.picture || gravatar,
      identities: {}
    }
    //save it
    newUser[provider] = profile.id;
  
    //save
    user = await this.create(newUser);
    
  }

  return user;

}

UserSchema.statics.register = async function({id, name, email, password}){
  //make sure they don't already exist with this email
  if(!id) id = shortid.generate();
  const exists = await this.findOne({email: email});
  if(exists) return {success: false, message: "Email is already in use"};
  const emailHash = crypto.createHash('md5').update(email).digest("hex");
  const gravatar = `https://www.gravatar.com/avatar/${emailHash}.jpg`
  
  //create user and hash the password
  const newUser = {
    id: id,
    name: name,
    email: email,  
    hashedPassword: hashPassword(password),
    avatar: gravatar
  }

  //save
  const saved = await this.create(newUser);
  return saved;
}

const User = mongoose.model('User', UserSchema);
module.exports = User;