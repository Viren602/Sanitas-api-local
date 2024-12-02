import rawMaterialSchema from "../model/rawMaterialModel.js";


const addEditRawMaterial = async (req, res) => {
    try {
        let data = req.body.data
        if (data && data._id && data._id.trim() !== '') {
            const response = await rawMaterialSchema.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                res.status(200).json({ Message: "Item updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Item not found" });
            }
        } else {
            const response = new rawMaterialSchema(data);
            await response.save();
            res.status(200).json({ Message: "Item added successfully", data: response });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllRawMaterials = async (req, res) => {
    try {
        const { id } = req.query;
        let queryObject = { isDeleted: false }
        if (id && id.trim() !== "") {
            queryObject.rmName = { $regex: `^${id}`, $options: "i" };
        }
        console.log(queryObject)
        let data = await rawMaterialSchema.find(queryObject).sort("rmName");

        res.status(200).json({ Message: "Items fetched successfully", responseContent: data });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getRawMaterialById = async (req, res) => {
    try {

        const { id } = req.query;
        let response = {}
        if (id) {
            response = await rawMaterialSchema.findOne({ _id: id });
        }

        res.status(201).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteRawMaterialById = async (req, res) => {
    try {

        const { id } = req.query;
        let response = {}
        if (id) {
            response = await rawMaterialSchema.findByIdAndUpdate(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

export {
    addEditRawMaterial,
    getAllRawMaterials,
    getRawMaterialById,
    deleteRawMaterialById
};
