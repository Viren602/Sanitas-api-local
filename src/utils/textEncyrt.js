import dotenv from "dotenv"
import crypto from "crypto-js";
dotenv.config()
export const encryptionData = (text) => {
    const encryptedText = crypto.AES.encrypt(
        JSON.stringify(text),
      process.env.CRYPTO_ENCRYPT_KEY
    ).toString();
    console.log("encryptedText", encryptedText, text);
    const urlSafeEncryptedText = encryptedText
      .replace(/\+/g, "xMl3Jk")
      .replace(/\//g, "Por21Ld")
      .replace(/=/g, "Ml32");
    return urlSafeEncryptedText;
  };