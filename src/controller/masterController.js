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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data && data._id && data._id.trim() !== '') {
            const response = await packingMaterialSchema.findByIdAndUpdate(data._id, data, { new: true });
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
            const existingItemByName = await packingMaterialSchema.findOne({ pmName: data.pmName.trim() });
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
                const response = new packingMaterialSchema(data);
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
        const { id } = req.query;
        let queryObject = { isDeleted: false }
        if (id && id.trim() !== "") {
            queryObject.pmName = { $regex: `^${id}`, $options: "i" };
        }
        let data = await packingMaterialSchema.find(queryObject).sort("pmName");

        res.status(200).json({ Message: "Items fetched successfully", responseContent: data });
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const getPackingMaterialById = async (req, res) => {
    try {

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await packingMaterialSchema.findOne({ _id: reqId });
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

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await packingMaterialSchema.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await rmCategoryModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new rmCategoryModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await rmCategoryModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await pmCategoryModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new pmCategoryModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await pmCategoryModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await packingMaterialSizeModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new packingMaterialSizeModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await packingMaterialSizeModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await stateModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new stateModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await stateModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await stereoModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new stereoModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await stereoModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await labelClaimModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new labelClaimModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await labelClaimModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await storageConditionModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new storageConditionModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await storageConditionModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await colorModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new colorModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await colorModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await mfgLicModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new mfgLicModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await mfgLicModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await productionStageModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new productionStageModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await productionStageModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await punchSizeModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new punchSizeModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await punchSizeModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await accountGroupModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new accountGroupModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await accountGroupModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await transportCourierModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new transportCourierModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await transportCourierModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            const response = await daybookMasterModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new daybookMasterModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await daybookMasterModel.findByIdAndDelete(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        const { id } = req.query;
        let queryObject = { isDeleted: false }
        if (id && id.trim() !== "") {
            queryObject.partyName = { $regex: `^${id}`, $options: "i" };
        }
        let response = await partyModel.find(queryObject).sort("partyName");

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

        res.status(200).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const getPartyDetailsById = async (req, res) => {
    try {

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        let accountCode = {}
        if (reqId) {
            response = await partyModel.findOne({ _id: reqId });
        }
        if (response.acGroupCode) {
            accountCode = await accountGroupModel.findOne({ accountGroupCode: response.acGroupCode });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let accountCode = {}
        if (data.accountCodeName) {
            accountCode = await accountGroupModel.findOne({ accountGroupname: data.accountCodeName });
        }
        data.acGroupCode = accountCode.accountGroupCode
        if (data && data._id && data._id.trim() !== '') {
            const response = await partyModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const existingItemByName = await partyModel.findOne({ partyName: data.partyName.trim() });
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
                const response = new partyModel(data);
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await partyModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data && data._id && data._id.trim() !== '') {
            const response = await productDetailsModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const existingItemByName = await productDetailsModel.findOne({ productName: data.productName.trim() });
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
                const response = new productDetailsModel(data);
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
        const { id } = req.query;
        let queryObject = { isDeleted: false }
        if (id && id.trim() !== "") {
            queryObject.productName = { $regex: `^${id}`, $options: "i" };
        }
        let data = await productDetailsModel.find(queryObject).sort("productName");

        res.status(200).json({ Message: "Product fetched successfully", responseContent: data });
    } catch (error) {
        console.log("Error in item master controller", error);
        errorHandler(error, req, res, "Error in Master controller")
    }
};

const getProductDetailById = async (req, res) => {
    try {

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await productDetailsModel.findOne({ _id: reqId });
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

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await productDetailsModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data && data._id && data._id.trim() !== '') {
            const response = await partyWiseNetRateDetailsModel.findByIdAndUpdate(data._id, data, { new: true });
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
            // const response = new partyWiseNetRateDetailsModel(data);
            // await response.save();
            // console.log(response)
            // res.status(200).json({ Message: "Details added successfully", data: response });
        } else {
            const response = new partyWiseNetRateDetailsModel(data);
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

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await partyWiseNetRateDetailsModel.find({ partyId: reqId, isDeleted: false });
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

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await partyWiseNetRateDetailsModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await rmFormulaModel.find({ productId: reqId, isDeleted: false });
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

const addEditRMFormulaDetails = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data && data._id && data._id.trim() !== '') {
            const response = await rmFormulaModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new rmFormulaModel(data);
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

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await rmFormulaModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await pmFormulaModel.find({ itemId: reqId, isDeleted: false });
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        if (data && data._id && data._id.trim() !== '') {
            const response = await pmFormulaModel.findByIdAndUpdate(data._id, data, { new: true });
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
            const response = new pmFormulaModel(data);
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

        const { id } = req.query;
        let reqId = getRequestData(id)

        let response = {}
        if (reqId) {
            response = await pmFormulaModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
