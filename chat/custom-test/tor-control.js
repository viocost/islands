const TorController = require("../old_server/classes/libs/TorController")

/**
 * there must be an instance of tor running with open control port
 */

let controller = new TorController({host: "127.0.0.1", port: "9051", password: "test" })

let existingOnion = {
    key: "ED25519-V3:UJL1wgWVeMz9f7oM+Xrbq0i8tJ2/aeBi3K0cl8VCrlicSts8Gg98agO5DUXHjsfQb+yooLgN0CB0Y0A9U0rMUQ==",
    id: "lixeu6rs37zqvehpsbe3pxndt64clfjnmwra7zth6svxurmghtvsnmid"
}

controller.createNewOnion({ host: "127.0.0.1", port: 4000 })
          .then(response=>{
              console.log("Successfully created")
              console.log(JSON.stringify(response));
              return controller.launchOnionWithKey({host: "127.0.0.1", port: 4000, key: existingOnion.key})
          })
          .then(response=>{
              console.log(`Existing service launched.\nId: ${response.ServiceID}\nExpected: ${existingOnion.id}`);

              console.log(JSON.stringify(response));
          })
          .catch(err=>{
              console.log(`Test failed: ${err}`);
          })
