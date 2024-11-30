import config from "../config/config.js";

import mailsender from "../utils/sendingEmail.js";
import crypto from "crypto-js"
import jwt from "jsonwebtoken";
let store = new Map();
 export const userLogin = async (req, res) => {
  try {
    var bytes = crypto.AES.decrypt(
      req.body.data,
      config.CryptoKey
    );
    req.body = JSON.parse(bytes.toString(crypto.enc.Utf8));
    const { email } = req.body;

    const checkUser = await CompanyUser.findOne({email:req.body.email});
    if (checkUser) {
      const randomNumber = Math.floor(Math.random() * 900000) + 100000;
      store.set(email, randomNumber);
      console.log(`Stored OTP for ${email}: ${randomNumber}`);
      let emaildata = {
        toMail: email,
        subject: "OTP LOGIN",
        fromMail: "skdj@gmail.com",
        html: `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>OTP Verification</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f4f4f4;
                        }
                
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            padding: 20px;
                            background-color: #fff;
                            border-radius: 5px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                
                        h2 {
                            color: #333;
                        }
                
                        p {
                            color: #555;
                            line-height: 1.6;
                        }
                
                        .otp {
                            font-size: 24px;
                            font-weight: bold;
                            color: #4caf50;
                            margin: 20px 0;
                        }
                
                        .btn-verify {
                            display: inline-block;
                            padding: 10px 20px;
                            background-color: #4caf50;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                
                        .btn-verify:hover {
                            background-color: #45a049;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>OTP Verification</h2>
                        
                        <p>To complete your login, please use the following One-Time Password (OTP):</p>
                        <div class="otp">${randomNumber}</div>
                        <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                       
                        <p>If you did not request this OTP, please ignore this email.</p>
                        <p>Best regards,<br />Your Company Name</p>
                    </div>
                </body>
                </html>
                
              `,
      };

      console.log("otp", randomNumber);
      // mailsender(emaildata);
      mailsender(emaildata)
      res.status(200).json({ Message: "OTP Send Succesfully" });
    } else {
      res
        .status(404)
        .json({ Message: "Email  is not Found  Register  Your Company" });
    }
  } catch (error) {
    console.log("error in logo controller", error);
    res.status(500).json({ err: error.Message });
  }
};

 export const verifyOtp = async (req, res) => {
  try {
    var bytes = crypto.AES.decrypt(
      req.body.data,
      config.CryptoKey
    );
    req.body = JSON.parse(bytes.toString(crypto.enc.Utf8));
    console.log("verifyOtp", store);
    const { email, otp } = req.body;

    console.log("otttpppverify", otp);
    const storedOtp = store.get(email);
    console.log("stored", storedOtp);

    if (storedOtp && storedOtp === parseInt(otp, 10)) {
      store.delete(email);
      const response = await CompanyUser.findOne({email:req.body.email});
      console.log("resss", response);

      const token = jwt.sign({ message: "shaurya" }, config.Secret_key, { expiresIn: "7d" });
       console.log("token",token)
       res.cookie("token", token, {
        httpOnly: false,
        secure: false, // Use secure cookies in production
        maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
        sameSite: 'Lax' // Use 'Lax' or 'None' if your frontend and backend are on different domains
      });


      let newdata = crypto.AES.encrypt(
        JSON.stringify(response),
       config.CryptoKey
      ).toString();
      res
        .status(200)
        .json({ Message: "OTP verified successfully", data: newdata ,"token":token });
    } else {
      res.status(400).json({ Message: "Invalid OTP" });
    }
  } catch (error) {
    console.log("error in verifyOtp controller", error.message);
    res.status(500).json({ err: error.message });
  }
};
