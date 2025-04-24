import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import adminRoleModel from "../model/adminRoleModel.js";
// import adminRoleModel from "../model/adminroleModel.js";
import companyAdminModel from "../model/companyAdmin.js";
import companyGroupModel from "../model/companyGroup.js";
import userLogModel from "../model/userLogModel.js";
import errorHandler from "../server/errorHandle.js";
import bcrypt from "bcryptjs";

const getUserProfile = async (req, res) => {
    try {
        let CompanyGroupSchema = await companyGroupModel()
        let response = await CompanyGroupSchema.findOne({});
        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
    } catch (error) {
        console.log("Error in Utility controller", error);
        errorHandler(error, req, res, "Error in Utility controller")
    }
};

const addEditUserProfile = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let CompanyGroupSchema = await companyGroupModel()
            const response = await CompanyGroupSchema.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "User Profile Updated Successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

            } else {
                res.status(404).json({ Message: "User Profile Not Found" });
            }
        } else {
            let CompanyGroupSchema = await companyGroupModel()
            const response = new CompanyGroupSchema(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "User Profile Added Successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in Utility controller", error);
        errorHandler(error, req, res, "Error in utility controller")
    }
};
const getAllAdminRoles = async (req, res) => {
    try {
        let adminRoleSchema = await adminRoleModel()
        let response = await adminRoleSchema.find({});
        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
    } catch (error) {
        console.log("Error in Utility controller", error);
        errorHandler(error, req, res, "Error in Utility controller")
    }
};
const getAllAdminsByCompanyId = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        console.log(reqId);
        let queryObject = {
            companyId: reqId,
            isDeleted: false
        };
        let companyAdminSchema = await companyAdminModel()
        let response = await companyAdminSchema
            .find(queryObject)
            .populate('roles', 'roleName')
        console.log(response);
        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Utility controller", error);
        errorHandler(error, req, res, "Error in Utility controller")
    }
};
const getadminById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let queryObject = {
            _id: reqId
        };
        let companyAdminSchema = await companyAdminModel()
        let response = await companyAdminSchema
            .findOne(queryObject)
            .populate('roles')
        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Utility controller", error);
        errorHandler(error, req, res, "Error in Utility controller")
    }
};
const addEditAdmin = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        console.log(data);
        let hashPassword = await bcrypt.hash(data.Password, 10)
        data.hashPassword = hashPassword
        console.log(hashPassword);
        if (data._id && data._id.trim() !== '') {
            let companyAdminSchema = await companyAdminModel()
            const response = await companyAdminSchema.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Admin Role Updated Successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

            } else {
                res.status(404).json({ Message: "Admin Data Not Found" });
            }
        } else {
            let companyAdminSchema = await companyAdminModel()
            const response = new companyAdminSchema(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Admin Role Added Successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in Utility controller", error);
        errorHandler(error, req, res, "Error in utility controller")
    }
};
const deleteAdminById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)

        // Removing GST Invoice Finish Goods Record
        let companyAdminSchema = await companyAdminModel()
        let response = await companyAdminSchema.findByIdAndUpdate(reqId, { isDeleted: true })

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Admin Role Deleted Successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in utility controller", error);
        errorHandler(error, req, res, "Error in utility controller")
    }
};
const getAllUserLog = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        console.log(data);
        let queryObject = {}
        if (data.startDate && data.endDate) {
            let endDate = new Date(data.endDate);
            endDate.setHours(23, 59, 59, 999);
            queryObject.createdAt = {
                $gte: new Date(data.startDate),
                $lte: endDate,
            };
        }
        let userLogSchema = await userLogModel()
        let Response = await userLogSchema
            .find(queryObject)
        const response = [...Response].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in utility Controller", error);
        errorHandler(error, req, res, "Error in utility Controller")
    }
};
export {
    getUserProfile,
    addEditUserProfile,
    getAllAdminsByCompanyId,
    getAllAdminRoles,
    getadminById,
    addEditAdmin,
    deleteAdminById,
    getAllUserLog
};