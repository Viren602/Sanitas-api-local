// Import the Express app
import fs from "fs";
import http from "http";
import https from "https";
import app from "./expressApp.js"
import "./routes.js"
// import { config } from "dotenv";
import config from "../config/config.js";

let server;
const flag = config.PRODUCTION; // Flag to determine the environment (production or local)

// Check the flag to determine which type of server to create
if (flag == "true") {
    // console.log(flag)
    // // Read SSL certificate files for HTTPS server
    // const options = {
    //     key: fs.readFileSync('./certs/privkey.pem'), // Private key
    //     cert: fs.readFileSync('./certs/cert.pem'), // Certificate
    //     requestCert: false,
    //     rejectUnauthorized: false
    // };
    // // Create HTTPS server with the given options and app
    // server = https.createServer(options, app);
    server = http.createServer(app);
} else {
    // Create HTTP server with the app
    server = http.createServer(app);
}
export default server

// Export the server for use in other modules