const express = require("express");
const app = express();
const SourceHandler = require("./SourceHandler");

app.get("/", (req, res)=>{
    res.send("hello!");
})

const server = app.listen(4000, '0.0.0.0', ()=>{
    console.log("Server running...")
})
