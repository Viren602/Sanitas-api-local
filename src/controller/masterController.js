import colorModel from "../model/colorModel.js";
import labelClaimModel from "../model/labelClaimMaster.js";
import mfgLicModel from "../model/mfgLicMaster.js";
import packingMaterialSchema from "../model/packingMaterialModel.js";
import packingMaterialSizeModel from "../model/packingMaterialSizeModel.js";
import pmCategoryModel from "../model/pmCategoryModel.js";
import productionStageModel from "../model/productionStageModel.js";
import punchSizeModel from "../model/punchSizeMasterModel.js";
import rmCategoryModel from "../model/rmCategoryModel.js";
import stateModel from "../model/stateModel.js";
import stereoModel from "../model/stereoMasterModel.js";
import storageConditionModel from "../model/storageConditionModel.js";


const addEditPackingMaterial = async (req, res) => {
    try {
        let data = req.body.data
        if (data && data._id && data._id.trim() !== '') {
            const response = await packingMaterialSchema.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                res.status(200).json({ Message: "Item updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Item not found" });
            }
        } else {
            const response = new packingMaterialSchema(data);
            await response.save();
            res.status(200).json({ Message: "Item added successfully", data: response });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllPackingMaterials = async (req, res) => {
    try {
        const { id } = req.query;
        let queryObject = { isDeleted: false }
        if (id && id.trim() !== "") {
            queryObject.pmName = { $regex: `^${id}`, $options: "i" };
        }
        console.log(queryObject)
        let data = await packingMaterialSchema.find(queryObject).sort("pmName");

        res.status(200).json({ Message: "Items fetched successfully", responseContent: data });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getPackingMaterialById = async (req, res) => {
    try {

        const { id } = req.query;
        let response = {}
        if (id) {
            response = await packingMaterialSchema.findOne({ _id: id });
        }

        res.status(201).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deletePackingMaterialById = async (req, res) => {
    try {

        const { id } = req.query;
        let response = {}
        if (id) {
            response = await packingMaterialSchema.findByIdAndUpdate(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};
const addEditRMCategory = async (req, res) => {
    try {
        let data = req.body.data
        if (data._id && data._id.trim() !== '') {
            const response = await rmCategoryModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                res.status(200).json({ Message: "Category updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Category not found" });
            }
        } else {
            const response = new rmCategoryModel(data);
            await response.save();
            res.status(200).json({ Message: "Category added successfully", data: response });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteRMCategoryById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        console.log(id)
        if (id) {
            response = await rmCategoryModel.findByIdAndDelete(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addEditPMCategory = async (req, res) => {
    try {
        let data = req.body.data
        console.log(data)
        if (data._id && data._id.trim() !== '') {
            const response = await pmCategoryModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                res.status(200).json({ Message: "Category updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Category not found" });
            }
        } else {
            const response = new pmCategoryModel(data);
            await response.save();
            res.status(200).json({ Message: "Category added successfully", data: response });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deletePMCategoryById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        console.log(id)
        if (id) {
            response = await pmCategoryModel.findByIdAndDelete(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addEditPackingMaterialSize = async (req, res) => {
    try {
        let data = req.body.data
        if (data._id && data._id.trim() !== '') {
            const response = await packingMaterialSizeModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                res.status(200).json({ Message: "Category updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Category not found" });
            }
        } else {
            const response = new packingMaterialSizeModel(data);
            await response.save();
            res.status(200).json({ Message: "Category added successfully", data: response });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deletePackingMaterialSizeById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        console.log(id)
        if (id) {
            response = await packingMaterialSizeModel.findByIdAndDelete(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addEditStates = async (req, res) => {
    try {
        let data = req.body.data
        if (data._id && data._id.trim() !== '') {
            const response = await stateModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                res.status(200).json({ Message: "Category updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Category not found" });
            }
        } else {
            const response = new stateModel(data);
            await response.save();
            res.status(200).json({ Message: "Category added successfully", data: response });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteStateById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        console.log(id)
        if (id) {
            response = await stateModel.findByIdAndDelete(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addEditStereo = async (req, res) => {
    try {
        let data = req.body.data
        if (data._id && data._id.trim() !== '') {
            const response = await stereoModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                res.status(200).json({ Message: "Details updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            const response = new stereoModel(data);
            await response.save();
            res.status(200).json({ Message: "Details added successfully", data: response });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteStereoById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        console.log(id)
        if (id) {
            response = await stereoModel.findByIdAndDelete(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addEditLabelClaims = async (req, res) => {
    try {
        let data = req.body.data
        if (data._id && data._id.trim() !== '') {
            const response = await labelClaimModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                res.status(200).json({ Message: "Details updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            const response = new labelClaimModel(data);
            await response.save();
            res.status(200).json({ Message: "Details added successfully", data: response });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteLabelClaimById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        console.log(id)
        if (id) {
            response = await labelClaimModel.findByIdAndDelete(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addEditStorageConditions = async (req, res) => {
    try {
        let data = req.body.data
        if (data._id && data._id.trim() !== '') {
            const response = await storageConditionModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                res.status(200).json({ Message: "Details updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            const response = new storageConditionModel(data);
            await response.save();
            res.status(200).json({ Message: "Details added successfully", data: response });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteStorageConditionById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        console.log(id)
        if (id) {
            response = await storageConditionModel.findByIdAndDelete(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addEditColors = async (req, res) => {
    try {
        let data = req.body.data
        if (data._id && data._id.trim() !== '') {
            const response = await colorModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                res.status(200).json({ Message: "Details updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            const response = new colorModel(data);
            await response.save();
            res.status(200).json({ Message: "Details added successfully", data: response });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteColorById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        console.log(id)
        if (id) {
            response = await colorModel.findByIdAndDelete(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addMfgLic = async (req, res) => {
    try {
        let data = req.body.data
        if (data._id && data._id.trim() !== '') {
            const response = await mfgLicModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                res.status(200).json({ Message: "Details updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            const response = new mfgLicModel(data);
            await response.save();
            res.status(200).json({ Message: "Details added successfully", data: response });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteMfgLicById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        console.log(id)
        if (id) {
            response = await mfgLicModel.findByIdAndDelete(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addProductionStages = async (req, res) => {
    try {
        let data = req.body.data
        if (data._id && data._id.trim() !== '') {
            const response = await productionStageModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                res.status(200).json({ Message: "Details updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            const response = new productionStageModel(data);
            await response.save();
            res.status(200).json({ Message: "Details added successfully", data: response });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteProductionStageById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        console.log(id)
        if (id) {
            response = await productionStageModel.findByIdAndDelete(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addEditPunchSizeMaster = async (req, res) => {
    try {
        let data = req.body.data
        if (data._id && data._id.trim() !== '') {
            const response = await punchSizeModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                res.status(200).json({ Message: "Details updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            const response = new punchSizeModel(data);
            await response.save();
            res.status(200).json({ Message: "Details added successfully", data: response });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deletePunchSizeById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        console.log(id)
        if (id) {
            response = await punchSizeModel.findByIdAndDelete(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

export {
    addEditPackingMaterial,
    getAllPackingMaterials,
    getPackingMaterialById,
    deletePackingMaterialById,
    addEditRMCategory,
    deleteRMCategoryById,
    addEditPMCategory,
    deletePMCategoryById,
    addEditPackingMaterialSize,
    deletePackingMaterialSizeById,
    addEditStates,
    deleteStateById,
    addEditStereo,
    deleteStereoById,
    addEditLabelClaims,
    deleteLabelClaimById,
    addEditStorageConditions,
    deleteStorageConditionById,
    addEditColors,
    deleteColorById,
    addMfgLic,
    deleteMfgLicById,
    addProductionStages,
    deleteProductionStageById,
    addEditPunchSizeMaster,
    deletePunchSizeById
};
