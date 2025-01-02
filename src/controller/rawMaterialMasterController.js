import rawMaterialSchema from "../model/rawMaterialModel.js";
import { encryptionAPI, getRequestData } from "../middleware/encryption.js";


const addEditRawMaterial = async (req, res) => {
    try {
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        if (reqData && reqData._id && reqData._id.trim() !== '') {
            const response = await rawMaterialSchema.findByIdAndUpdate(reqData._id, reqData, { new: true });
            if (response) {
                let encryptData = encryptionAPI(response, 1)
                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Item updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

                // res.status(200).json({ Message: "Item updated successfully", reqData: response });
            } else {
                res.status(404).json({ Message: "Item not found" });
            }
        } else {
            const response = new rawMaterialSchema(reqData);
            await response.save();
            let encryptData = encryptionAPI(response, 1)
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Item added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
            // res.status(200).json({ Message: "Item added successfully", reqData: response });
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
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await rawMaterialSchema.findOne({ _id: reqId });
        }

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Items fetched successfully", responseContent: response });

    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteRawMaterialById = async (req, res) => {
    try {

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await rawMaterialSchema.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
        }

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Item has been deleted",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Item has been deleted", responseContent: response });
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
