// const nodemailer = require("nodemailer");
import nodemailer from "nodemailer"


const mailsender = async ({ toMail, html, subject, fromMail }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'it@nkp.group',
      pass: 'mckf woqb ponx ijfc',
    },
  });

  const mailOptions = {
    from: fromMail,
    to: toMail,
    subject: subject,
    html: html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("===================");
      console.log("User Email Error", error);
      console.log("===================");
    } else {
      console.log('Email sent: ', "succesfully");
    }
  });
};

export default mailsender;
