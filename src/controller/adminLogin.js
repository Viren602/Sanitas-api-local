import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import companyAdminModel from "../model/companyAdmin.js";
import companyFinancialYearModel from "../model/companyFinancialYear.js";
import companyGroupModel from "../model/companyGroup.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config/config.js";
import userLogModel from "../model/userLogModel.js";
import errorHandler from "../server/errorHandle.js";
import { CompanyGroup, FromMail } from "../middleware/appSetting.js";
import mongoose from "mongoose";
import mailsender from "../utils/sendingEmail.js";
import connectToDatabase from "../utils/dbConnection.js";
import companySelectionMasterModel from "../model/companySelectionMasterModel.js";

const getClientIp = (req) => {
    return (
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        'Unknown'
    );
};

const getCompanyForCompanySelection = async (req, res) => {
    try {
        const CompanyMaster = await companySelectionMasterModel();
        const companySelection = await CompanyMaster.find({});

        let responseData = encryptionAPI(companySelection, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Admin Login controller", error);
        errorHandler(error, req, res, "Error in Admin Login controller")
    }
};

const getFinancialYearByCompanyName = async (req, res) => {
    try {
        const { id } = req.query;
        const CompanyMaster = await companyFinancialYearModel();
        const companyFinancialYear = await CompanyMaster
        .find({ CompanyName: id })
        .sort('CompanyYear');

        let responseData = encryptionAPI(companyFinancialYear, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Admin Login controller", error);
        errorHandler(error, req, res, "Error in Admin Login controller")
    }
};

const getCompanyDataWithCompanyNameAndYear = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        const CompanyMaster = await companyFinancialYearModel();
        // const companyFinancialYear = await CompanyMaster.find({});
        const dbDetails = await CompanyMaster.findOne({
            CompanyName: data.companyName,
            CompanyYear: data.financialYear
        });

        const databaseName = dbDetails.databaseName;
        await connectToDatabase(databaseName);
        // await mongoose.disconnect();
        // const dbURI = `mongodb+srv://fenil2502:KRMHA7bwog8xnGso@fenilapi.de2pm.mongodb.net/${databaseName}?retryWrites=true&w=majority&appName=FenilApi`;

        // const connection = await mongoose.connect(dbURI);
        // const dbName = connection.connections[0].name;
        // console.log(`Connected to MongoDB: ${dbName}`);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Databases are switched",
                responseData: null,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Admin Login controller", error);
        errorHandler(error, req, res, "Error in Admin Login controller")
    }
};

const userAuthentication = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let user = await companyAdminModel.findOne({ UserName: data.userName });
        console.log(data)
        if (user !== null) {
            const isPasswordValid = await bcrypt.compare(data.password, user.hashPassword);
            if (!isPasswordValid) {

                res.status(200).json({
                    data: {
                        statusCode: 401,
                        Message: "Invalid credentials",
                        responseData: null,
                        isEnType: true
                    },
                });
            } else {
                const token = jwt.sign({ userId: user._id }, config.Secret_key, { expiresIn: `${config.Session_TimeOut}m` });
                let expiryMinutes = config.Session_TimeOut;
                const now = new Date();
                const expiry = new Date(now.getTime() + expiryMinutes * 60 * 1000);

                let response = {
                    token: token,
                    userName: user.UserName,
                    location: user.Location,
                    status: user.Status,
                    sessionTimeout: config.Session_TimeOut,
                    expires: expiry,
                    roleId: user.roleId
                }

                const currentDevice = req?.headers['user-agent'];
                const ipAddress = getClientIp(req);

                let reqData = {
                    userName: user.UserName,
                    token: token,
                    email: user.email,
                    sessionTimeout: config.Session_TimeOut,
                    expires: expiry,
                    device: currentDevice ? currentDevice : 'Unknown'
                }
                const userLogData = new userLogModel(reqData);
                await userLogData.save();

                let html = `<html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body>
                    <h1><strong>Someone Logged in</strong></h1>
                    <p><strong>UserName:</strong> ${user.UserName || ''}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Time:</strong> ${data.currentDateTimeFromUserSystem}</p>
                    <p><strong>IP Address:</strong> ${ipAddress}</p>
                    <p><strong>Device:</strong> ${currentDevice ? currentDevice : 'NA'}</p>
                </body>
                </html>`

                let emaildata = {
                    toMail: FromMail,
                    subject: '"User Login Alert!!!',
                    fromMail: FromMail,
                    html: html,
                };

                // mailsender(emaildata)

                let responseData = encryptionAPI(response, 1)
                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Logged in successfully",
                        responseData: responseData,
                        isEnType: true
                    },
                });
            }
        } else {
            res.status(200).json({
                data: {
                    statusCode: 201,
                    Message: "User not found",
                    responseData: null,
                    isEnType: true
                },
            });

            // res.status(201).json({ Message: "User not found", statusCode: 404, responseContent: [] });
        }

    } catch (error) {
        console.log("Error in Admin Login controller", error);
        errorHandler(error, req, res, "Error in Admin Login controller")
    }
};


export {
    getFinancialYearByCompanyName,
    userAuthentication,
    getCompanyDataWithCompanyNameAndYear,
    getCompanyForCompanySelection
};
