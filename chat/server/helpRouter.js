const express = require("express");
const router = express.Router();

let VERSION;
try{
    VERSION = "v" + JSON.parse(fs.readFileSync('package.json').toString()).version
}catch(err){
    console.log("Failed to set version: " + err );
    VERSION = "version unknown";
}

router.get('/', (req, res)=>{
   res.render("help", {version: VERSION, title: "Islands chat - USER GUIDE", chapter: "main" })
});




module.exports = router;