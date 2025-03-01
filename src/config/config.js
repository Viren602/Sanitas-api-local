import dotenv from "dotenv";
dotenv.config();

const config = {
  DB: process.env.DB,
  PORT: process.env.PORT || 4001,
  URL: process.env.URL,
  PRODUCTION : process.env.PRODUCTION,
  CryptoKey:process.env.CRYPTO_ENCRYPT_KEY,
  Secret_key:process.env.Secret_key,
  Session_TimeOut:process.env.Session_TimeOut,
  YEAR_DBCONNECTION: process.env.YEAR_DBCONNECTION,
  MASTER_DB: process.env.MASTER_DB,
};

export default config;