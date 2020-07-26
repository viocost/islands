const { WebServiceAdmin } = require("../server/WebService");
const { join, normalize } = require("path")


global.VERSION = "2.1.0"

let viewsPath = normalize(join(__dirname, "..", "server", "views"))
let staticPath = normalize(join(__dirname, "..", "public"))


const ws = new WebServiceAdmin({ port: 4000, host: "127.0.0.1", staticPath: staticPath, viewsPath: viewsPath })
ws.launch()
