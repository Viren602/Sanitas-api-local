import dotenv from "dotenv";
dotenv.config();

const config = {
  DB: process.env.DB,
  PORT: process.env.PORT || 4001,
  URL: process.env.URL,
  PRODUCTION : process.env.PRODUCTION,
  CryptoKey:process.env.CRYPTO_ENCRYPT_KEY,
  Secret_key:process.env.Secret_key
};

export default config;