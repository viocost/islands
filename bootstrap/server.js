const express = require("express");
const app = express();
const bodyParser = require("body-parser");
// const SourceHandler = require("./SourceHandler");

const cjson = require("circular-json");

app.set('views', __dirname);
app.set('view engine', 'pug');
app.use(bodyParser.json())

app.get("/", (req, res)=>{
    res.render("index");
})

app.post("/bootstrap", (req, res)=>{
    console.log(`Got data: ${JSON.stringify(req.body)}`);
    console.log(`Got request: ${req.params}`);
    res.status(200).send({res: "ok"})
})

const server = app.listen(4000, '0.0.0.0', ()=>{
    console.log("Server running...")
})
