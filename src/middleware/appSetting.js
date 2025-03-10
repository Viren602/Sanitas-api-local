import config from "../config/config.js";
const isProd = config.PRODUCTION

// AESKey for encryption and decryption
export const Value1 = "P1Pw0sggFsebE+Tqt+REGQ==";

// AESIV for encryption and decryption
export const Value2 = "JIeoMo1pNWQHoF92sLQqyQ==";

export const IsEncryption = true;

export const FromMail = (isProd === 'true' ? "sanitashealthcareinfo@gmail.com" : "zyden.itsolutions@gmail.com");

export const ErrorSubject = "Error in Sanitas Software";

export const ErrorMessage = `{Oops! Something went wrong. Please reach out at ${isProd === 'true' ? 'info@zyden-it.com' : 'zyden.itsolutions@gmail.com'}. We appreciate your patience!}`;

export const ENV = (isProd === 'true' ? "Production" : "Local");

export const CompanyGroup = "SANITAS GROUP";

export const ErrorMail = (isProd === 'true' ? "info@zyden-it.com" : "zyden.itsolutions@gmail.com");

