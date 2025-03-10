import config from "../config/config.js";
const isProd = config.PRODUCTION
const globals = {
  Database: isProd === 'true' ? "" : "PharmaSoftware",
};

export default globals;