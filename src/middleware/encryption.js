import CryptoJS from "crypto-js";
import { Value1, Value2 } from "./appSetting.js";

const Key = CryptoJS.enc.Base64.parse(Value1);
const IV = CryptoJS.enc.Base64.parse(Value2);

function hexStringToBase64String(hex) {
    const byteArray = [];
    for (let i = 0; i < hex.length; i += 2) {
        byteArray.push(parseInt(hex.substr(i, 2), 16));
    }
    const base64 = btoa(String.fromCharCode.apply(null, byteArray));
    return base64;
}

function aesDecrypt(encryptedData, isDecrypt) {
    if (!isDecrypt) {
        return encryptedData;
    }

    const encryptedBytes = CryptoJS.enc.Base64.parse(encryptedData);

    const decryptedBytes = CryptoJS.AES.decrypt(
        { ciphertext: encryptedBytes },
        Key,
        {
            iv: IV,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }
    );

    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decryptedText;
}

const getRequestData = (apiData, API, isDecrypt = true) => {

    const base64Data = hexStringToBase64String(apiData);

    const decryptedData = aesDecrypt(base64Data, isDecrypt);
    if (API === 'PostApi') {
        return JSON.parse(decryptedData);
    } else {
        return decryptedData;
    }
};

// // encryption for api request
const encryptionAPI = (data, string) => {
    // Encrypt
    if (string === 1)
        data = JSON.stringify(data);

    var encprtArray = CryptoJS.enc.Utf8.parse(data);
    var decryptedText = CryptoJS.AES.encrypt(encprtArray, Key,
        {
            iv: IV,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
    return decryptedText.ciphertext.toString(CryptoJS.enc.based64);
}

export { getRequestData, encryptionAPI };
