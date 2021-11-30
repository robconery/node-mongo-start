const boot = require("./config/boot");
const mail = require("./mail");

const User = require("./lib/models/user");
const go = async function(){

  await boot.theApp();
  console.log("Registering myself");
  await User.deleteMany({})
  const user = await User.register({id: "ROB", name: "Rob Conery", email: "rob@conery.io", password: "slonst"});
  //const res = await mail.sendMagicLink("http://localhost:3000","rob@conery.io");
  console.log(user);
}()