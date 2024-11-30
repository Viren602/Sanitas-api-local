import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const checkSecurityLogin = (req, res, next) => {
  // Retrieve the token from cookies or authorization header
  let token = req.cookies["verificationToken"] || req.headers.authorization;
  console.log("verificationTokenMiddleWare", token);

  try {
    // Check if token is provided
    if (token) {
      jwt.verify(token, config.Secret_key, (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            // Token has expired
            res.status(401).json({ "msg": "Token has expired" });
          } else {
            // Other errors (e.g., invalid token)
            res.status(400).json({ "msg": "Invalid token" });
          }
        } else {
          // Token is valid, proceed to the next middleware
          console.log("decode", decoded);
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

export default checkSecurityLogin;
