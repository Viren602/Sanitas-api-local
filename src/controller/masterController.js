import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import accountGroupModel from "../model/accountGroupModel.js";
import colorModel from "../model/colorModel.js";
import daybookMasterModel from "../model/daybookMasterModel.js";
import labelClaimModel from "../model/labelClaimMaster.js";
import mfgLicModel from "../model/mfgLicMaster.js";
import packingMaterialSchema from "../model/packingMaterialModel.js";
import packingMaterialSizeModel from "../model/packingMaterialSizeModel.js";
import partyModel from "../model/partiesModel.js";
import partyWiseNetRateDetailsModel from "../model/partyWiseNetRateDetailsModel.js";
import pmCategoryModel from "../model/pmCategoryModel.js";
import pmFormulaModel from "../model/pmFormulaModel.js";
import productDetailsModel from "../model/productDetailsModel.js";
import productionStageModel from "../model/productionStageModel.js";
import punchSizeModel from "../model/punchSizeMasterModel.js";
import rmCategoryModel from "../model/rmCategoryModel.js";
import rmFormulaModel from "../model/rmFormulaModel.js";
import stateModel from "../model/stateModel.js";
import stereoModel from "../model/stereoMasterModel.js";
import storageConditionModel from "../model/storageConditionModel.js";
import transportCourierModel from "../model/transportCourierModel.js";
import errorHandler from "../server/errorHandle.js";


const addEditPackingMaterial = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data && data._id && data._id.trim() !== '') {
            let mpModel = await packingMaterialSchema(dbYear)
            const response = await mpModel.findByIdAndUpdate(data._id, data, { new: true });
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

            } else {
                res.status(404).json({ Message: "Item not found" });
            }
        } else {
            let mpModel = await packingMaterialSchema(dbYear)
            const existingItemByName = await mpModel.findOne({ pmName: data.pmName.trim(), isDeleted: false });
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
                let mpModel = await packingMaterialSchema(dbYear)
                const response = new mpModel(data);
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
        }
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")

    }
};

