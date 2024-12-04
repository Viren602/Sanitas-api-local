import colorModel from "../model/colorModel.js";
import HNSCodesScHema from "../model/hnsCode.js";
import ItemCategory from "../model/itemCategory.js";
import labelClaimModel from "../model/labelClaimMaster.js";
import mfgLicModel from "../model/mfgLicMaster.js";
import packingMaterialSizeModel from "../model/packingMaterialSizeModel.js";
import pmCategoryModel from "../model/pmCategoryModel.js";
import productionStageModel from "../model/productionStageModel.js";
import rmCategoryModel from "../model/rmCategoryModel.js";
import stateModel from "../model/stateModel.js";
import stereoModel from "../model/stereoMasterModel.js";
import storageConditionModel from "../model/storageConditionModel.js";

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
    getAllProductionStageMaster
};
