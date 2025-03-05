import rawMaterialSchema from "../model/rawMaterialModel.js";
import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import errorHandler from "../server/errorHandle.js";


const addEditRawMaterial = async (req, res) => {
    try {
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        if (reqData && reqData._id && reqData._id.trim() !== '') {
            let rmModel = await rawMaterialSchema()
            const response = await rmModel.findByIdAndUpdate(reqData._id, reqData, { new: true });
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
            let rmModel = await rawMaterialSchema()
            const existingItemByName = await rmModel.findOne({ rmName: reqData.rmName.trim(), isDeleted: false });
            if (existingItemByName) {
                let encryptData = encryptionAPI(existingItemByName, 1)
                res.status(200).json({
                    data: {
                        statusCode: 409,
                        Message: "Raw Material with the same name already exists",
                        responseData: encryptData,
                        isEnType: true
                    },
                });
            } else {
                let rmModel = await rawMaterialSchema()
                const response = new rmModel(reqData);
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
            }
            // res.status(200).json({ Message: "Item added successfully", reqData: response });
        }

    } catch (error) {
        console.log("Error in Raw Material Master controller", error);
        errorHandler(error, req, res, "Error in Raw Material Master controller")
    }
};

const getAllRawMaterials = async (req, res) => {
    try {
        const { id, page = 1, limit = 100 } = req.query;

        const itemName = getRequestData(id)
        const pageNo = getRequestData(page)
        const pageLimit = getRequestData(limit)
        let queryObject = { isDeleted: false }

        if (itemName && itemName.trim() !== "") {
            queryObject.rmName = { $regex: `^${itemName}`, $options: "i" };
        } else {
            delete queryObject.rmName;
        }
        const skip = (pageNo - 1) * pageLimit;

        let rmModel = await rawMaterialSchema()
        const totalCount = await rmModel.countDocuments(queryObject);

        let rmModel1 = await rawMaterialSchema()
        let data = await rmModel1
            .find(queryObject)
            .sort("rmName")
            .skip(skip)
            .limit(parseInt(pageLimit));

        let response = {
            totalCount: totalCount,
            responseData: data,
            currentPage: parseInt(pageNo)
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

    } catch (error) {
        console.log("Error in Raw Material Master controller", error);
        errorHandler(error, req, res, "Error in Raw Material Master controller")
    }
};

const getRawMaterialById = async (req, res) => {
    try {

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let rmModel = await rawMaterialSchema()
            response = await rmModel.findOne({ _id: reqId });
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
        console.log("Error in Raw Material Master controller", error);
        errorHandler(error, req, res, "Error in Raw Material Master controller")
    }
};

const deleteRawMaterialById = async (req, res) => {
    try {

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let rmModel = await rawMaterialSchema()
            response = await rmModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        console.log("Error in Raw Material Master controller", error);
        errorHandler(error, req, res, "Error in Raw Material Master controller")
    }
};

export {
    addEditRawMaterial,
    getAllRawMaterials,
    getRawMaterialById,
    deleteRawMaterialById
};
