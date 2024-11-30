import config from "./config/config.js"
import server from "./server/index.js";

server.listen(config.PORT,async()=>{
    try {
        console.log("server is running on PORT :: ", config.PORT)
    } catch (error) {
        console.log('err',error)
    }
})