import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { blacklist } from "../controller/logout.js";

const checkAuth = (req, res, next) => {
    let token = req.cookies["token"] || req.headers.authorization;
    try {

        if (req.headers.authorization) {
            const parts = token.split(" ");
            if (parts.length === 2 && parts[0] === "Bearer") {
                token = parts[1];
            } else {
                return res.status(400).json({ "msg": "Invalid Authorization header format" });
            }
        }

        if (token) {
            if (blacklist.includes(token)) {
                res.send({ "msg": "user login again" });
            }
        }
        if (token) {
            jwt.verify(token, config.Secret_key, (err, decode) => {
                if (err) {
                    res.status(400).json({ "msg": err });
                } else {
                    // console.log("decode", decode);
                    next();
                }
            });
        } else {
            res.status(400).json({ "msg": "Token is not provided" });
        }
    } catch (error) {
        res.status(500).json({ "msg": "Error in token verification" });
    }
};

export default checkAuth;