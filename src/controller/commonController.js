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

const getAllItemCategory = async (req, res) => {
    try {
        let response = await ItemCategory.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllHSNCode = async (req, res) => {
    try {
        let response = await HNSCodesScHema.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllStorageConditions = async (req, res) => {
    try {
        let response = await storageConditionModel.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllRMCategory = async (req, res) => {
    try {
        let response = await rmCategoryModel.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllPMCategory = async (req, res) => {
    try {
        let response = await pmCategoryModel.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllPackingMaterialSize = async (req, res) => {
    try {
        let response = await packingMaterialSizeModel.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllStates = async (req, res) => {
    try {
        let response = await stateModel.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllStereoData = async (req, res) => {
    try {
        let response = await stereoModel.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllLabelClaims = async (req, res) => {
    try {
        let response = await labelClaimModel.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllColors = async (req, res) => {
    try {
        let response = await colorModel.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllMfgLicMaster = async (req, res) => {
    try {
        let response = await mfgLicModel.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllProductionStageMaster = async (req, res) => {
    try {
        let response = await productionStageModel.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllPunchSizes = async (req, res) => {
    try {
        let response = await punchSizeModel.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllAccountGroups = async (req, res) => {
    try {
        let response = await accountGroupModel.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllTransportCourier = async (req, res) => {
    try {
        const { id } = req.query;
        let queryObject = { isDeleted: false }
        if (id && id.trim() !== "") {
            queryObject.transportName = { $regex: `^${id}`, $options: "i" };
        }
        let response = await transportCourierModel.find(queryObject).sort("transportName");
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
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

        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllPartyDropdown = async (req, res) => {
    try {
        let queryObject = { isDeleted: false }
        let response = await partyModel.find(queryObject).select("partyName").sort("partyName");

        res.status(200).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};


const getAllItem = async (req, res) => {
    try {
        let queryObject = { IsDeleted: false }
        let response = await companyItems.find(queryObject).select("ItemName").sort("ItemName");

        res.status(200).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllProductDropdown = async (req, res) => {
    try {
        let queryObject = { isDeleted: false }
        let data = await productDetailsModel.find(queryObject).select("productName").sort("productName");

        res.status(200).json({ Message: "Product fetched successfully", responseContent: data });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllRMDropdown = async (req, res) => {
    try {
        let queryObject = { isDeleted: false }
        let data = await rawMaterialSchema.find(queryObject).select("rmName").sort("rmName");

        res.status(200).json({ Message: "Raw Material fetched successfully", responseContent: data });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllPackingMaterialDropdown = async (req, res) => {
    try {
        let queryObject = { isDeleted: false }
        let data = await packingMaterialSchema.find(queryObject).select('pmName').sort("pmName");

        res.status(200).json({ Message: "Packing Material fetched successfully", responseContent: data });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
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
    getAllPackingMaterialDropdown
};
