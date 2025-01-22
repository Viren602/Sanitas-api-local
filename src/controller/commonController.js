import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import accountGroupModel from "../model/accountGroupModel.js";
import colorModel from "../model/colorModel.js";
import companyItems from "../model/companyItems.js";
import daybookMasterModel from "../model/daybookMasterModel.js";
import HNSCodesScHema from "../model/hnsCode.js";
import ItemCategory from "../model/itemCategory.js";
import labelClaimModel from "../model/labelClaimMaster.js";
import mfgLicModel from "../model/mfgLicMaster.js";
import packingMaterialSchema from "../model/packingMaterialModel.js";
import packingMaterialSizeModel from "../model/packingMaterialSizeModel.js";
import partyModel from "../model/partiesModel.js";
import pmCategoryModel from "../model/pmCategoryModel.js";
import productDetailsModel from "../model/productDetailsModel.js";
import productionStageModel from "../model/productionStageModel.js";
import punchSizeModel from "../model/punchSizeMasterModel.js";
import rawMaterialSchema from "../model/rawMaterialModel.js";
import rmCategoryModel from "../model/rmCategoryModel.js";
import stateModel from "../model/stateModel.js";
import stereoModel from "../model/stereoMasterModel.js";
import storageConditionModel from "../model/storageConditionModel.js";
import transportCourierModel from "../model/transportCourierModel.js";
import UsersSCHM from "../model/user.js";
import errorHandler from "../server/errorHandle.js";

const getAllItemCategory = async (req, res) => {
    try {
        let response = await ItemCategory.find({});
        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllHSNCode = async (req, res) => {
    try {
        let response = await HNSCodesScHema.find({});
        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllStorageConditions = async (req, res) => {
    try {
        let response = await storageConditionModel.find({});
        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });

    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllRMCategory = async (req, res) => {
    try {
        let response = await rmCategoryModel.find({});

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllPMCategory = async (req, res) => {
    try {
        let response = await pmCategoryModel.find({});

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllPackingMaterialSize = async (req, res) => {
    try {
        let response = await packingMaterialSizeModel.find({});

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllStates = async (req, res) => {
    try {
        let response = await stateModel.find({});

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllStereoData = async (req, res) => {
    try {
        let response = await stereoModel.find({});

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllLabelClaims = async (req, res) => {
    try {
        let response = await labelClaimModel.find({});

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllColors = async (req, res) => {
    try {
        let response = await colorModel.find({});

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllMfgLicMaster = async (req, res) => {
    try {
        let response = await mfgLicModel.find({});

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllProductionStageMaster = async (req, res) => {
    try {
        let response = await productionStageModel.find({});

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllPunchSizes = async (req, res) => {
    try {
        let response = await punchSizeModel.find({});

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllAccountGroups = async (req, res) => {
    try {
        let response = await accountGroupModel.find({});

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllTransportCourier = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let queryObject = { isDeleted: false }
        if (reqId && reqId.trim() !== "") {
            queryObject.transportName = { $regex: `^${reqId}`, $options: "i" };
        }
        let response = await transportCourierModel.find(queryObject).sort("transportName");

        
        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
        // res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllDaybooks = async (req, res) => {
    try {
        let response = await daybookMasterModel.find({});

        for (let i = 0; i < response.length; i++) {
            const accountCode = response[i].acGroupCode;
            let accountCodeName = '';
            if (accountCode) {
                const accountGroup = await accountGroupModel.findOne({ accountGroupCode: accountCode });
                accountCodeName = accountGroup ? accountGroup.accountGroupname : '';
            }
            response[i] = {
                ...response[i]._doc,
                accountCodeName,
            };
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllPartyDropdown = async (req, res) => {
    try {
        let queryObject = { isDeleted: false }
        let response = await partyModel.find(queryObject).select("partyName email").sort("partyName");

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(200).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};


const getAllItem = async (req, res) => {
    try {
        let queryObject = { IsDeleted: false }
        let response = await companyItems.find(queryObject).select("ItemName Packing UnitQuantity JobCharge TestingCharge ProdLoss BasicRate").sort("ItemName");

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(200).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllProductDropdown = async (req, res) => {
    try {
        let queryObject = { isDeleted: false }
        let data = await productDetailsModel.find(queryObject).select("productName").sort("productName");

        let encryptData = encryptionAPI(data, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(200).json({ Message: "Product fetched successfully", responseContent: data });
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllRMDropdown = async (req, res) => {
    try {
        let queryObject = { isDeleted: false }
        let data = await rawMaterialSchema.find(queryObject).select("rmName rmUOM").sort("rmName");

        let encryptData = encryptionAPI(data, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getAllPackingMaterialDropdown = async (req, res) => {
    try {
        let queryObject = { isDeleted: false }
        let data = await packingMaterialSchema.find(queryObject).select('pmName pmUOM').sort("pmName");

        let encryptData = encryptionAPI(data, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Packing Material fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
        
    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};

const getCompanyDetails = async (req, res) => {
    try {
        let queryObject = { isDeleted: false }
        let data = await UsersSCHM.find(queryObject);

        let encryptData = encryptionAPI(data, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Address details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Common controller", error);
        errorHandler(error, req, res, "Error in Common controller")
    }
};


export {
    getAllItemCategory,
    getAllHSNCode,
    getAllStorageConditions,
    getAllRMCategory,
    getAllPMCategory,
    getAllPackingMaterialSize,
    getAllStates,
    getAllStereoData,
    getAllLabelClaims,
    getAllColors,
    getAllMfgLicMaster,
    getAllProductionStageMaster,
    getAllPunchSizes,
    getAllAccountGroups,
    getAllTransportCourier,
    getAllDaybooks,
    getAllPartyDropdown,
    getAllItem,
    getAllProductDropdown,
    getAllRMDropdown,
    getAllPackingMaterialDropdown,
    getCompanyDetails
};