const getAllPackingMaterials = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id, page = 1, limit = 50 } = req.query;

        const itemName = getRequestData(id)
        const pageNo = getRequestData(page)
        const pageLimit = getRequestData(limit)
        let queryObject = { isDeleted: false }

        if (itemName && itemName.trim() !== "") {
            queryObject.pmName = { $regex: `^${itemName}`, $options: "i" };
        } else {
            delete queryObject.pmName;
        }

        const skip = (pageNo - 1) * pageLimit;

        let mpModel = await packingMaterialSchema(dbYear)
        const totalCount = await mpModel.countDocuments(queryObject);

        let mpModel1 = await packingMaterialSchema(dbYear)
        let data = await mpModel1
            .find(queryObject)
            .sort("pmName")
            .skip(skip)
            .limit(parseInt(pageLimit));

        let response = {
            totalCount: totalCount,
            responseData: data,
            currentPage: parseInt(pageNo)
        };

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(200).json({ Message: "Items fetched successfully", responseContent: data });
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const getPackingMaterialById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let mpModel = await packingMaterialSchema(dbYear)
            response = await mpModel.findOne({ _id: reqId });
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
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deletePackingMaterialById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let mpModel = await packingMaterialSchema(dbYear)
            response = await mpModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditRMCategory = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let rmCModel = await rmCategoryModel(dbYear)
            const response = await rmCModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Category updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

            } else {
                res.status(404).json({ Message: "Category not found" });
            }
        } else {
            let rmCModel = await rmCategoryModel(dbYear)
            const response = new rmCModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Category added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deleteRMCategoryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let rmCModel = await rmCategoryModel(dbYear)
            response = await rmCModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditPMCategory = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let pmcModel = await pmCategoryModel(dbYear)
            const response = await pmcModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Category updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });
            } else {
                res.status(404).json({ Message: "Category not found" });
            }
        } else {
            let pmcModel = await pmCategoryModel(dbYear)
            const response = new pmcModel(data);
            await response.save();
            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Category added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deletePMCategoryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let pmcModel = await pmCategoryModel(dbYear)
            response = await pmcModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditPackingMaterialSize = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let pmsModel = await packingMaterialSizeModel(dbYear)
            const response = await pmsModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });
            } else {
                res.status(404).json({ Message: "Category not found" });
            }
        } else {
            let pmsModel = await packingMaterialSizeModel(dbYear)
            const response = new pmsModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deletePackingMaterialSizeById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let pmsModel = await packingMaterialSizeModel(dbYear)
            response = await pmsModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditStates = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let sModel = await stateModel(dbYear)
            const response = await sModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });
            } else {
                res.status(404).json({ Message: "Category not found" });
            }
        } else {
            let sModel = await stateModel(dbYear)
            const response = new sModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deleteStateById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let sModel = await stateModel(dbYear)
            response = await sModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditStereo = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let sModel = await stereoModel(dbYear)
            const response = await sModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            let sModel = await stereoModel(dbYear)
            const response = new sModel(data);
            await response.save();
            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deleteStereoById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let sModel = await stereoModel(dbYear)
            response = await sModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditLabelClaims = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let lcModel = await labelClaimModel(dbYear)
            const response = await lcModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            let lcModel = await labelClaimModel(dbYear)
            const response = new lcModel(data);
            await response.save();
            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deleteLabelClaimById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let lcModel = await labelClaimModel(dbYear)
            response = await lcModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditStorageConditions = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let scModel = await storageConditionModel(dbYear)
            const response = await scModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            let scModel = await storageConditionModel(dbYear)
            const response = new scModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deleteStorageConditionById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let scModel = await storageConditionModel(dbYear)
            response = await scModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditColors = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let cModel = await colorModel(dbYear)
            const response = await cModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            let cModel = await colorModel(dbYear)
            const response = new cModel(data);
            await response.save();
            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deleteColorById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let cModel = await colorModel(dbYear)
            response = await cModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addMfgLic = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let mlModel = await mfgLicModel(dbYear)
            const response = await mlModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            let mlModel = await mfgLicModel(dbYear)
            const response = new mlModel(data);
            await response.save();
            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deleteMfgLicById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let mlModel = await mfgLicModel(dbYear)
            response = await mlModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addProductionStages = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let pstageModel = await productionStageModel(dbYear)
            const response = await pstageModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            let pstageModel = await productionStageModel(dbYear)
            const response = new pstageModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });

        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deleteProductionStageById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let pstageModel = await productionStageModel(dbYear)
            response = await pstageModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditPunchSizeMaster = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let pSizeModel = await punchSizeModel(dbYear)
            const response = await pSizeModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            let pSizeModel = await punchSizeModel(dbYear)
            const response = new pSizeModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deletePunchSizeById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let pSizeModel = await punchSizeModel(dbYear)
            response = await pSizeModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditAccountGroup = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let acModel = await accountGroupModel(dbYear)
            const response = await acModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            let acModel = await accountGroupModel(dbYear)
            const response = new acModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });

        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deleteAccountGroupById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let acModel = await accountGroupModel(dbYear)
            response = await acModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditTransportCourier = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let tcModel = await transportCourierModel(dbYear)
            const response = await tcModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });
                // res.status(200).json({ Message: "Details updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            let tcModel = await transportCourierModel(dbYear)
            const response = new tcModel(data);
            await response.save();
            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
            // res.status(200).json({ Message: "Details added successfully", data: response });
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deleteTransportCourierById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let tcModel = await transportCourierModel(dbYear)
            response = await tcModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditDaybook = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let dbMasterModel = await daybookMasterModel(dbYear)
            const response = await dbMasterModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            let dbMasterModel = await daybookMasterModel(dbYear)
            const response = new dbMasterModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });

            // res.status(200).json({ Message: "Details added successfully", data: response });
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deleteDaybookById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let dbMasterModel = await daybookMasterModel(dbYear)
            response = await dbMasterModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const getAllParties = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let queryObject = { isDeleted: false }
        if (reqId && reqId.trim() !== "") {
            queryObject.partyName = { $regex: `^${reqId}`, $options: "i" };
        }

        let pModel = await partyModel(dbYear)
        let response = await pModel
            .find(queryObject)
            .select('partyName city email mobileNo1 transporterName gstnNo')
            .sort("partyName");

        // for (let i = 0; i < response.length; i++) {
        //     const accountCode = response[i].acGroupCode;
        //     let accountCodeName = '';
        //     if (accountCode) {
        //         const accountGroup = await accountGroupModel.findOne({ accountGroupCode: accountCode });
        //         accountCodeName = accountGroup ? accountGroup.accountGroupname : '';
        //     }
        //     response[i] = {
        //         ...response[i]._doc, 
        //         accountCodeName,
        //     };
        // }
        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Item has been deleted",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(200).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const getPartyDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        let accountCode = {}
        if (reqId) {
            let pModel = await partyModel(dbYear)
            response = await pModel.findOne({ _id: reqId });
        }
        if (response.acGroupCode) {
            let acModel = await accountGroupModel(dbYear)
            accountCode = await acModel.findOne({ accountGroupCode: response.acGroupCode });
        }
        response.accountCodeName = accountCode.accountGroupname

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
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditPartyDetails = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let accountCode = {}
        if (data.accountCodeName) {
            let acModel = await accountGroupModel(dbYear)
            accountCode = await acModel.findOne({ accountGroupname: data.accountCodeName });
        }
        data.acGroupCode = accountCode.accountGroupCode
        if (data && data._id && data._id.trim() !== '') {
            let pModel = await partyModel(dbYear)
            const response = await pModel.findByIdAndUpdate(data._id, data, { new: true });
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

                // res.status(200).json({ Message: "Item updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Item not found" });
            }
        } else {
            let pModel = await partyModel(dbYear)
            const existingItemByName = await pModel.findOne({ partyName: data.partyName.trim(), isDeleted: false });
            if (existingItemByName) {
                let encryptData = encryptionAPI(existingItemByName, 1)
                res.status(200).json({
                    data: {
                        statusCode: 409,
                        Message: "Company with the same name already exists",
                        responseData: encryptData,
                        isEnType: true
                    },
                });
            } else {
                let pModel = await partyModel(dbYear)
                const response = new pModel(data);
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
            // res.status(200).json({ Message: "Item added successfully", data: response });
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deletePartyDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let pModel = await partyModel(dbYear)
            response = await pModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Party details has been deleted",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addeditProductDetails = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data && data._id && data._id.trim() !== '') {
            let pdModel = await productDetailsModel(dbYear)
            const response = await pdModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Product updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

            } else {
                res.status(404).json({ Message: "Product not found" });
            }
        } else {
            let pdModel = await productDetailsModel(dbYear)
            const existingItemByName = await pdModel.findOne({ productName: data.productName.trim(), isDeleted: false });
            if (existingItemByName) {
                let encryptData = encryptionAPI(existingItemByName, 1)
                res.status(200).json({
                    data: {
                        statusCode: 409,
                        Message: "Product with the same name already exists",
                        responseData: encryptData,
                        isEnType: true
                    },
                });
            } else {
                let pdModel = await productDetailsModel(dbYear)
                const response = new pdModel(data);
                await response.save();
                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Product added successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });
            }
        }

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const getAllProductDetails = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id, page = 1, limit = 50 } = req.query;

        const itemName = getRequestData(id)
        const pageNo = getRequestData(page)
        const pageLimit = getRequestData(limit)
        let queryObject = { isDeleted: false }

        if (itemName && itemName.trim() !== "") {
            queryObject.productName = { $regex: `^${itemName}`, $options: "i" };
        } else {
            delete queryObject.productName;
        }
        const skip = (pageNo - 1) * pageLimit;

        let pdModel = await productDetailsModel(dbYear)
        const totalCount = await pdModel.countDocuments(queryObject);


        let pdModel1 = await productDetailsModel(dbYear)
        let data = await pdModel1
            .find(queryObject)
            .sort("productName")
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

        // res.status(200).json({ Message: "Product fetched successfully", responseContent: data });
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const getProductDetailById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let pdModel = await productDetailsModel(dbYear)
            response = await pdModel.findOne({ _id: reqId });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Product fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Product fetched successfully", responseContent: response });
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deleteProductDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let pdModel = await productDetailsModel(dbYear)
            response = await pdModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
        }


        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Product has been deleted",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Product has been deleted", responseContent: response });
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditpartyWiseNetRateDetails = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data && data._id && data._id.trim() !== '') {
            let pwnrDetailsModel = await partyWiseNetRateDetailsModel(dbYear)
            const response = await pwnrDetailsModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {
                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

                // res.status(200).json({ Message: "Details updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            let pwnrDetailsModel = await partyWiseNetRateDetailsModel(dbYear)
            const response = new pwnrDetailsModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });

            // res.status(200).json({ Message: "Details added successfully", data: response });
        }
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const getPartyWiseNetRateDetailsByPartyId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let pwnrDetailsModel = await partyWiseNetRateDetailsModel(dbYear)
            response = await pwnrDetailsModel.find({ partyId: reqId, isDeleted: false });
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
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deletePartyWiseNetRateById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let pwnrDetailsModel = await partyWiseNetRateDetailsModel(dbYear)
            response = await pwnrDetailsModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const getRMFormulaByProductId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let rmFModel = await rmFormulaModel(dbYear)
            response = await rmFModel.find({ productId: reqId, isDeleted: false })
                .populate({
                    path: 'stageId',
                    select: 'seqNo',
                });
        }

        response.sort((a, b) => (a.stageId?.seqNo || 0) - (b.stageId?.seqNo || 0));
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
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditRMFormulaDetails = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data && data._id && data._id.trim() !== '') {
            let rmFModel = await rmFormulaModel(dbYear)
            const response = await rmFModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

                // res.status(200).json({ Message: "Details updated successfully", data: response });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            let rmFModel = await rmFormulaModel(dbYear)
            const response = new rmFModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });

            // res.status(200).json({ Message: "Details added successfully", data: response });
        }
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deleteRMFurmulaById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let rmFModel = await rmFormulaModel(dbYear)
            response = await rmFModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};


