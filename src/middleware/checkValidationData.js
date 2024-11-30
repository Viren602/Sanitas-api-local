import crypto from "crypto-js";
import config from "../config/config.js";

const checkValidate = async (req, res, next) => {
  try {
    console.log(req.body.data)
    var bytes = crypto.AES.decrypt(req.body.data, config.CryptoKey);
    req.body = JSON.parse(bytes.toString(crypto.enc.Utf8));
    console.log("Decrypted data:", req.body);

  } catch (error) {
    console.log("Error in validation middleware", error);
    res.status(500).json({ msg: "Error in validation middleware" });
  }
};

export default checkValidate;
