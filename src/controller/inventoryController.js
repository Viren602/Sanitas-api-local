import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import grnEntryMaterialDetailsModel from "../model/InventoryModels/grnEntryMaterialDetailsModel.js";
import grnEntryPartyDetailsModel from "../model/InventoryModels/grnEntryPartyDetailsModel.js";
import productionRequisitionEntryModel from "../model/InventoryModels/additionalEntryProductionDetails.js";
import additionalEntryMaterialDetailsModel from "../model/InventoryModels/additionalEntryMaterialDetailsModel.js";
import purchaseOrderDetailsModel from "../model/InventoryModels/purchaseOrderDetailsModel.js";
import purchaserOrderMaterialDetailsModel from "../model/InventoryModels/purchaseOrderMaterialDetailsModel.js";
import mailsender from "../utils/sendingEmail.js";
import partyModel from "../model/partiesModel.js";
import inquiryDetailsModel from "../model/InventoryModels/inquiryDetailsModel.js";
import inquiryMaterialDetailsModel from "../model/InventoryModels/inquiryMaterialDetails.js";
import ProductionRequisitionRMFormulaModel from "../model/InventoryModels/productionRequisitionRMFormulaModel.js";
import PackingRequisitionPMFormulaModel from "../model/InventoryModels/packingRequisitionPMFormulaModel.js";
import emailTemplateModel from "../model/emailTemplateModel.js";
import { FromMail } from "../middleware/appSetting.js";
import errorHandler from "../server/errorHandle.js";
import gstinvoiceRMItemModel from "../model/Despatch/gstInvoiceRMItemsModel.js";
import gstInvoicePMItemModel from "../model/Despatch/gstInvoicePMItemsModel.js";
import rawMaterialSchema from "../model/rawMaterialModel.js";
import packingMaterialSchema from "../model/packingMaterialModel.js";
import companyGroupModel from "../model/companyGroup.js";

