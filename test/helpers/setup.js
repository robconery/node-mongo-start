//const Massive = require("massive");
const mongoose = require('mongoose');

before(async () => {
  await mongoose.connect('mongodb://localhost:27017/node-starter');
  
});

after(async () => {
  //close it offf
  await mongoose.connection.close();
})