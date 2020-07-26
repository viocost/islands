const mocha = require("mocha")
const { assert, expect } = require("chai")
const fs = require("fs-extra")
const path = require("path")
const { VaultDirectory } = require("../server/Vault")


const vaultsBasePath = path.join(__dirname, "vaults")

function createVault(basePath, name){
    const vaultPath = path.join(basePath, name)
    const vault = new VaultDirectory(vaultPath)
    return vault
}
describe("vault", ()=>{


    before(()=>{
        console.log("setting up test base dir");
        if(fs.existsSync(vaultsBasePath)){
            fs.removeSync(vaultsBasePath)
        }
        fs.mkdirSync(vaultsBasePath)
    })

    it("Should create empty vault directory", ()=>{
        createVault(vaultsBasePath, "admin")
        assert(fs.existsSync(path.join(vaultsBasePath, "admin")));
    })


    it("Should return null when blob not found", ()=>{
        const vault = createVault(vaultsBasePath, "admin")
        let blob = vault.getBlob("not-exist")
        assert(blob === null)
    })

    it("Should write a blob into a file", ()=>{
        const vault = createVault(vaultsBasePath, "admin")
        vault.saveBlob("test", "hello");
        let data = fs.readFileSync(path.join(vaultsBasePath, "admin", "test"), "utf8")
        assert(data === "hello")

    })

    it("Should write a blob into a file in nested directory and read from it", ()=>{
        const vault = createVault(vaultsBasePath, "admin")
        vault.saveBlob("testDir/test", "hello");
        let data = vault.getBlob("testDir/test")
        assert(data === "hello")
    })



    it("Should throw exceptiont for trying to write outside of parent directory", ()=>{

        function writeOutside(){
            const vault = createVault(vaultsBasePath, "admin")
            vault.saveBlob("testDir/../../test", "hello");
            let data = vault.getBlob("testDir/test")
            assert(data === "hello")
        }
        expect(writeOutside).to.throw();
    })


    it("Should throw exceptiont for trying to read data outside of parent directory", ()=>{
        function getFromOutside(){
            const vault = createVault(vaultsBasePath, "admin")

            vault.saveBlob("testDir/test", "hello");
            vault.getBlob("testDir/../../../test");
            let data = vault.getBlob("testDir/test")
            assert(data === "hello")
        }
        expect(getFromOutside).to.throw();
    })

    after(()=>{
        console.log("Cleaning up...");
        fs.removeSync(vaultsBasePath)
    })


})