const addEditGRNEntryMaterialMapping = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {};
        if (data.grnRawMaterialPartyDetails.partyDetailsId && data.grnRawMaterialPartyDetails.partyDetailsId.trim() !== '') {
            let gepdModel = await grnEntryPartyDetailsModel(dbYear);
            const response = await gepdModel.findByIdAndUpdate(data.grnRawMaterialPartyDetails.partyDetailsId, data.grnRawMaterialPartyDetails, { new: true });
            if (response) {
                responseData.partyDetails = response;
            } else {
                responseData.partyDetails = 'Party details not found';
            }
        } else {

            let nextGRNNO = 'G001';

            let gepdModel = await grnEntryPartyDetailsModel(dbYear);
            const lastRecord = await gepdModel
                .findOne()
                .sort({ grnNo: -1 })
                .select('grnNo')
                .exec();

            if (lastRecord && lastRecord.grnNo) {
                const lastNumber = parseInt(lastRecord.grnNo.slice(1), 10);
                nextGRNNO = `G${String(lastNumber + 1).padStart(3, '0')}`;
            }

            data.grnRawMaterialPartyDetails.grnNo = nextGRNNO;

            let gepdModel1 = await grnEntryPartyDetailsModel(dbYear);
            const response = new gepdModel1(data.grnRawMaterialPartyDetails);
            await response.save();
            responseData.partyDetails = response;
        }

        if (data.grnMaterialDetails.materialDetailsId && data.grnMaterialDetails.materialDetailsId.trim() !== '') {
            data.grnMaterialDetails.grnEntryPartyDetailId = responseData.partyDetails._id
            let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);
            const response = await gemDetailsModel.findByIdAndUpdate(data.grnMaterialDetails.materialDetailsId, data.grnMaterialDetails, { new: true });
            if (response) {
                responseData.materialDetails = response;
            } else {
                responseData.materialDetails = 'Material details not found';
            }
        } else {
            data.grnMaterialDetails.grnEntryPartyDetailId = responseData.partyDetails._id
            let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);
            const response = new gemDetailsModel(data.grnMaterialDetails);
            await response.save();
            responseData.materialDetails = response;
        }

        if (data.grnMaterialDetails.isPurchaseOrderEntry && data.grnMaterialDetails.purchaseOrderId !== '' && data.grnMaterialDetails.purchaseOrdermaterialId !== '') {
            let pomDetailsModel = await purchaserOrderMaterialDetailsModel(dbYear)
            await pomDetailsModel.findByIdAndUpdate(data.grnMaterialDetails.purchaseOrdermaterialId, { isGRNEntryDone: true }, { new: true, useFindAndModify: false });
        }

        let encryptData = encryptionAPI(responseData, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "GRN entry material added/updated successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(200).json({
        //     Message: "GRN entry material mapping added/updated successfully",
        //     data: responseData
        // });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getAllPartyListForGRNEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }

        let filterBy = { createdAt: -1 };

        if (data.filterBy && data.filterBy.trim() !== '') {
            filterBy = { [data.filterBy]: 1 };
        }

        if (data.materialType && data.materialType !== 'Select' && data.materialType.trim() !== '') {
            queryObject.grnEntryType = data.materialType
        }

        let gepdModel = await grnEntryPartyDetailsModel(dbYear);
        let response = await gepdModel
            .find(queryObject)
            .sort(filterBy)
            .populate({
                path: 'partyId',
                select: 'partyName _id'
            });

        if (data.partyName && data.partyName.trim() !== '') {
            response = response.filter(item =>
                item.partyId?.partyName?.toLowerCase().startsWith(data.partyName.toLowerCase())
            );
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
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getAllgrnEntryMaterialDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = []
        if (reqId) {
            let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);
            response = await gemDetailsModel
                .find({ grnEntryPartyDetailId: reqId, isDeleted: false })
                .populate({
                    path: 'rawMaterialId',
                    select: 'rmName _id rmUOM',
                })
                .populate({
                    path: 'packageMaterialId',
                    select: 'pmName _id pmUOM',
                });
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

        // res.status(200).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};


const getPurchaseOrderMaterialByPartyId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let purchaseOrder = [];
        if (data.partyId) {
            let podModel = await purchaseOrderDetailsModel(dbYear)
            purchaseOrder = await podModel
                .find({ partyId: data.partyId, status: 'Order Approved' })
                .populate({
                    path: 'partyId',
                    select: 'partyName _id'
                });
        }
        let materialDetails = [];
        if (purchaseOrder.length > 0) {
            let response = await Promise.all(
                purchaseOrder.map(async (item) => {
                    let materials = []
                    if (data.materialType === 'Raw') {
                        let pomDetailsModel = await purchaserOrderMaterialDetailsModel(dbYear)
                        materials = await pomDetailsModel
                            .find({ purchaseOrderId: item._id, rawMaterialId: data.materialId, isDeleted: false, isGRNEntryDone: false })
                            .populate({
                                path: 'rawMaterialId',
                                select: 'rmName rmUOM _id',
                            });
                    } else {
                        let pomDetailsModel = await purchaserOrderMaterialDetailsModel(dbYear)
                        materials = await pomDetailsModel
                            .find({ purchaseOrderId: item._id, packageMaterialId: data.materialId, isDeleted: false, isGRNEntryDone: false })
                            .populate({
                                path: 'packageMaterialId',
                                select: 'pmName pmUOM _id',
                            });
                    }

                    return materials.map((material) => ({
                        purchaseOrderNo: item.purchaseOrderNo,
                        partyName: item.partyId.partyName,
                        materialName: data.materialType === 'Raw' ? material.rawMaterialId.rmName : material.packageMaterialId.pmName,
                        materialUOM: data.materialType === 'Raw' ? material.rawMaterialId.rmUOM : material.packageMaterialId.pmUOM,
                        materialQty: material.qty,
                        materialRate: material.rate,
                        materialAmount: material.amount,
                        isPurchaseOrderEntry: true,
                        purchaseOrderId: item._id,
                        purchaseOrdermaterialId: material._id,
                        make: material.make
                    }));
                })
            );

            materialDetails = response.flat();
        }

        let encryptData = encryptionAPI(materialDetails, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const deleteGRNEntryMaterialDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let gepdModel = await grnEntryPartyDetailsModel(dbYear);
            response = await gepdModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
        }

        if (reqId) {
            let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);
            await gemDetailsModel.updateMany({ grnEntryPartyDetailId: reqId }, { isDeleted: true });

            let materialDetails = await gemDetailsModel.find({ grnEntryPartyDetailId: reqId });

            if (materialDetails.length > 0) {
                let pomDetailsModel = await purchaserOrderMaterialDetailsModel(dbYear);

                await Promise.all(materialDetails.map(async (details) => {
                    if (details.purchaseOrdermaterialId) {
                        await pomDetailsModel.findByIdAndUpdate(details.purchaseOrdermaterialId, { isGRNEntryDone: false });
                    }
                }));
            }
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "GRN Party Details deleted successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const deleteItemforGRNEntryMaterialById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);
            response = await gemDetailsModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
        }

        if (response.purchaseOrdermaterialId) {
            let pomDetailsModel = await purchaserOrderMaterialDetailsModel(dbYear)
            response = await pomDetailsModel.findByIdAndUpdate(response.purchaseOrdermaterialId, { isGRNEntryDone: false }, { new: true, useFindAndModify: false });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "GRN Material Detail deleted successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(200).json({ Message: "GRN Material Detail deleted successfully", responseContent: response });
    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const addEditAdditionalEntryMaterialMapping = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')


        let responseData = {};
        if (reqData.productionRequisitionEntry.productionDetailId && reqData.productionRequisitionEntry.productionDetailId.trim() !== '') {
            let prodRequisitionDet = await productionRequisitionEntryModel(dbYear)
            const response = await prodRequisitionDet.findByIdAndUpdate(reqData.productionRequisitionEntry.productionDetailId, reqData.productionRequisitionEntry, { new: true });
            if (response) {
                responseData.productionRequisitionDetails = response;
            } else {
                responseData.productionRequisitionDetails = 'Additional Production Requisition details not found';
            }
        } else {

            let nextSlipno = 'AR001';

            let prodRequisitionDet = await productionRequisitionEntryModel(dbYear)
            const lastRecord = await prodRequisitionDet
                .findOne()
                .sort({ slipNo: -1 })
                .select('slipNo')
                .exec();

            if (lastRecord && lastRecord.slipNo) {
                const lastNumber = parseInt(lastRecord.slipNo.slice(2), 10);  // Remove the "AR" prefix
                nextSlipno = `AR${String(lastNumber + 1).padStart(3, '0')}`;
            } else {
                // If no records exist, start from AR001
                nextSlipno = 'AR001';
            }

            reqData.productionRequisitionEntry.slipNo = nextSlipno;

            let prodRequisitionDetModel = await productionRequisitionEntryModel(dbYear)
            const response = new prodRequisitionDetModel(reqData.productionRequisitionEntry);
            await response.save();
            responseData.productionRequisitionDetails = response;
        }

        if (reqData.productionRequisitionMaterialDetails.productionMaterialDetailId && reqData.productionRequisitionMaterialDetails.productionMaterialDetailId.trim() !== '') {
            reqData.productionRequisitionMaterialDetails.additionalEntryDetailsId = responseData.productionRequisitionDetails._id
            let addEntryDetModel = await additionalEntryMaterialDetailsModel(dbYear)
            const response = await addEntryDetModel.findByIdAndUpdate(reqData.productionRequisitionMaterialDetails.productionMaterialDetailId, reqData.productionRequisitionMaterialDetails, { new: true });
            if (response) {
                responseData.materialDetails = response;
            } else {
                responseData.materialDetails = 'Material details not found';
            }
        } else {
            reqData.productionRequisitionMaterialDetails.additionalEntryDetailsId = responseData.productionRequisitionDetails._id
            let addEntryDetModel = await additionalEntryMaterialDetailsModel(dbYear)
            const response = new addEntryDetModel(reqData.productionRequisitionMaterialDetails);
            await response.save();
            responseData.materialDetails = response;
        }

        responseData = encryptionAPI(responseData, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Additional entry added/updated successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getAllAdditionalEntryMaterialDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = []
        if (reqId) {
            let addEntryDetModel = await additionalEntryMaterialDetailsModel(dbYear)
            response = await addEntryDetModel
                .find({ additionalEntryDetailsId: reqId, isDeleted: false })
                .populate({
                    path: 'rawMaterialId',
                    select: 'rmName rmUOM _id',
                })
                .populate({
                    path: 'packageMaterialId',
                    select: 'pmName pmUOM _id',
                });
        }
        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Additional entry details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getAllAdditionalEntryList = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }
        let filterBy = { createdAt: -1 };

        if (data.filterBy && data.filterBy.trim() !== '') {
            filterBy = { [data.filterBy]: 1 };
        }

        if (data.materialType && data.materialType !== 'Select' && data.materialType.trim() !== '') {
            queryObject.materialType = data.materialType
        }

        let prodRequisitionDetModel = await productionRequisitionEntryModel(dbYear)
        let response = await prodRequisitionDetModel
            .find(queryObject)
            .sort(filterBy);

        if (data.productName && data.productName.trim() !== '') {
            response = response.filter(item =>
                item.productName?.toLowerCase().startsWith(data.productName.toLowerCase())
            );
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Additional entry details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const deleteAdditionalEntryDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let prodRequisitionDetModel = await productionRequisitionEntryModel(dbYear)
            response = await prodRequisitionDetModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
        }

        if (reqId) {
            let gemDetailsModel = await additionalEntryMaterialDetailsModel(dbYear);
            await gemDetailsModel.updateMany({ additionalEntryDetailsId: reqId }, { isDeleted: true });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Additional entry deleted successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const deleteAdditionalEntryMaterialDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let addEntryDetModel = await additionalEntryMaterialDetailsModel(dbYear)
            response = await addEntryDetModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Additional Entry Material Detail deleted successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const addEditPurchaseOrderDetails = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')


        let responseData = {};
        if (reqData.purchaseOrderId && reqData.purchaseOrderId.trim() !== '') {
            let podModel = await purchaseOrderDetailsModel(dbYear)
            const response = await podModel.findByIdAndUpdate(reqData.purchaseOrderId, reqData, { new: true });
            if (response) {
                responseData = encryptionAPI(response, 1)
                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Purchase Order Details Updated Successully",
                        responseData: responseData,
                        isEnType: true
                    },
                });
            }
        } else {

            let nextOrderNo = 'P0001';

            let podModel = await purchaseOrderDetailsModel(dbYear)
            const lastRecord = await podModel
                .findOne()
                .sort({ purchaseOrderNo: -1 })
                .select('purchaseOrderNo')
                .exec();

            if (lastRecord && lastRecord.purchaseOrderNo) {
                const lastNumber = parseInt(lastRecord.purchaseOrderNo.slice(1), 10);
                nextOrderNo = `P${String(lastNumber + 1).padStart(4, '0')}`;
            }

            reqData.purchaseOrderNo = nextOrderNo;
            reqData.purchaseOrderDate = new Date();

            let podModel1 = await purchaseOrderDetailsModel(dbYear)
            const response = new podModel1(reqData);
            await response.save();

            responseData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Purchase Order Added Successully",
                    responseData: responseData,
                    isEnType: true
                },
            });
        }


    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getAllPurchaseOrders = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }
        let filterBy = { createdAt: -1 };

        if (data.filterBy && data.filterBy.trim() !== '') {
            filterBy = { [data.filterBy]: 1 };
        }

        if (data.materialType && data.materialType !== 'Select' && data.materialType.trim() !== '') {
            queryObject.materialType = data.materialType
        }

        if (data.status && data.status !== 'Select' && data.status.trim() !== '') {
            queryObject.status = data.status
        }

        let podModel = await purchaseOrderDetailsModel(dbYear)
        let response = await podModel
            .find(queryObject)
            .sort(filterBy)
            .populate({
                path: 'partyId',
                select: 'partyName _id'
            });

        if (data.partyName && data.partyName.trim() !== '') {
            response = response.filter(item =>
                item.partyId?.partyName?.toLowerCase().startsWith(data.partyName.toLowerCase())
            );
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Purchase details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const addEditPurchaserOrderMaterialDetails = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let responseData = {};
        if (reqData.purchaseOrderMaterialDetialId && reqData.purchaseOrderMaterialDetialId.trim() !== '') {
            let pomDetailsModel = await purchaserOrderMaterialDetailsModel(dbYear)
            const response = await pomDetailsModel.findByIdAndUpdate(reqData.purchaseOrderMaterialDetialId, reqData, { new: true });
            if (response) {
                responseData = encryptionAPI(response, 1)
                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Material Details Updated Successully",
                        responseData: responseData,
                        isEnType: true
                    },
                });
            }
        } else {
            let pomDetailsModel = await purchaserOrderMaterialDetailsModel(dbYear)
            const response = new pomDetailsModel(reqData);
            await response.save();

            responseData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Material Details Added Successully",
                    responseData: responseData,
                    isEnType: true
                },
            });
        }


    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getPurchaseOrderMaterialDetailsByPurchaseOrderId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = []
        if (reqId) {
            let pomDetailsModel = await purchaserOrderMaterialDetailsModel(dbYear)
            response = await pomDetailsModel
                .find({ purchaseOrderId: reqId, isDeleted: false })
                .populate({
                    path: 'rawMaterialId',
                    select: 'rmName rmUOM _id',
                })
                .populate({
                    path: 'packageMaterialId',
                    select: 'pmName pmUOM _id',
                });
        }
        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Material details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const deletePurchaseOrderDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let podModel = await purchaseOrderDetailsModel(dbYear)
            response = await podModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });

            let pomDetailsModel = await purchaserOrderMaterialDetailsModel()
            await pomDetailsModel.updateMany({ purchaseOrderId: reqId }, { isDeleted: true });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Order details deleted successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const deletepurchaseOrderMaterialDetialsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let pomDetailsModel = await purchaserOrderMaterialDetailsModel(dbYear)
            response = await pomDetailsModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Material details deleted successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const sendPurchaseOrderMail = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')

        let cgModel = await companyGroupModel(dbYear)
        let companyDetails = await cgModel.findOne({});

        if (reqData.partyId._id) {
            let id = reqData.partyId._id
            let pModel = await partyModel(dbYear)
            let partyDetails = await pModel.findOne({ _id: id }).select("partyName person");

            let etModel = await emailTemplateModel(dbYear)
            const EmailTemplate = await etModel.findOne({ emailTemplateId: 1 });

            let pomDetailsModel = await purchaserOrderMaterialDetailsModel(dbYear)
            let purchaseMaterial = await pomDetailsModel
                .find({ purchaseOrderId: reqData.purchaseOrderId, isDeleted: false })
                .populate({
                    path: 'rawMaterialId',
                    select: 'rmName rmUOM _id',
                })
                .populate({
                    path: 'packageMaterialId',
                    select: 'pmName pmUOM _id',
                });

            let subTotalAmount = purchaseMaterial.reduce((sum, item) => sum + item.amount, 0)
            let gstRate = 0
            if (reqData.gstApplicable === 'GST 5%') {
                gstRate = 5
            } else if (reqData.gstApplicable === 'GST 12%') {
                gstRate = 12
            } else if (reqData.gstApplicable === 'GST 18%') {
                gstRate = 18
            } else if (reqData.gstApplicable === 'GST 28%') {
                gstRate = 28
            }
            let gstAmount = subTotalAmount * (gstRate / 100)
            let totalAmount = subTotalAmount + gstAmount


            const tableRows = purchaseMaterial && purchaseMaterial.length > 0
                ? purchaseMaterial.map(material => `
                <tr>
                    <td>${material.packageMaterialId ? material.packageMaterialId.pmName : material.rawMaterialId.rmName}</td>
                    <td>${material.qty}</td>
                    <td>${material.packageMaterialId ? material.packageMaterialId.pmUOM : material.rawMaterialId.rmUOM}</td>
                    <td>${material.rate}</td>
                    <td>${material.per}</td>
                    <td>${material.amount}</td>
                </tr>
            `).join('')
                : '';

            let html = EmailTemplate.description.replace('#ContactPerson', partyDetails.person)
                .replace('#PartyName', partyDetails.partyName)
                .replace('#tableRows', tableRows)
                .replace('#GstRate', gstRate)
                .replace('#SubTotalAmount', subTotalAmount.toFixed(2))
                .replace('#GstAmount', gstAmount.toFixed(2))
                .replace('#TotalAmount', totalAmount.toFixed(2))

            let emaildata = {
                toMail: reqData.email,
                subject: EmailTemplate.emailSubject,
                fromMail: companyDetails.mailForSending,
                pass: companyDetails.pass,
                html: html,
            };

            mailsender(emaildata)

            if (reqData.purchaseOrderId && reqData.purchaseOrderId.trim() !== '') {
                let reqeust = {
                    status: 'Email Sent'
                }
                let podModel = await purchaseOrderDetailsModel(dbYear)
                const response = await podModel.findByIdAndUpdate(reqData.purchaseOrderId, reqeust, { new: true });
                if (response) {
                    let responseData = encryptionAPI(response, 1)
                    res.status(200).json({
                        data: {
                            statusCode: 200,
                            Message: "Email Sent Successfully",
                            responseData: responseData,
                            isEnType: true
                        },
                    });
                }
            }
        }
    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const approvePurchaseOrderByPurchaseId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let podModel = await purchaseOrderDetailsModel(dbYear)
            response = await podModel.findByIdAndUpdate(reqId, { status: 'Order Approved' }, { new: true, useFindAndModify: false });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Order approved successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const addEditInquiryDetails = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let responseData = {};
        if (reqData.inquiryEntryDetails.inquiryId && reqData.inquiryEntryDetails.inquiryId.trim() !== '') {
            let idModel = await inquiryDetailsModel(dbYear);
            const response = await idModel.findByIdAndUpdate(reqData.inquiryEntryDetails.inquiryId, reqData.inquiryEntryDetails, { new: true });
            if (response) {
                responseData.inquiryEntryDetails = response;
            } else {
                responseData.inquiryEntryDetails = 'Party details not found';
            }
        } else {
            let nextInquiryNo = 'IQR0001';

            let idModel = await inquiryDetailsModel(dbYear);
            const lastRecord = await idModel
                .findOne()
                .sort({ inquiryNo: -1 })
                .select('inquiryNo')
                .exec();

            if (lastRecord && lastRecord.inquiryNo) {
                const lastNumber = parseInt(lastRecord.inquiryNo.slice(3), 10);
                nextInquiryNo = `IQR${String(lastNumber + 1).padStart(4, '0')}`;
            }

            reqData.inquiryEntryDetails.inquiryNo = nextInquiryNo;

            let idModel1 = await inquiryDetailsModel(dbYear);
            const response = new idModel1(reqData.inquiryEntryDetails);
            await response.save();
            responseData.inquiryEntryDetails = response;
        }

        if (reqData.inquiryMaterialDetails.inquiryMaterialDetailsId && reqData.inquiryMaterialDetails.inquiryMaterialDetailsId.trim() !== '') {
            reqData.inquiryMaterialDetails.inquiryId = responseData.inquiryEntryDetails._id
            let iqmDetailsModel = await inquiryMaterialDetailsModel(dbYear);
            const response = await iqmDetailsModel.findByIdAndUpdate(reqData.inquiryMaterialDetails.inquiryMaterialDetailsId, reqData.inquiryMaterialDetails, { new: true });
            if (response) {
                responseData.materialDetails = response;
            } else {
                responseData.materialDetails = 'Material details not found';
            }
        } else {
            reqData.inquiryMaterialDetails.inquiryId = responseData.inquiryEntryDetails._id
            let iqmDetailsModel = await inquiryMaterialDetailsModel(dbYear);
            const response = new iqmDetailsModel(reqData.inquiryMaterialDetails);
            await response.save();
            responseData.materialDetails = response;
        }

        let encryptData = encryptionAPI(responseData, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Inquiry Details Updated Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getallInquiryDetails = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let queryObject = { isDeleted: false }

        if (reqData.materialType && reqData.materialType !== 'Select' && reqData.materialType.trim() !== '') {
            queryObject.materialType = reqData.materialType
        }

        if (reqData.status && reqData.status !== 'Select' && reqData.status.trim() !== '') {
            queryObject.status = reqData.status
        }

        if (reqData.inquiryNo && reqData.inquiryNo.trim() !== '') {
            queryObject.inquiryNo = reqData.inquiryNo
        }

        if (reqData.inquiryDate && reqData.inquiryDate.trim() !== '') {
            queryObject.inquiryDate = reqData.inquiryDate
        }
        let idModel = await inquiryDetailsModel(dbYear);
        let response = await idModel
            .find(queryObject)
            .sort({ createdAt: -1 });

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Inquiry Details Fetched Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getAllInquiryMaterialDetailsByInquiryId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = []
        if (reqId) {
            let iqmDetailsModel = await inquiryMaterialDetailsModel(dbYear);
            response = await iqmDetailsModel
                .find({ inquiryId: reqId, isDeleted: false })
                .populate({
                    path: 'rawMaterialId',
                    select: 'rmName rmUOM _id',
                })
                .populate({
                    path: 'packageMaterialId',
                    select: 'pmName pmUOM _id',
                });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Inquiry material details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const deleteInquiryDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let idModel = await inquiryDetailsModel(dbYear);
            response = await idModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Inquiry details deleted successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const deleteInquiryMaterialDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let iqmDetailsModel = await inquiryMaterialDetailsModel(dbYear);
            response = await iqmDetailsModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Inquiry material details deleted successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const sendInquiryToCompany = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')

        let cgModel = await companyGroupModel(dbYear)
        let companyDetails = await cgModel.findOne({});

        if (reqData.inquiryId) {
            let iqmDetailsModel = await inquiryMaterialDetailsModel(dbYear);
            let inquiryMaterialList = await iqmDetailsModel
                .find({ inquiryId: reqData.inquiryId, isDeleted: false })
                .populate({
                    path: 'rawMaterialId',
                    select: 'rmName rmUOM _id',
                })
                .populate({
                    path: 'packageMaterialId',
                    select: 'pmName pmUOM _id',
                });

            let etModel = await emailTemplateModel(dbYear)
            const EmailTemplate = await etModel.findOne({ emailTemplateId: 2 });

            const tableRows = inquiryMaterialList && inquiryMaterialList.length > 0
                ? inquiryMaterialList.map(material => `
                <tr>
                    <td>${material.packageMaterialId ? material.packageMaterialId.pmName : material.rawMaterialId.rmName}</td>
                    <td>${material.qty}</td>
                    <td>${material.packageMaterialId ? material.packageMaterialId.pmUOM : material.rawMaterialId.rmUOM}</td>
                </tr>
            `).join('') : '';

            reqData.companies.forEach(async (company) => {

                let html = EmailTemplate.description
                    .replace('#CompanyName', company.label)
                    .replace('#TableRows', tableRows)

                let emaildata = {
                    toMail: company.email,
                    subject: EmailTemplate.emailSubject,
                    fromMail: companyDetails.mailForSending,
                    pass: companyDetails.pass,
                    html: html,
                };

                mailsender(emaildata)
            });

            let reqeust = {
                status: 'Email Sent'
            }
            let idModel = await inquiryDetailsModel(dbYear);
            const response = await idModel.findByIdAndUpdate(reqData.inquiryId, reqeust, { new: true });

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Email sent successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }



    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getAllGoodsRegistered = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let queryObject = {
            isDeleted: false,
        };

        if (reqData.startDate && reqData.endDate) {
            let endDate = new Date(reqData.endDate);
            endDate.setHours(23, 59, 59, 999);
            queryObject.createdAt = { $gte: new Date(reqData.startDate), $lte: new Date(endDate) }
        }

        if (reqData.materialType && reqData.materialType !== 'Both' && reqData.materialType.trim() !== '') {
            if (reqData.materialType === 'Raw Material') {
                if (reqData.rawMaterialId && reqData.rawMaterialId.trim() !== '') {
                    queryObject.rawMaterialId = reqData.rawMaterialId
                } else {
                    queryObject.rawMaterialId = { $exists: true, $ne: null };
                }
            }

            if (reqData.materialType === 'Packing Material') {
                if (reqData.packageMaterialId && reqData.packageMaterialId.trim() !== '') {
                    queryObject.packageMaterialId = reqData.packageMaterialId
                } else {
                    queryObject.packageMaterialId = { $exists: true, $ne: null };
                }
            }

        }

        // queryObject["grnEntryPartyDetailId.partyId"] = { $exists: true, $ne: null };

        let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);
        let response = await gemDetailsModel
            .find(queryObject)
            .populate({
                path: 'rawMaterialId',
                select: 'rmName _id rmUOM',
            })
            .populate({
                path: 'packageMaterialId',
                select: 'pmName _id pmUOM',
            })
            .populate({
                path: 'grnEntryPartyDetailId',
                select: 'partyId grnNo grnDate invoiceNo _id',
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });
        response = response.filter(item => item.grnEntryPartyDetailId?.partyId);

        if (reqData.partyId && reqData.partyId.trim() !== '') {
            response = response.filter(item =>
                item.grnEntryPartyDetailId?.partyId?._id.toString() === reqData.partyId)
        }
        let encryptData = encryptionAPI(response, 1)


        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getAllMaterialWisePurchaseReport = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let queryObject = {
            isDeleted: false,
        };

        if (reqData.startDate && reqData.endDate) {
            let endDate = new Date(reqData.endDate);
            endDate.setHours(23, 59, 59, 999);
            queryObject.createdAt = { $gte: new Date(reqData.startDate), $lte: new Date(endDate) }
        }

        if (reqData.materialType === 'Raw Material') {
            if (reqData.rawMaterialId && reqData.rawMaterialId.trim() !== '') {
                queryObject.rawMaterialId = reqData.rawMaterialId
            } else {
                queryObject.rawMaterialId = { $exists: true, $ne: null };
            }
        }

        if (reqData.materialType === 'Packing Material') {
            if (reqData.packageMaterialId && reqData.packageMaterialId.trim() !== '') {
                queryObject.packageMaterialId = reqData.packageMaterialId
            } else {
                queryObject.packageMaterialId = { $exists: true, $ne: null };
            }
        }

        let pomDetailsModel = await purchaserOrderMaterialDetailsModel(dbYear)
        let response = await pomDetailsModel
            .find(queryObject)
            .populate({
                path: 'rawMaterialId',
                select: 'rmName _id',
            })
            .populate({
                path: 'packageMaterialId',
                select: 'pmName _id',
            })
            .populate({
                path: 'purchaseOrderId',
                select: 'partyId purchaseOrderNo purchaseOrderDate _id',
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });

        let encryptData = encryptionAPI(response, 1)


        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getAllItemsForStockLedgerReport = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let queryObject = {
            isDeleted: false,
        };

        if (reqData.endingDate) {
            let endDate = new Date(reqData.endingDate);
            endDate.setHours(23, 59, 59, 999);
            queryObject.createdAt = { $lte: endDate };
        }

        if (reqData.materialType === 'Raw Material') {
            queryObject.rawMaterialId = { $exists: true, $ne: null };
            queryObject.packageMaterialId = null;
            if (reqData.rawMaterialId !== '' && reqData.rawMaterialId.trim() !== '') {
                queryObject.rawMaterialId = reqData.rawMaterialId;
            }
        }

        if (reqData.materialType === 'Packing Material') {
            queryObject.packageMaterialId = { $exists: true, $ne: null };
            queryObject.rawMaterialId = null;
            if (reqData.packageMaterialId !== '' && reqData.packageMaterialId.trim() !== '') {
                queryObject.packageMaterialId = reqData.packageMaterialId;
            }
        }
        let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);
        let response = await gemDetailsModel
            .find(queryObject)
            .select('rawMaterialId packageMaterialId grnEntryPartyDetailId qty rate amount')
            .populate({
                path: 'rawMaterialId',
                select: 'rmName rmCategory rmUOM _id',
            })
            .populate({
                path: 'packageMaterialId',
                select: 'pmName pmCategory pmUOM _id',
            })
            .populate({
                path: 'grnEntryPartyDetailId',
                select: 'partyId purchaseOrderNo purchaseOrderDate _id',
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });

        if (reqData.materialType === 'Raw Material') {
            response = response.sort((a, b) => {
                const nameA = a.rawMaterialId?.rmName?.toLowerCase() || '';
                const nameB = b.rawMaterialId?.rmName?.toLowerCase() || '';
                return nameA.localeCompare(nameB);
            });

            if (reqData.categoryName && reqData.categoryName !== 'Select' && reqData.categoryName.trim() !== '') {
                response = response.filter((x) => {
                    return x.rawMaterialId.rmCategory === reqData.categoryName;
                });
            }

        } else if (reqData.materialType === 'Packing Material') {
            response = response.sort((a, b) => {
                const nameA = a.packageMaterialId?.pmName?.toLowerCase() || '';
                const nameB = b.packageMaterialId?.pmName?.toLowerCase() || '';
                return nameA.localeCompare(nameB);
            });

            if (reqData.categoryName && reqData.categoryName !== 'Select' && reqData.categoryName.trim() !== '') {
                response = response.filter((x) => {
                    return x.packageMaterialId.pmCategory === reqData.categoryName;
                });
            }
        }

        let processedData = response.reduce((acc, curr) => {
            if (reqData.materialType === "Raw Material") {
                const existingItem = acc.find((item) =>
                    item.rawMaterialId?._id.toString() === curr.rawMaterialId?._id.toString()
                );

                if (existingItem) {
                    existingItem.qty += curr.qty || 0;
                    existingItem.rate = curr.rate || existingItem.rate;
                    existingItem.totalAmount = existingItem.qty * (existingItem.rate || 0);
                } else {
                    acc.push({
                        rawMaterialId: curr.rawMaterialId,
                        qty: curr.qty || 0,
                        rate: curr.rate || 0,
                        totalAmount: (curr.qty || 0) * (curr.rate || 0)
                    });
                }
            } else {
                const existingItem = acc.find((item) =>
                    item.packageMaterialId?._id.toString() === curr.packageMaterialId?._id.toString()
                );

                if (existingItem) {
                    existingItem.qty += curr.qty || 0;
                    existingItem.totalAmount = existingItem.qty * (existingItem.rate || 0);
                } else {
                    acc.push({
                        packageMaterialId: curr.packageMaterialId,
                        qty: curr.qty || 0,
                        rate: curr.rate || 0,
                        totalAmount: (curr.qty || 0) * (curr.rate || 0)
                    });
                }
            }
            return acc;
        }, []);

        // Removing Production and GSTInvoice Qty 
        let prRMFormulaModel = await ProductionRequisitionRMFormulaModel(dbYear);
        let prPMFormulaModel = await PackingRequisitionPMFormulaModel(dbYear);

        let giRMItemModel = await gstinvoiceRMItemModel(dbYear)
        let giPMItemModel = await gstInvoicePMItemModel(dbYear)

        let addEntryModel = await additionalEntryMaterialDetailsModel(dbYear)

        processedData = await Promise.all(
            processedData.map(async (details) => {
                if (reqData.materialType === 'Raw Material') {
                    let productionUsedQty = await prRMFormulaModel.find({ isDeleted: false, rmName: details.rawMaterialId.rmName }).select('netQty');
                    let gstInvoiceUsedQty = await giRMItemModel.find({ itemId: details.rawMaterialId._id, isDeleted: false }).select('qty');
                    let additionalEntry = await addEntryModel.find({ rawMaterialId: details.rawMaterialId._id, isDeleted: false }).select('qty');
                    let totalUsedQty = productionUsedQty.reduce((sum, item) => sum + (item.netQty || 0), 0);
                    let totalGSTInvoiceUsed = gstInvoiceUsedQty.reduce((sum, item) => sum + (item.qty || 0), 0);
                    let additionalEntryUsed = additionalEntry.reduce((sum, item) => sum + (item.qty || 0), 0);

                    return {
                        ...details,
                        qty: (details.qty || 0) - totalUsedQty - totalGSTInvoiceUsed - additionalEntryUsed
                    };
                } else {
                    let productionUsedQty = await prPMFormulaModel.find({ isDeleted: false, pmName: details.packageMaterialId.pmName }).select('netQty');
                    let gstInvoiceUsedQty = await giPMItemModel.find({ itemId: details.packageMaterialId._id, isDeleted: false }).select('qty');
                    let additionalEntry = await addEntryModel.find({ packageMaterialId: details.packageMaterialId._id, isDeleted: false }).select('qty');
                    let totalUsedQty = productionUsedQty.reduce((sum, item) => sum + (item.netQty || 0), 0);
                    let totalGSTInvoiceUsed = gstInvoiceUsedQty.reduce((sum, item) => sum + (item.qty || 0), 0);
                    let additionalEntryUsed = additionalEntry.reduce((sum, item) => sum + (item.qty || 0), 0);

                    return {
                        ...details,
                        qty: (details.qty || 0) - totalUsedQty - totalGSTInvoiceUsed - additionalEntryUsed
                    };
                }
            })
        );

        let encryptData = encryptionAPI(processedData, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getAllStatementForPurchaseItemByItemId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let queryObject = {
            isDeleted: false,
        };
        if (reqData.materialType === 'Raw Material') {
            queryObject.rawMaterialId = reqData.item._id
        }

        if (reqData.materialType === 'Packing Material') {
            queryObject.packageMaterialId = reqData.item._id
        }

        let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);
        let response = await gemDetailsModel
            .find(queryObject)
            .populate({
                path: 'rawMaterialId',
                select: 'rmName rmCategory _id',
            })
            .populate({
                path: 'packageMaterialId',
                select: 'pmName pmCategory _id',
            })
            .populate({
                path: 'grnEntryPartyDetailId',
                select: 'partyId grnNo grnDate invoiceNo _id',
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });

        let queryObject1 = {
            isDeleted: false,
        };

        // Additional Entry 
        let responseFromAdditionalEntry = [];
        if (reqData.materialType === 'Raw Material') {
            let giRMItemModel = await additionalEntryMaterialDetailsModel(dbYear)
            responseFromAdditionalEntry = await giRMItemModel
                .find({ rawMaterialId: reqData.item._id, isDeleted: false }).populate({
                    path: 'additionalEntryDetailsId',
                    select: 'batchNo reqDate slipNo productName type'
                });
        }

        if (reqData.materialType === 'Packing Material') {
            let giPMItemModel = await additionalEntryMaterialDetailsModel(dbYear)
            responseFromAdditionalEntry = await giPMItemModel
                .find({ packageMaterialId: reqData.item._id, isDeleted: false })
                .populate({
                    path: 'additionalEntryDetailsId',
                    select: 'batchNo reqDate slipNo productName type',
                });
        }
        responseFromAdditionalEntry = responseFromAdditionalEntry.map(x => {
            return {
                ...x._doc,
                issueQty: x.qty,
                isAdditionalEntryRecord: true,
                isIssuedRecord: true,
            };
        });


        //Production Usage
        let responseFromUsedQty = [];
        if (reqData.materialType === 'Raw Material') {
            queryObject1.rmName = reqData.item.rmName

            let prRMFormulaModel = await ProductionRequisitionRMFormulaModel(dbYear);
            responseFromUsedQty = await prRMFormulaModel
                .find(queryObject1)
                .populate({
                    path: 'productDetialsId',
                    select: 'partyId productionNo productionPlanningDate batchNo _id',
                    populate: {
                        path: 'partyId',
                        select: 'partyName _id',
                    },
                })
                .populate({
                    path: 'productId',
                    select: 'productName',
                });
        }

        if (reqData.materialType === 'Packing Material') {
            queryObject1.pmName = reqData.item.pmName

            let prPMFormualModel = await PackingRequisitionPMFormulaModel(dbYear)
            responseFromUsedQty = await prPMFormualModel
                .find(queryObject1)
                .populate({
                    path: 'productDetialsId',
                    select: 'partyId productionNo productionPlanningDate batchNo _id',
                    populate: {
                        path: 'partyId',
                        select: 'partyName _id',
                    },
                })
                .populate({
                    path: 'packingItemId',
                    select: 'ItemName',
                });
        }
        responseFromUsedQty = responseFromUsedQty.map(x => {
            return {
                ...x._doc,
                issueQty: x.netQty,
                isIssuedRecord: true,
            };
        });


        // GST Invoice 
        let responseFromUsedGSTInvoice = [];
        if (reqData.materialType === 'Raw Material') {
            queryObject1.rmName = reqData.item.rmName

            let giRMItemModel = await gstinvoiceRMItemModel(dbYear)
            responseFromUsedGSTInvoice = await giRMItemModel
                .find({ itemId: reqData.item._id, isDeleted: false })
                .populate({
                    path: 'gstInvoiceRMID',
                    select: 'invoiceNo invoiceDate partyId',
                    populate: {
                        path: 'partyId',
                        select: 'partyName _id',
                    },
                });
        }

        if (reqData.materialType === 'Packing Material') {
            queryObject1.pmName = reqData.item.pmName

            let giPMItemModel = await gstInvoicePMItemModel(dbYear)
            responseFromUsedGSTInvoice = await giPMItemModel
                .find({ itemId: reqData.item._id, isDeleted: false })
                .populate({
                    path: 'gstInvoicePMID',
                    select: 'invoiceNo invoiceDate partyId',
                    populate: {
                        path: 'partyId',
                        select: 'partyName _id',
                    },
                });
        }
        responseFromUsedGSTInvoice = responseFromUsedGSTInvoice.map(x => {
            return {
                ...x._doc,
                issueQty: x.qty,
                isGSTInvoiceRecord: true,
            };
        });

        let combinedResponse = [
            ...response,
            ...responseFromUsedQty,
            ...responseFromUsedGSTInvoice,
            ...responseFromAdditionalEntry
        ];
        combinedResponse.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
        let encryptData = encryptionAPI(combinedResponse, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getAllShourtageReport = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let queryObject = {
            isDeleted: false,
        };

        if (reqData.materialType === 'Raw Material') {
            queryObject.rawMaterialId = { $exists: true, $ne: null };
        }

        if (reqData.materialType === 'Packing Material') {
            queryObject.packageMaterialId = { $exists: true, $ne: null };
        }

        let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);
        let grnMaterialRecords = await gemDetailsModel
            .find(queryObject)
            .populate({
                path: 'rawMaterialId',
                select: 'rmName rmUOM minQty rmCategory _id',
            })
            .populate({
                path: 'packageMaterialId',
                select: 'pmName pmUOM pmMinQty pmCategory _id',
            });

        let purchasedQtyMap = {};
        grnMaterialRecords.forEach(record => {
            let materialId = '';
            if (reqData.materialType === 'Packing Material') {
                materialId = record.packageMaterialId?._id?.toString();
            } else {
                materialId = record.rawMaterialId?._id?.toString();
            }
            let qty = record.qty || 0;

            if (materialId) {
                purchasedQtyMap[materialId] = (purchasedQtyMap[materialId] || 0) + qty;
            }
        });

        let shortageMaterials = []

        if (reqData.materialType === 'Raw Material') {
            let rmModel = await rawMaterialSchema(dbYear);
            let rawMaterials = await rmModel.find({ isDeleted: false }, 'rmName rmUOM minQty rmCategory _id');

            shortageMaterials = rawMaterials
                .map(material => {
                    let materialId = material._id.toString();
                    let purchasedQty = purchasedQtyMap[materialId] || 0;

                    return {
                        materialName: material.rmName,
                        stock: purchasedQty,
                        minQty: material.minQty,
                        uom: material.rmUOM
                    };
                })
                .filter(material => material.stock < material.minQty);
        } else {
            let pmModel = await packingMaterialSchema(dbYear);
            let packingMaterials = await pmModel.find({ isDeleted: false }, 'pmName pmUOM pmMinQty pmCategory _id');

            shortageMaterials = packingMaterials
                .map(material => {
                    let materialId = material._id.toString();
                    let purchasedQty = purchasedQtyMap[materialId] || 0;

                    return {
                        materialName: material.pmName,
                        stock: purchasedQty,
                        minQty: material.pmMinQty,
                        uom: material.pmUOM
                    };
                })
                .filter(material => material.stock < material.minQty);
        }

        let encryptData = encryptionAPI(shortageMaterials, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getAllNearExpiryReport = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let queryObject = {
            isDeleted: false,
        };

        if (reqData.materialType === 'Raw Material') {
            queryObject.rawMaterialId = { $exists: true, $ne: null };
        }

        if (reqData.materialType === 'Packing Material') {
            queryObject.packageMaterialId = { $exists: true, $ne: null };
        }

        let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);
        let response = await gemDetailsModel
            .find(queryObject)
            .populate({
                path: 'rawMaterialId',
                select: 'rmName rmUOM minQty rmCategory _id',
            })
            .populate({
                path: 'packageMaterialId',
                select: 'pmName pmUOM pmMinQty pmCategory _id',
            })
            .populate({
                path: 'grnEntryPartyDetailId',
                select: 'partyId grnNo grnDate invoiceNo _id',
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });

        const today = new Date();

        const responseWithMonthDifference = response.map(item => {
            const expDate = item.expDate;

            if (!expDate) return null;

            const expYear = expDate.getFullYear();
            const expMonth = expDate.getMonth();

            const todayYear = today.getFullYear();
            const todayMonth = today.getMonth();

            // Calculate the month difference
            const monthDifference = (expYear - todayYear) * 12 + (expMonth - todayMonth);

            return { ...item.toObject(), monthDifference };
        })
            .filter(item => item !== null && item.monthDifference >= 0 && item.monthDifference <= reqData.days);


        let encryptData = encryptionAPI(responseWithMonthDifference, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getAllPurchaseOrderRegister = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let queryObject = {
            isDeleted: false,
            purchaseOrderId: { $exists: true, $ne: null },
        };

        if (reqData.startDate && reqData.endDate) {
            let endDate = new Date(reqData.endDate);
            endDate.setHours(23, 59, 59, 999);
            queryObject.createdAt = { $gte: new Date(reqData.startDate), $lte: new Date(endDate) }
        }

        if (reqData.materialType && reqData.materialType !== 'Both' && reqData.materialType.trim() !== '') {
            if (reqData.materialType === 'Raw Material') {
                if (reqData.rawMaterialId && reqData.rawMaterialId.trim() !== '') {
                    queryObject.rawMaterialId = reqData.rawMaterialId
                } else {
                    queryObject.rawMaterialId = { $exists: true, $ne: null };
                }
            }

            if (reqData.materialType === 'Packing Material') {
                if (reqData.packageMaterialId && reqData.packageMaterialId.trim() !== '') {
                    queryObject.packageMaterialId = reqData.packageMaterialId
                } else {
                    queryObject.packageMaterialId = { $exists: true, $ne: null };
                }
            }
        }

        let status = [];
        if (reqData.isPendingPurchseReport) {
            status.push('Order Created', 'Email Sent');
        } else {
            status.push('Order Created', 'Email Sent', 'Order Approved');
        }

        let pomDetailsModel = await purchaserOrderMaterialDetailsModel(dbYear)
        let response = await pomDetailsModel
            .find(queryObject)
            .populate({
                path: 'rawMaterialId',
                select: 'rmName _id',
            })
            .populate({
                path: 'packageMaterialId',
                select: 'pmName _id',
            })
            .populate({
                path: 'purchaseOrderId',
                select: 'partyId purchaseOrderNo purchaseOrderDate gstApplicable deliveryBefore status _id',
                match: { status: { $in: status } },
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });

        response = response.filter((doc) => doc.purchaseOrderId !== null);

        if (reqData.partyId && reqData.partyId.trim() !== '') {
            response = response.filter(item =>
                item.purchaseOrderId.partyId._id.toString() === reqData.partyId)
        }
        let encryptData = encryptionAPI(response, 1)


        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

export {
    addEditGRNEntryMaterialMapping,
    getAllPartyListForGRNEntry,
    getAllgrnEntryMaterialDetailsById,
    deleteGRNEntryMaterialDetailsById,
    deleteItemforGRNEntryMaterialById,
    addEditAdditionalEntryMaterialMapping,
    getAllAdditionalEntryMaterialDetailsById,
    getAllAdditionalEntryList,
    deleteAdditionalEntryDetailsById,
    deleteAdditionalEntryMaterialDetailsById,
    addEditPurchaseOrderDetails,
    getAllPurchaseOrders,
    addEditPurchaserOrderMaterialDetails,
    getPurchaseOrderMaterialDetailsByPurchaseOrderId,
    deletePurchaseOrderDetailsById,
    deletepurchaseOrderMaterialDetialsById,
    sendPurchaseOrderMail,
    approvePurchaseOrderByPurchaseId,
    addEditInquiryDetails,
    getallInquiryDetails,
    getAllInquiryMaterialDetailsByInquiryId,
    deleteInquiryDetailsById,
    deleteInquiryMaterialDetailsById,
    sendInquiryToCompany,
    getAllGoodsRegistered,
    getAllMaterialWisePurchaseReport,
    getAllItemsForStockLedgerReport,
    getAllStatementForPurchaseItemByItemId,
    getAllShourtageReport,
    getAllNearExpiryReport,
    getAllPurchaseOrderRegister,
    getPurchaseOrderMaterialByPartyId
};