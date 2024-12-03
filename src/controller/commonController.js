import HNSCodesScHema from "../model/hnsCode.js";
import ItemCategory from "../model/itemCategory.js";
import packingMaterialSizeModel from "../model/packingMaterialSizeModel.js";
import pmCategoryModel from "../model/pmCategoryModel.js";
import rmCategoryModel from "../model/rmCategoryModel.js";
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



export {
    getAllItemCategory,
    getAllHSNCode,
    getAllStorageConditions,
    getAllRMCategory,
    getAllPMCategory,
    getAllPackingMaterialSize
};
