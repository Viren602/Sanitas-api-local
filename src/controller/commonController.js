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
        let icModel = await ItemCategory()
        let response = await icModel.find({});
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
        let hcModel = await HNSCodesScHema()
        let response = await hcModel.find({});
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
        let scModel = await storageConditionModel()
        let response = await scModel.find({});
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
        let rmCModel = await rmCategoryModel()
        let response = await rmCModel.find({});

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
        let pmcModel = await pmCategoryModel()
        let response = await pmcModel.find({});

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
        let pmsModel = await packingMaterialSizeModel()
        let response = await pmsModel.find({});

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
        let sModel = await stateModel()
        let response = await sModel.find({});

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
        let sModel = await stereoModel()
        let response = await sModel.find({});

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
        let lcModel = await labelClaimModel()
        let response = await lcModel.find({});

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
        let cModel = await colorModel()
        let response = await cModel.find({});

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
        let mlModel = await mfgLicModel()
        let response = await mlModel.find({});

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
        let pstageModel = await productionStageModel()
        let response = await pstageModel.find({});

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
        let pSizeModel = await punchSizeModel()
        let response = await pSizeModel.find({});

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
        let acModel = await accountGroupModel()
        let response = await acModel.find({});

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
        let tcModel = await transportCourierModel()
        let response = await tcModel.find(queryObject).sort("transportName");


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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let queryObject = { isDeleted: false }
        if (reqId && reqId.trim() !== "") {
            queryObject.daybookName = { $regex: `^${reqId}`, $options: "i" };
        }

        let dbMasterModel = await daybookMasterModel()
        let response = await dbMasterModel.find(queryObject);

        for (let i = 0; i < response.length; i++) {
            const accountCode = response[i].acGroupCode;
            let accountCodeName = '';
            if (accountCode) {
                let acModel = await accountGroupModel()
                const accountGroup = await acModel.findOne({ accountGroupCode: accountCode });
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
        let pModel = await partyModel()
        let response = await pModel.find(queryObject).select("partyName email transporterName maintainAc gstnNo state").sort("partyName");

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
        let cIModel = await companyItems()
        let response = await cIModel.find(queryObject).select("ItemName Packing UnitQuantity JobCharge TestingCharge ProdLoss BasicRate UOM").sort("ItemName");

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
        let pdModel = await productDetailsModel()
        let data = await pdModel.find(queryObject).select("productName").sort("productName");

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
        let rmModel = await rawMaterialSchema()
        let data = await rmModel.find(queryObject).select("rmName rmUOM").sort("rmName");

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
        let mpModel = await packingMaterialSchema()
        let data = await mpModel.find(queryObject).select('pmName pmUOM').sort("pmName");

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
        let uSCHMOdel = await UsersSCHM()
        let data = await uSCHMOdel.find(queryObject);

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
