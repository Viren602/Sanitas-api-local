import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import companyAdminModel from "../model/companyAdmin.js";
import companyFinancialYearModel from "../model/companyFinancialYear.js";
import companyGroupModel from "../model/companyGroup.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config/config.js";

const getCompanyInfo = async (req, res) => {
    try {
        let response = [];
        const companyFinancialYear = await companyFinancialYearModel.find({});
        const companyGroup = await companyGroupModel.find({});
        response = {
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
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const userAuthentication = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let user = await companyAdminModel.findOne({ UserName: data.userName });
        if (user !== null) {
            const isPasswordValid = await bcrypt.compare(data.password, user.hashPassword);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
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
                expires: expiry
            }

            let responseData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Logged in successfully",
                    responseData: responseData,
                    isEnType: true
                },
            });

            // res.status(200).json({
            //     Message: "Logged in successfully",
            //     responseContent: response
            // });

        } else {
            res.status(201).json({ Message: "User not found", statusCode: 404, responseContent: [] });
        }

    } catch (error) {
        console.log("error in admin controller", error);
        res.status(500).json({ error: error.message });
    }
};


export {
    getCompanyInfo,
    userAuthentication
};
