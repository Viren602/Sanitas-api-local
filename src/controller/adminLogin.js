import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import companyAdminModel from "../model/companyAdmin.js";
import companyFinancialYearModel from "../model/companyFinancialYear.js";
import companyGroupModel from "../model/companyGroup.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config/config.js";
import userLogModel from "../model/userLogModel.js";
import errorHandler from "../server/errorHandle.js";
import { CompanyGroup } from "../middleware/appSetting.js";
import mongoose from "mongoose";

const connections = {};

const getCompanyInfo = async (req, res) => {
    try {
        let response = [];
        const companyFinancialYear = await companyFinancialYearModel.find({});
        const companyGroup = await companyGroupModel.find({});
        const companyGroupName = CompanyGroup;
        response = {
            companyGroupName,
            companyGroup,
            companyFinancialYear
        }

        let responseData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: responseData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Admin Login controller", error);
        errorHandler(error, req, res, "Error in Admin Login controller")
    }
};

const getCompanyDataWithCompanyNameAndYear = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        const dbDetails = await companyFinancialYearModel.findOne({
            CompanyName: data.companyName,
            CompanyYear: data.financialYear
        });

        const databaseName = dbDetails.databaseName;
        await mongoose.disconnect();
        const dbURI = `mongodb+srv://fenil2502:KRMHA7bwog8xnGso@fenilapi.de2pm.mongodb.net/${databaseName}?retryWrites=true&w=majority&appName=FenilApi`;

        const connection = await mongoose.connect(dbURI);
        const dbName = connection.connections[0].name;
        console.log(`Connected to MongoDB: ${dbName}`);

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
        console.log(user)
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

                // return res.status(401).json({ message: 'Invalid credentials' });
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
    getCompanyInfo,
    userAuthentication,
    getCompanyDataWithCompanyNameAndYear
};