const getPMFormulaByItemId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let pmfModel = await pmFormulaModel(dbYear)
            response = await pmfModel.find({ itemId: reqId, isDeleted: false });
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
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const addEditPMFormulaDetails = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        if (data && data._id && data._id.trim() !== '') {
            let pmfModel = await pmFormulaModel(dbYear)
            const response = await pmfModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Details updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });
            } else {
                res.status(404).json({ Message: "Details not found" });
            }
        } else {
            let pmfModel = await pmFormulaModel(dbYear)
            const response = new pmfModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Details added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const deletePMFurmulaById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let response = {}
        if (reqId) {
            let pmfModel = await pmFormulaModel(dbYear)
            response = await pmfModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
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
    deletePunchSizeById,
    addEditAccountGroup,
    deleteAccountGroupById,
    getAllParties,
    getPartyDetailsById,
    addEditTransportCourier,
    deleteTransportCourierById,
    addEditPartyDetails,
    deletePartyDetailsById,
    addEditDaybook,
    deleteDaybookById,
    addeditProductDetails,
    getAllProductDetails,
    getProductDetailById,
    deleteProductDetailsById,
    addEditpartyWiseNetRateDetails,
    getPartyWiseNetRateDetailsByPartyId,
    deletePartyWiseNetRateById,
    getRMFormulaByProductId,
    addEditRMFormulaDetails,
    deleteRMFurmulaById,
    getPMFormulaByItemId,
    addEditPMFormulaDetails,
    deletePMFurmulaById
};
