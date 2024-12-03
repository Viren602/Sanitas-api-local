import packingMaterialSchema from "../model/packingMaterialModel.js";
import pmCategoryModel from "../model/pmCategoryModel.js";
import rmCategoryModel from "../model/rmCategoryModel.js";


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

export {
    addEditPackingMaterial,
    getAllPackingMaterials,
    getPackingMaterialById,
    deletePackingMaterialById,
    addEditRMCategory,
    deleteRMCategoryById,
    addEditPMCategory,
    deletePMCategoryById
};
