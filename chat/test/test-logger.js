const logger = require("../old_server/classes/libs/Logger")

describe("This tests logger", ()=>{

    it("Should not fail if logger not initialized", ()=>{
        logger.info("test")

    })

})
