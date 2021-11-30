const User = require("../lib/models/user");
describe("User basics", () => {
  let userData;
  before(async function(){
    await User.deleteMany({});
    userData = {
      id: "TEST", 
      name: "Baby Driver", 
      email: "baby@test.com", 
      password: "cheese beer thanks"
    };
  });
  
  it("will register a new user with email/password", async ()=> {
    const newUser = await User.register(userData);
    assert(newUser._id);
  });
  it("won't duplicate a emails for email/password", async ()=> {
    const res = await User.register(userData);
    assert(!res.success);
  });

  it("will authenticate our new user", async () => {
    const result = await User.login({email: userData.email, password:"cheese beer thanks"});
    assert(result._id);
  })
  it("will authenticate our new user by magic token", async () => {
    const user = await User.login({email: userData.email, password:"cheese beer thanks"});
    await user.setLoginToken();
    const result = await User.tokenLogin(user.loginToken);
    assert(result);
  })

   it("will locate a user based on provider login", async () => {
    const payload = {
      provider: "google",
      profile: {
        id: "TEST",
        name: "BUDDY",
        email: "test2@test.com",
        picture: "pic",
        data: {}
      }
    }
    const res = await User.oAuthLogin(payload);
    assert(res._id)
  })
  it("will add a provider if they login with same email, new provider", async () => {
    const payload = {
      provider: "github",
      profile: {
        id: "TEST",
        name: "BUDDY",
        email: "test2@test.com",
        picture: "pic",
        data: {}
      }
    }
    const res = await User.oAuthLogin(payload);
    assert(res.google)
    assert(res.github)
  });
  
  it("will record that our friend is back", async () => {
    const payload = {
      provider: "github",
      profile: {
        id: "TEST",
        name: "BUDDY",
        email: "test2@test.com",
        picture: "pic",
        data: {}
      }
    }
    const res = await User.oAuthLogin(payload);
    assert.equal(res.signInCount,2);
  })


})