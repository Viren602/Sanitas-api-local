import dayjs from "dayjs";
import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import contraEntryModel from "../model/Account/contraEntryModel.js";
import generalCreditNoteModel from "../model/Account/generalCreditNoteModel.js";
import generalDebitNoteModel from "../model/Account/generalDebitNoteModel.js";
import gstPurchaseWithoutInventoryEntryModel from "../model/Account/gstPurcaseWithoutInventoryEntryModel.js";
import gstPurchaseEntryRMPMModel from "../model/Account/gstPurchaseEntryRMPMModel.js";
import gstPurchaseItemListRMPMModel from "../model/Account/gstPurchaseItemListRMPMModel.js";
import jvEntryModel from "../model/Account/jvEntryModel.js";
import paymentAdjustmentListModel from "../model/Account/paymentAdjustmentListModel.js";
import paymentReceiptEntryModel from "../model/Account/paymentReceiptEntryModel.js";
import daybookMasterModel from "../model/daybookMasterModel.js";
import gstInvoiceFinishGoodsModel from "../model/Despatch/gstInvoiceFinishGoods.js";
import gstInvoicePMModel from "../model/Despatch/gstInvoicePMModel.js";
import gstInvoiceRMModel from "../model/Despatch/gstInvoiceRMModel.js";
import grnEntryMaterialDetailsModel from "../model/InventoryModels/grnEntryMaterialDetailsModel.js";
import grnEntryPartyDetailsModel from "../model/InventoryModels/grnEntryPartyDetailsModel.js";
import partyModel from "../model/partiesModel.js";
import errorHandler from "../server/errorHandle.js";
import accountGroupModel from "../model/accountGroupModel.js";
import companyGroupModel from "../model/companyGroup.js";
import path from "path";
import fs from 'fs'
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Receipt Entry
const getReceiptEntryVoucherNo = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let response = {}
        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        let voucherNoRecord = await prEntryModel
            .findOne({ isDeleted: false, voucherNo: /^R\d+$/ })
            .sort({ _id: -1 })
            .select('voucherNo');

        if (voucherNoRecord && voucherNoRecord.voucherNo) {
            let lastNumber = parseInt(voucherNoRecord.voucherNo.replace('R', ''), 10);
            let newNumber = lastNumber + 1;

            response.voucherNo = `R${newNumber.toString().padStart(4, '0')}`;
        } else {
            response.voucherNo = 'R0001';
        }

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });
    } catch (error) {
        console.log("Error in Admin Account controller", error);
        errorHandler(error, req, res, "Error in Admin Account controller")
    }
};

const getAllPendingInvoiceByPartyId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let queryObject = {
            isDeleted: false,
            partyId: reqId,
            pendingAmount: { $gt: 0 }
        }
        let response = []

        if (reqId) {
            let gifgModel = await gstInvoiceFinishGoodsModel(dbYear);
            const finishGoodsData = await gifgModel
                .find(queryObject)
                .select('invoiceNo partyId invoiceDate pendingAmount grandTotal')
                .lean();

            let girModel = await gstInvoiceRMModel(dbYear);
            const rmData = await girModel
                .find(queryObject)
                .select('invoiceNo partyId invoiceDate pendingAmount grandTotal')
                .lean();

            let gipModel = await gstInvoicePMModel(dbYear);
            const pmData = await gipModel
                .find(queryObject)
                .select('invoiceNo partyId invoiceDate pendingAmount grandTotal')
                .lean();

            response = [
                ...finishGoodsData.map(item => ({
                    ...item,
                    gstInvoiceFinishGoodsId: item._id,
                    _id: undefined
                })),
                ...rmData.map(item => ({
                    ...item,
                    gstRMInvoiceId: item._id,
                    _id: undefined
                })),
                ...pmData.map(item => ({
                    ...item,
                    gstPMInvoiceId: item._id,
                    _id: undefined
                }))
            ];
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Invoice details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const addEditReceiptEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {}
        if (data.receiptDetails.paymentReceiptId && data.receiptDetails.paymentReceiptId.trim() !== '') {
            // Edit For Receipt Details
            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            const response = await prEntryModel.findByIdAndUpdate(data.receiptDetails.paymentReceiptId, data.receiptDetails, { new: true });
            console.log(response)
            if (!response) {
                responseData.receiptDetails = 'Party details not found';
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Invoice Details Not found",
                        responseData: encryptData,
                        isEnType: true,
                    },
                });
            }
            responseData.receiptDetails = response;

            let paListModel = await paymentAdjustmentListModel(dbYear);
            const existingAdjustments = await paListModel.find({ paymentReceiptId: response._id });
            let gifgModel = await gstInvoiceFinishGoodsModel(dbYear);
            let gipModel = await gstInvoicePMModel(dbYear);
            let girModel = await gstInvoiceRMModel(dbYear);
            const revertPromises = existingAdjustments.map(item => {
                let updates = [];
                let paidAmount = item.adjAmount;

                if (item.gstInvoiceFinishGoodsId) {
                    updates.push(
                        gifgModel.findByIdAndUpdate(
                            item.gstInvoiceFinishGoodsId,
                            { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                        )
                    );
                }
                if (item.gstRMInvoiceId) {
                    updates.push(
                        girModel.findByIdAndUpdate(
                            item.gstRMInvoiceId,
                            { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                        )
                    );
                }
                if (item.gstPMInvoiceId) {
                    updates.push(
                        gipModel.findByIdAndUpdate(
                            item.gstPMInvoiceId,
                            { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                        )
                    );
                }
                return Promise.all(updates);
            });

            await Promise.all(revertPromises);

            // Edit Adjustment Details
            let paListModel2 = await paymentAdjustmentListModel(dbYear);
            await paListModel2.deleteMany({ paymentReceiptId: response._id });
            const items = data.adjustmentDetailsList.map(item => ({
                ...item,
                paymentReceiptId: response._id
            }));

            let paListModel1 = await paymentAdjustmentListModel(dbYear);
            await paListModel1.insertMany(items);

            let gifgModel1 = await gstInvoiceFinishGoodsModel(dbYear);
            let gipModel1 = await gstInvoicePMModel(dbYear);
            let girModel1 = await gstInvoiceRMModel(dbYear);
            // Re-Update Adjustment
            const updatePromises = data.adjustmentDetailsList.map(item => {
                let updates = [];
                let paidAmount = item.adjAmount;

                if (item.gstInvoiceFinishGoodsId) {
                    updates.push(
                        gifgModel1.findByIdAndUpdate(
                            item.gstInvoiceFinishGoodsId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                if (item.gstRMInvoiceId) {
                    updates.push(
                        girModel1.findByIdAndUpdate(
                            item.gstRMInvoiceId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                if (item.gstPMInvoiceId) {
                    updates.push(
                        gipModel1.findByIdAndUpdate(
                            item.gstPMInvoiceId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                return Promise.all(updates);
            });
            await Promise.all(updatePromises);

            let encryptData = encryptionAPI(responseData, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Payment Details Updated Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });


        } else {
            // Add Receipt Details
            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            const response = new prEntryModel(data.receiptDetails);
            await response.save();

            const items = data.adjustmentDetailsList.map(item => ({
                ...item,
                paymentReceiptId: response._id
            }));

            // Add Adjustment Details
            let paListModel = await paymentAdjustmentListModel(dbYear);
            await paListModel.insertMany(items);

            let gifgMode = await gstInvoiceFinishGoodsModel(dbYear);
            let gipModel = await gstInvoicePMModel(dbYear);
            let girModel = await gstInvoiceRMModel(dbYear);
            // Update Amounts in GST Invoices
            const updatePromises = data.adjustmentDetailsList.map(item => {
                const updates = [];
                let paidAmount = item.adjAmount;

                if (item.gstInvoiceFinishGoodsId) {
                    updates.push(
                        gifgMode.findByIdAndUpdate(
                            item.gstInvoiceFinishGoodsId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                if (item.gstRMInvoiceId) {
                    updates.push(
                        girModel.findByIdAndUpdate(
                            item.gstRMInvoiceId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                if (item.gstPMInvoiceId) {
                    updates.push(
                        gipModel.findByIdAndUpdate(
                            item.gstPMInvoiceId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                return Promise.all(updates);
            });
            await Promise.all(updatePromises);

            responseData.receiptDetails = response;
            let encryptData = encryptionAPI(responseData, 1);
            res.status(200).json({
                data: {

                    statusCode: 200,
                    Message: "Payment Details Inserted Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const getAllReceiptEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
            from: data.from
        }

        let sortOption = { voucherNo: -1 };
        if (data.arrangedBy && data.arrangedBy.trim() !== '' && data.arrangedBy !== 'Select') {
            sortOption = { [data.arrangedBy]: 1 };
        }

        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        let response = await prEntryModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
                }
            },
            { $unwind: "$partyDetails" },
            {
                $project: {
                    voucherNo: 1,
                    date: 1,
                    partyName: "$partyDetails.partyName",
                    chqNo: 1,
                    creditAmount: 1,
                    _id: 1
                }
            },
            { $sort: sortOption }
        ]);


        if (data.search && data.search.trim() !== '') {
            response = response.filter(item =>
                item.partyName?.toLowerCase().startsWith(data.search.toLowerCase())
            );
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Receipt Details Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getReceiptDetailsByReceiptId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}

        if (reqId) {
            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            let receiptDetails = await prEntryModel.findOne({ isDeleted: false, _id: reqId })
            response.receiptDetails = receiptDetails

            let paListModel = await paymentAdjustmentListModel(dbYear);
            let adjustmentDetailsList = await paListModel.find({ isDeleted: false, paymentReceiptId: reqId })
            response.adjustmentDetailsList = adjustmentDetailsList
        }
        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Receipt details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const deleteReceiptDetailsByReceiptId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        // Retrieve Existing Adjustments 
        let paListModel = await paymentAdjustmentListModel(dbYear);
        const existingAdjustments = await paListModel.find({ paymentReceiptId: reqId });

        let gifgModel = await gstInvoiceFinishGoodsModel(dbYear);
        let gipModel = await gstInvoicePMModel(dbYear);
        let girModel = await gstInvoiceRMModel(dbYear);
        const revertPromises = existingAdjustments.map(item => {
            let updates = [];
            let paidAmount = item.adjAmount;

            if (item.gstInvoiceFinishGoodsId) {
                updates.push(
                    gifgModel.findByIdAndUpdate(
                        item.gstInvoiceFinishGoodsId,
                        { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                    )
                );
            }
            if (item.gstRMInvoiceId) {
                updates.push(
                    girModel.findByIdAndUpdate(
                        item.gstRMInvoiceId,
                        { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                    )
                );
            }
            if (item.gstPMInvoiceId) {
                updates.push(
                    gipModel.findByIdAndUpdate(
                        item.gstPMInvoiceId,
                        { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                    )
                );
            }
            return Promise.all(updates);
        });
        await Promise.all(revertPromises);

        let paListModel1 = await paymentAdjustmentListModel(dbYear);
        await paListModel1.deleteMany({ paymentReceiptId: reqId });

        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        const response = await prEntryModel.findByIdAndUpdate(reqId, { isDeleted: true });

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Receipt details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

// Payment Entry
const getPaymentEntryVoucherNo = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let response = {}
        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        let voucherNoRecord = await prEntryModel
            .findOne({ isDeleted: false, voucherNo: /^P\d+$/ })
            .sort({ _id: -1 })
            .select('voucherNo');

        if (voucherNoRecord && voucherNoRecord.voucherNo) {
            let lastNumber = parseInt(voucherNoRecord.voucherNo.replace('P', ''), 10);
            let newNumber = lastNumber + 1;

            response.voucherNo = `P${newNumber.toString().padStart(4, '0')}`;
        } else {
            response.voucherNo = 'P0001';
        }

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });
    } catch (error) {
        console.log("Error in Admin Account controller", error);
        errorHandler(error, req, res, "Error in Admin Account controller")
    }
};

const getAllPendingInvoiceForPaymentEntryByPartyId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let queryObject = {
            isDeleted: false,
            partyId: reqId,
            pendingAmount: { $gt: 0 }
        }
        let response = []

        if (reqId) {
            let gpeRMPMModel = await gstPurchaseEntryRMPMModel(dbYear);
            const gstPurchaseEntryData = await gpeRMPMModel
                .find(queryObject)
                .select('invoiceNo partyId invoiceDate pendingAmount grandTotal')
                .lean();

            let gpWithoutInventoryEntryModel = await gstPurchaseWithoutInventoryEntryModel(dbYear);
            const gstPurchaseWithoutInventoryData = await gpWithoutInventoryEntryModel
                .find(queryObject)
                .select('invoiceNo partyId invoiceDate pendingAmount grandTotal')
                .lean();

            response = [
                ...gstPurchaseEntryData.map(item => ({
                    ...item,
                    gstPurchaseEntryRMPMId: item._id,
                    _id: undefined
                })),
                ...gstPurchaseWithoutInventoryData.map(item => ({
                    ...item,
                    gstPurchaseEntryWithoutInventoryId: item._id,
                    _id: undefined
                })),

            ];
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Invoice details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const addEditPaymentEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {}
        if (data.paymentDetails.paymentReceiptId && data.paymentDetails.paymentReceiptId.trim() !== '') {
            // Edit For Receipt Details
            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            const response = await prEntryModel.findByIdAndUpdate(data.paymentDetails.paymentReceiptId, data.paymentDetails, { new: true });
            console.log(response)
            if (!response) {
                responseData.paymentDetails = 'Party details not found';
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Invoice Details Not found",
                        responseData: encryptData,
                        isEnType: true,
                    },
                });
            }
            responseData.paymentDetails = response;


            // Retrieve Existing Adjustments 
            let paListModel = await paymentAdjustmentListModel(dbYear);
            const existingAdjustments = await paListModel.find({ paymentReceiptId: response._id });

            let gpeRMPMModel = await gstPurchaseEntryRMPMModel(dbYear);
            let gpWithoutInventoryEntryModel = await gstPurchaseWithoutInventoryEntryModel(dbYear);
            const revertPromises = existingAdjustments.map(item => {
                let updates = [];
                let paidAmount = item.adjAmount;

                if (item.gstPurchaseEntryRMPMId) {
                    updates.push(
                        gpeRMPMModel.findByIdAndUpdate(
                            item.gstPurchaseEntryRMPMId,
                            { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                        )
                    );
                }
                if (item.gstPurchaseEntryWithoutInventoryId) {
                    updates.push(
                        gpWithoutInventoryEntryModel.findByIdAndUpdate(
                            item.gstPurchaseEntryWithoutInventoryId,
                            { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                        )
                    );
                }
                return Promise.all(updates);
            });

            await Promise.all(revertPromises);

            // Edit Adjustment Details
            let paListModel1 = await paymentAdjustmentListModel(dbYear);
            await paListModel1.deleteMany({ paymentReceiptId: response._id });
            const items = data.adjustmentDetailsList.map(item => ({
                ...item,
                paymentReceiptId: response._id
            }));

            let paListModel2 = await paymentAdjustmentListModel(dbYear);
            await paListModel2.insertMany(items);

            // Re-Update Adjustment
            let gpeRMPMModel1 = await gstPurchaseEntryRMPMModel(dbYear);
            let gpWithoutInventoryEntryModel1 = await gstPurchaseWithoutInventoryEntryModel(dbYear);
            const updatePromises = data.adjustmentDetailsList.map(item => {
                let updates = [];
                let paidAmount = item.adjAmount;

                if (item.gstPurchaseEntryRMPMId) {
                    updates.push(
                        gpeRMPMModel1.findByIdAndUpdate(
                            item.gstPurchaseEntryRMPMId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                if (item.gstPurchaseEntryWithoutInventoryId) {
                    updates.push(
                        gpWithoutInventoryEntryModel1.findByIdAndUpdate(
                            item.gstPurchaseEntryWithoutInventoryId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                return Promise.all(updates);
            });
            await Promise.all(updatePromises);

            let encryptData = encryptionAPI(responseData, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Receipt Details Updated Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });


        } else {
            // Add Receipt Details
            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            const response = new prEntryModel(data.paymentDetails);
            await response.save();

            const items = data.adjustmentDetailsList.map(item => ({
                ...item,
                paymentReceiptId: response._id
            }));

            // Add Adjustment Details
            let paListModel = await paymentAdjustmentListModel(dbYear);
            await paListModel.insertMany(items);

            let gpeRMPMModel = await gstPurchaseEntryRMPMModel(dbYear);
            let gpWithoutInventoryEntryModel = await gstPurchaseWithoutInventoryEntryModel(dbYear);
            // Update Amounts in GST Invoices
            const updatePromises = data.adjustmentDetailsList.map(item => {
                const updates = [];
                let paidAmount = item.adjAmount;

                if (item.gstPurchaseEntryRMPMId) {
                    updates.push(
                        gpeRMPMModel.findByIdAndUpdate(
                            item.gstPurchaseEntryRMPMId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                if (item.gstPurchaseEntryWithoutInventoryId) {
                    updates.push(
                        gpWithoutInventoryEntryModel.findByIdAndUpdate(
                            item.gstPurchaseEntryWithoutInventoryId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                return Promise.all(updates);
            });
            await Promise.all(updatePromises);

            responseData.paymentDetails = response;
            let encryptData = encryptionAPI(responseData, 1);
            res.status(200).json({
                data: {

                    statusCode: 200,
                    Message: "Receipt Details Inserted Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const getAllPaymnetEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
            from: data.from
        }

        let sortOption = { voucherNo: -1 };
        if (data.arrangedBy && data.arrangedBy.trim() !== '' && data.arrangedBy !== 'Select') {
            sortOption = { [data.arrangedBy]: 1 };
        }

        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        let response = await prEntryModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
                }
            },
            { $unwind: "$partyDetails" },
            {
                $project: {
                    voucherNo: 1,
                    date: 1,
                    partyName: "$partyDetails.partyName",
                    chqNo: 1,
                    debitAmount: 1,
                    _id: 1
                }
            },
            { $sort: sortOption }
        ]);

        if (data.search && data.search.trim() !== '') {
            response = response.filter(item =>
                item.partyName?.toLowerCase().startsWith(data.search.toLowerCase())
            );
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Payment Details Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getPaymentDetailsByPaymnetReceiptId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}

        if (reqId) {
            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            let paymentDetails = await prEntryModel.findOne({ isDeleted: false, _id: reqId })
            response.paymentDetails = paymentDetails

            let paListModel = await paymentAdjustmentListModel(dbYear);
            let adjustmentDetailsList = await paListModel.find({ isDeleted: false, paymentReceiptId: reqId })
            response.adjustmentDetailsList = adjustmentDetailsList
        }
        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Payment details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const deletePaymentDetailsByPaymentReceiptId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        // Retrieve Existing Adjustments 
        let paListModel = await paymentAdjustmentListModel(dbYear);
        const existingAdjustments = await paListModel.find({ paymentReceiptId: reqId });

        let gpeRMPMModel = await gstPurchaseEntryRMPMModel(dbYear);
        let gpWithoutInventoryEntryModel = await gstPurchaseWithoutInventoryEntryModel(dbYear);
        const revertPromises = existingAdjustments.map(item => {
            let updates = [];
            let paidAmount = item.adjAmount;

            if (item.gstPurchaseEntryRMPMId) {
                updates.push(
                    gpeRMPMModel.findByIdAndUpdate(
                        item.gstPurchaseEntryRMPMId,
                        { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                    )
                );
            }
            if (item.gstPurchaseEntryWithoutInventoryId) {
                updates.push(
                    gpWithoutInventoryEntryModel.findByIdAndUpdate(
                        item.gstPurchaseEntryWithoutInventoryId,
                        { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                    )
                );
            }
            return Promise.all(updates);
        });
        await Promise.all(revertPromises);

        let paListModel1 = await paymentAdjustmentListModel(dbYear);
        await paListModel1.deleteMany({ paymentReceiptId: reqId });

        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        const response = await prEntryModel.findByIdAndUpdate(reqId, { isDeleted: true });

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Payment details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

// Contra Entry
const getContraEntryVoucherNo = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let response = {}
        let ceModel = await contraEntryModel(dbYear);
        let voucherNoRecord = await ceModel
            .findOne({ isDeleted: false, voucherNo: /^C\d+$/ })
            .sort({ _id: -1 })
            .select('voucherNo');

        if (voucherNoRecord && voucherNoRecord.voucherNo) {
            let lastNumber = parseInt(voucherNoRecord.voucherNo.replace('C', ''), 10);
            let newNumber = lastNumber + 1;

            response.voucherNo = `C${newNumber.toString().padStart(4, '0')}`;
        } else {
            response.voucherNo = 'C0001';
        }

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });
    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const addEditContraEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        if (data.contraId && data.contraId.trim() !== '') {
            let ceModel = await contraEntryModel(dbYear);
            const response = await ceModel.findByIdAndUpdate(data.contraId, data, { new: true });

            if (!response) {
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Contra Details Not found",
                        responseData: encryptData,
                        isEnType: true,
                    },
                });
            }

            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            await prEntryModel.deleteMany({ contraId: data.contraId });

            // Create New Transactions
            let prEntryModel1 = await paymentReceiptEntryModel(dbYear);
            const debitTransaction = new prEntryModel1({
                voucherNo: data.voucherNo,
                bankId: data.fromDaybookId,
                date: data.date,
                chqNo: data.chqNo,
                debitAmount: data.amount,
                narration1: data.narration1,
                narration2: data.narration2,
                entryType: 'ContraEntry',
                from: 'ContraEntryDebit',
                contraId: response._id
            });

            let prEntryModel2 = await paymentReceiptEntryModel(dbYear);
            const creditTransaction = new prEntryModel2({
                voucherNo: data.voucherNo,
                bankId: data.toDayBookId,
                date: data.date,
                chqNo: data.chqNo,
                creditAmount: data.amount,
                narration1: data.narration1,
                narration2: data.narration2,
                entryType: 'ContraEntry',
                from: 'ContraEntryCredit',
                contraId: response._id
            });

            await debitTransaction.save();
            await creditTransaction.save();

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Contra Details Updated Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });


        } else {
            // Add Contra Details
            let ceModel = await contraEntryModel(dbYear);
            const response = new ceModel(data);
            await response.save();

            // Paymen Receipt Entry Table
            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            const debitTransaction = new prEntryModel({
                voucherNo: data.voucherNo,
                bankId: data.fromDaybookId,
                date: data.date,
                chqNo: data.chqNo,
                debitAmount: data.amount,
                narration1: data.narration1,
                narration2: data.narration2,
                entryType: 'ContraEntry',
                from: 'ContraEntryDebit',
                contraId: response._id
            });

            let prEntryModel1 = await paymentReceiptEntryModel(dbYear);
            const creditTransaction = new prEntryModel1({
                voucherNo: data.voucherNo,
                bankId: data.toDayBookId,
                date: data.date,
                chqNo: data.chqNo,
                creditAmount: data.amount,
                narration1: data.narration1,
                narration2: data.narration2,
                entryType: 'ContraEntry',
                from: 'ContraEntryCredit',
                contraId: response._id
            });

            await debitTransaction.save();
            await creditTransaction.save();

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {

                    statusCode: 200,
                    Message: "Contra Details Inserted Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const getAllContraEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
        }

        let sortBy = { createdAt: -1 };

        if (data.search && data.search.trim() !== "") {
            queryObject.voucherNo = { $regex: `^${data.search}`, $options: "i" };
        }

        if (data.arrangedBy && data.arrangedBy.trim() !== "" && data.arrangedBy !== "Select") {
            sortBy = { [data.arrangedBy]: 1 };
        }

        let response = []
        let ceModel = await contraEntryModel(dbYear);
        response = await ceModel
            .find(queryObject)
            .sort(sortBy);

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Contra Details Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getContraEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}

        if (reqId) {
            let ceModel = await contraEntryModel(dbYear);
            response = await ceModel.findOne({ isDeleted: false, _id: reqId })
        }
        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Payment details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const deleteContraEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        await prEntryModel.updateMany(
            { contraId: reqId },
            { isDeleted: true });

        let ceModel = await contraEntryModel(dbYear);
        const response = await ceModel.findByIdAndUpdate(reqId, { isDeleted: true });

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Contra Entry Deleted Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

// GST Purchase Entry RM PM
const getGSTPurchseEntrySRNo = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let response = {}
        let gpeRMPMModel = await gstPurchaseEntryRMPMModel(dbYear);
        let gstNoRecord = await gpeRMPMModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select('srNo');

        if (gstNoRecord && gstNoRecord.srNo) {
            let lastNumber = parseInt(gstNoRecord.srNo.replace('RP', ''), 10);
            let newNumber = lastNumber + 1;

            response.srNo = `RP${newNumber.toString().padStart(4, '0')}`;
        } else {
            response.srNo = 'RP0001';
        }

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });
    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const getAllPendingGRNPurchaseEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);
        let gepdModel = await grnEntryPartyDetailsModel(dbYear);
        let response = await gemDetailsModel
            .find({
                isDeleted: false,
                isGSTPurchaseEntryRMPM: false,
                grnEntryPartyDetailId: await gepdModel.findOne({
                    partyId: data.partyId,
                    invoiceNo: data.invoiceNo,
                    isDeleted: false,
                }).distinct('_id')
            })
            .populate({
                path: 'grnEntryPartyDetailId',
                select: 'partyId invoiceNo grnNo grnDate',
            })
            .populate({
                path: 'rawMaterialId',
                select: 'rmName',
            })
            .populate({
                path: 'packageMaterialId',
                select: 'pmName',
            })

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Pending GRN Entry Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const updateGRNEntryToPurchaseEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);
        let response = await gemDetailsModel
            .findByIdAndUpdate(data.grnMaterialId, { isGSTPurchaseEntryRMPM: data.isGRNEntryDone })

        let gemPartyDetailsModel = await grnEntryPartyDetailsModel(dbYear);
        await gemPartyDetailsModel
            .findByIdAndUpdate(response.grnEntryPartyDetailId, { isGSTPurchaseEntryRMPM: data.isGRNEntryDone })

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "GRN Entry Details Updated Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const addEditGSTPurchaseEntryRMPM = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {}

        if (data.itemListing && data.itemListing.length > 0) {
            let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);

            await Promise.all(data.itemListing.map(async (item) => {
                let grnItem = await gemDetailsModel.findByIdAndUpdate(item.grnMaterialId, { isGSTPurchaseEntryRMPM: true });

                console.log(grnItem)
                let gemPartyDetailsModel = await grnEntryPartyDetailsModel(dbYear);
                await gemPartyDetailsModel
                    .findByIdAndUpdate(grnItem.grnEntryPartyDetailId, { isGSTPurchaseEntryRMPM: true })
            }));
        }

        if (data.invoiceDetails.gstPurchaseEntryRMPMId && data.invoiceDetails.gstPurchaseEntryRMPMId.trim() !== '') {
            // Edit For Purchase Details
            let gpeRMPMModel = await gstPurchaseEntryRMPMModel(dbYear);
            const response = await gpeRMPMModel.findByIdAndUpdate(data.invoiceDetails.gstPurchaseEntryRMPMId, data.invoiceDetails, { new: true });
            if (!response) {
                responseData.invoiceDetails = 'Purchase details not found';
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Purchase Not found",
                        responseData: encryptData,
                        isEnType: true,
                    },
                });
            }

            // Payment Receipt Entry
            let request = {
                voucherNo: data.invoiceDetails.srNo,
                date: data.invoiceDetails.invoiceDate,
                partyId: data.invoiceDetails.partyId,
                creditAmount: data.invoiceDetails.grandTotal,
                narration1: `INVOICE NO : ${data.invoiceDetails.invoiceNo}`,
            }

            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            await prEntryModel.findOneAndUpdate(
                { gstpurchaseInvoiceRMPMId: data.invoiceDetails.gstPurchaseEntryRMPMId },
                request,
                { new: true }
            );

            // Edit Items For GST Purchase Details
            let gpitemListRMPMModel = await gstPurchaseItemListRMPMModel(dbYear);
            await gpitemListRMPMModel.deleteMany({ gstPurchaseEntryRMPMId: response._id });

            const items = data.itemListing.map(item => ({
                ...item,
                gstPurchaseEntryRMPMId: response._id
            }));

            let gpitemListRMPMModel1 = await gstPurchaseItemListRMPMModel(dbYear);
            await gpitemListRMPMModel1.insertMany(items);

            responseData.invoiceDetails = response;
            let encryptData = encryptionAPI(responseData, 1);

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "GST Purchase Details Updated Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        } else {
            // Add Edit For GST Purchase Details
            let gpeRMPMModel = await gstPurchaseEntryRMPMModel(dbYear);
            const response = new gpeRMPMModel(data.invoiceDetails);
            await response.save();

            responseData.invoiceDetails = response;

            const items = data.itemListing.map(item => ({
                ...item,
                gstPurchaseEntryRMPMId: response._id
            }));

            // Payment Receipt Entry
            let request = {
                voucherNo: data.invoiceDetails.srNo,
                bankName: 'PURCHASE',
                date: data.invoiceDetails.invoiceDate,
                partyId: data.invoiceDetails.partyId,
                partyBankNameOrPayto: '-',
                chqNo: '-',
                debitAmount: 0,
                creditAmount: data.invoiceDetails.grandTotal,
                narration1: `INVOICE NO : ${data.invoiceDetails.invoiceNo}`,
                narration2: '',
                narration3: '',
                entryType: 'Payment',
                from: 'GSTPurchaseEntryRMPM',
                gstpurchaseInvoiceRMPMId: response._id,
            }
            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            let paymentEntry = new prEntryModel(request);
            await paymentEntry.save();

            // ADD Items For GST Purchase Details
            let gpitemListRMPMModel = await gstPurchaseItemListRMPMModel(dbYear);
            await gpitemListRMPMModel.insertMany(items);

            let encryptData = encryptionAPI(responseData, 1);

            res.status(200).json({
                data: {

                    statusCode: 200,
                    Message: "GST Purchase Details Inserted Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const getAllGSTPurchaseEntryRMPM = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
        }

        let sortOption = { srNo: -1 };

        if (data.arrangedBy && data.arrangedBy.trim() !== '' && data.arrangedBy !== 'Select') {
            sortOption = { [data.arrangedBy]: 1 };
        }

        let gpeRMPMModel = await gstPurchaseEntryRMPMModel(dbYear);
        let response = await gpeRMPMModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
                }
            },
            { $unwind: "$partyDetails" },
            {
                $project: {
                    srNo: 1,
                    invoiceNo: 1,
                    invoiceDate: 1,
                    partyName: "$partyDetails.partyName",
                    grandTotal: 1,
                    _id: 1
                }
            },
            { $sort: sortOption }
        ]);

        if (data.partyName && data.partyName.trim() !== '') {
            response = response.filter(item =>
                item.partyName?.toLowerCase().startsWith(data.partyName.toLowerCase())
            );
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "GST Purchase Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getGSTPurchaseEntryRMPMById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let gpeRMPMModel = await gstPurchaseEntryRMPMModel(dbYear);
        let invoiceDetails = await gpeRMPMModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: "partyId",
                select: "partyName",
            });

        let gpitemListRMPMModel = await gstPurchaseItemListRMPMModel(dbYear);
        let itemListing = await gpitemListRMPMModel
            .find({ gstPurchaseEntryRMPMId: reqId, isDeleted: false });

        let response = {
            invoiceDetails: invoiceDetails,
            itemListing: itemListing
        }
        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const deleteGSTPurchaseEntryRMPMById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let gpitemListRMPMModel = await gstPurchaseItemListRMPMModel(dbYear);
        let list = await gpitemListRMPMModel.find({ gstPurchaseEntryRMPMId: reqId, isDeleted: false });

        if (list && list.length > 0) {
            let gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);

            await Promise.all(list.map(async (item) => {
                let grnItem = await gemDetailsModel.findByIdAndUpdate(item.grnMaterialId, { isGSTPurchaseEntryRMPM: false });

                let gemPartyDetailsModel = await grnEntryPartyDetailsModel(dbYear);
                await gemPartyDetailsModel
                    .findByIdAndUpdate(grnItem.grnEntryPartyDetailId, { isGSTPurchaseEntryRMPM: false })
            }));
        }
        await gpitemListRMPMModel.updateMany({ gstPurchaseEntryRMPMId: reqId }, { isDeleted: true });

        let gpeRMPMModel = await gstPurchaseEntryRMPMModel(dbYear);
        const response = await gpeRMPMModel.findByIdAndUpdate(reqId, { isDeleted: true });

        // Payment Receipt Entry
        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        await prEntryModel.findOneAndUpdate({ gstpurchaseInvoiceRMPMId: reqId }, { isDeleted: true }, { new: true });

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "GST Purchase Entry Deleted Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

// GST Purchase EntryWithOut Inventory
const getGSTPurchseWithoutInventoryEntrySRNo = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let response = {}
        let gpWithoutInventoryEntryModel = await gstPurchaseWithoutInventoryEntryModel(dbYear);
        let gstNoRecord = await gpWithoutInventoryEntryModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select('srNo');

        if (gstNoRecord && gstNoRecord.srNo) {
            let lastNumber = parseInt(gstNoRecord.srNo.replace('WI', ''), 10);
            let newNumber = lastNumber + 1;

            response.srNo = `WI${newNumber.toString().padStart(4, '0')}`;
        } else {
            response.srNo = 'WI0001';
        }

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });
    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const addEditGSTPurchaseEntryWithoutInventory = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {}

        if (data.gstPurchaseEntryWithoutInventoryId && data.gstPurchaseEntryWithoutInventoryId.trim() !== '') {

            let gpWithoutInventoryEntryModel = await gstPurchaseWithoutInventoryEntryModel(dbYear);
            const response = await gpWithoutInventoryEntryModel.findByIdAndUpdate(data.gstPurchaseEntryWithoutInventoryId, data, { new: true });
            if (!response) {
                responseData = 'Purchase details not found';
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Purchase Not found",
                        responseData: responseData,
                        isEnType: true,
                    },
                });
            }

            // Payment Receipt Entry
            let request = {
                voucherNo: data.srNo,
                date: data.invoiceDate,
                partyId: data.partyId,
                creditAmount: data.grandTotal,
                narration1: `INVOICE NO : ${data.invoiceNo}`,
            }

            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            await prEntryModel.findOneAndUpdate(
                { gstPurchaseEntryWithoutInventoryId: data.gstPurchaseEntryWithoutInventoryId },
                request,
                { new: true }
            );

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "GST Purchase Without Inventory Updated Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        } else {
            let gpWithoutInventoryEntryModel = await gstPurchaseWithoutInventoryEntryModel(dbYear);
            const response = new gpWithoutInventoryEntryModel(data);
            await response.save();

            // Payment Receipt Entry
            let request = {
                voucherNo: data.srNo,
                bankName: 'PURCHASE',
                date: data.invoiceDate,
                partyId: data.partyId,
                partyBankNameOrPayto: '-',
                chqNo: '-',
                debitAmount: 0,
                creditAmount: data.grandTotal,
                narration1: `INVOICE NO : ${data.invoiceNo}`,
                narration2: '',
                narration3: '',
                entryType: 'Payment',
                from: 'GSTPurchaseWithoutInventory',
                gstPurchaseEntryWithoutInventoryId: response._id,
            }
            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            let paymentEntry = new prEntryModel(request);
            await paymentEntry.save();

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "GST Purchase Without Inventory Inserted Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const getAllPurchaseEntryWithoutInventory = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
        }

        let sortOption = { srNo: -1 };
        if (data.arrangedBy && data.arrangedBy.trim() !== '' && data.arrangedBy !== 'Select') {
            sortOption = { [data.arrangedBy]: 1 };
        }

        let gpWithoutInventoryEntryModel = await gstPurchaseWithoutInventoryEntryModel(dbYear);
        let response = await gpWithoutInventoryEntryModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
                }
            },
            { $unwind: "$partyDetails" },
            {
                $project: {
                    srNo: 1,
                    invoiceNo: 1,
                    invoiceDate: 1,
                    partyName: "$partyDetails.partyName",
                    grandTotal: 1,
                    _id: 1
                }
            },
            { $sort: sortOption }
        ]);

        if (data.partyName && data.partyName.trim() !== '') {
            response = response.filter(item =>
                item.partyName?.toLowerCase().startsWith(data.partyName.toLowerCase())
            );
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "GST Purchase Without Inventory Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getGSTPurchaseEntryWithoutInventoryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let gpWithoutInventoryEntryModel = await gstPurchaseWithoutInventoryEntryModel(dbYear);
        const response = await gpWithoutInventoryEntryModel
            .findOne({ _id: reqId })
            .populate({
                path: "partyId",
                select: "partyName",
            });

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const deleteGSTPurchaseEntryWithoutInventoryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let gpWithoutInventoryEntryModel = await gstPurchaseWithoutInventoryEntryModel(dbYear);
        const response = await gpWithoutInventoryEntryModel.findByIdAndUpdate(reqId, { isDeleted: true });

        // Payment Receipt Entry
        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        await prEntryModel.findOneAndUpdate({ gstPurchaseEntryWithoutInventoryId: reqId }, { isDeleted: true }, { new: true });

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "GST Purchase Entry Without Iventory Deleted Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

// General Debit Note Entry
const getGeneralDebitNoteEntrySRNo = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let response = {}
        let gdnModel = await generalDebitNoteModel(dbYear);
        let gstNoRecord = await gdnModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select('noteNo');

        if (gstNoRecord && gstNoRecord.noteNo) {
            let lastNumber = parseInt(gstNoRecord.noteNo.replace('GD', ''), 10);
            let newNumber = lastNumber + 1;

            response.noteNo = `GD${newNumber.toString().padStart(4, '0')}`;
        } else {
            response.noteNo = 'GD0001';
        }

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });
    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const addEditGeneralDebitNoteEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {}

        if (data.generalDebitNoteId && data.generalDebitNoteId.trim() !== '') {

            let gdnModel = await generalDebitNoteModel(dbYear);
            const response = await gdnModel.findByIdAndUpdate(data.generalDebitNoteId, data, { new: true });
            if (!response) {
                responseData = 'Purchase details not found';
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Purchase Not found",
                        responseData: responseData,
                        isEnType: true,
                    },
                });
            }

            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            await prEntryModel.deleteMany({ generalDebitNoteEntryId: data.generalDebitNoteId });

            // Create New Transactions
            let prEntryModel1 = await paymentReceiptEntryModel(dbYear);
            const debitTransaction = new prEntryModel1({
                voucherNo: data.noteNo,
                date: data.date,
                partyId: data.partyId,
                chqNo: '-',
                debitAmount: data.grandTotal,
                creditAmount: 0,
                narration1: `${data.acNarration1} `,
                narration2: data.acNarration2,
                narration3: '',
                entryType: 'DebitNote',
                from: 'GeneralDebitNoteEntry',
                generalDebitNoteEntryId: response._id
            });

            let prEntryModel2 = await paymentReceiptEntryModel(dbYear);
            const creditTransaction = new prEntryModel2({
                voucherNo: data.noteNo,
                date: data.date,
                partyId: data.acId,
                chqNo: '-',
                creditAmount: data.grandTotal,
                debitAmount: 0,
                narration1: `${data.acNarration1} `,
                narration2: data.acNarration2,
                narration3: '',
                entryType: 'DebitNote',
                from: 'GeneralDebitNoteEntry',
                generalDebitNoteEntryId: response._id
            });

            await debitTransaction.save();
            await creditTransaction.save();

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "General Debit Note Updated Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        } else {
            let gdnModel = await generalDebitNoteModel(dbYear);
            const response = new gdnModel(data);
            await response.save();

            // Create New Transactions
            let prEntryModel1 = await paymentReceiptEntryModel(dbYear);
            const debitTransaction = new prEntryModel1({
                voucherNo: data.noteNo,
                date: data.date,
                partyId: data.partyId,
                chqNo: '-',
                debitAmount: data.grandTotal,
                creditAmount: 0,
                narration1: `${data.acNarration1} `,
                narration2: data.acNarration2,
                narration3: '',
                entryType: 'DebitNote',
                from: 'GeneralDebitNoteEntry',
                generalDebitNoteEntryId: response._id
            });

            let prEntryModel2 = await paymentReceiptEntryModel(dbYear);
            const creditTransaction = new prEntryModel2({
                voucherNo: data.noteNo,
                date: data.date,
                partyId: data.acId,
                chqNo: '-',
                creditAmount: data.grandTotal,
                debitAmount: 0,
                narration1: `${data.acNarration1} `,
                narration2: data.acNarration2,
                narration3: '',
                entryType: 'DebitNote',
                from: 'GeneralDebitNoteEntry',
                generalDebitNoteEntryId: response._id
            });

            await debitTransaction.save();
            await creditTransaction.save();

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {

                    statusCode: 200,
                    Message: "General Debit Note Inserted Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const getAllGeneralDebitNoteEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
        }

        let sortOption = { noteNo: -1 };
        if (data.arrangedBy && data.arrangedBy.trim() !== '' && data.arrangedBy !== 'Select') {
            sortOption = { [data.arrangedBy]: 1 };
        }

        let gdnModel = await generalDebitNoteModel(dbYear);
        let response = await gdnModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
                }
            },
            { $unwind: "$partyDetails" },
            {
                $project: {
                    noteNo: 1,
                    date: 1,
                    partyName: "$partyDetails.partyName",
                    grandTotal: 1,
                    _id: 1
                }
            },
            { $sort: sortOption }
        ]);

        if (data.partyName && data.partyName.trim() !== '') {
            response = response.filter(item =>
                item.partyName?.toLowerCase().startsWith(data.partyName.toLowerCase())
            );
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "General Debit Note Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getGeneralDebitNoteEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let gdnModel = await generalDebitNoteModel(dbYear);
        const response = await gdnModel
            .findOne({ _id: reqId })
            .populate({
                path: "partyId",
                select: "partyName",
            });

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const deleteGeneralDebitNoteEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let gdnModel = await generalDebitNoteModel(dbYear);
        const response = await gdnModel.findByIdAndUpdate(reqId, { isDeleted: true });

        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        await prEntryModel.deleteMany({ generalDebitNoteEntryId: reqId });

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "General Debit Note Deleted Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const generateDebitNoteEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let cgModel = await companyGroupModel(dbYear)
        let companyDetails = await cgModel.findOne({});
        let adminAddress = companyDetails.addressLine1 + ' '
            + companyDetails.addressLine2 + ' '
            + companyDetails.addressLine3 + ' '
            + companyDetails.pinCode + '(' + companyDetails.state + ')'

        let gdnModel = await generalDebitNoteModel(dbYear);
        let invoiceDetails = await gdnModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: 'partyId',
                select: 'partyName address1 address2 address3 address4 corrspAddress1 corrspAddress2 corrspAddress3 corrspAddress4 state pinCode gstnNo mobileNo1 mobileNo2 crdays person dlNo1 dlNo2 fssaiNo bankName city',
            });

        let recipientAddress = invoiceDetails.partyId.address1 + ' '
            + invoiceDetails.partyId.address2 + ' '
            + invoiceDetails.partyId.address3 + ' '
            + invoiceDetails.partyId.address4 + '-'
            + ((invoiceDetails.partyId.pinCode !== '' && invoiceDetails.partyId.pinCode) ? invoiceDetails.partyId.pinCode : '')

        let shippedToAddress =
            `${invoiceDetails.partyId.corrspAddress1 || invoiceDetails.partyId.address1 || ''} ` +
            `${invoiceDetails.partyId.corrspAddress2 || invoiceDetails.partyId.address2 || ''} ` +
            `${invoiceDetails.partyId.corrspAddress3 || invoiceDetails.partyId.address3 || ''} ` +
            `${invoiceDetails.partyId.corrspAddress4 || invoiceDetails.partyId.address4 || ''} -` +
            `${(invoiceDetails.partyId.pinCode !== '' && invoiceDetails.partyId.pinCode) ? invoiceDetails.partyId.pinCode : ''}`;


        let mobileNo = invoiceDetails.partyId.mobileNo1 + (invoiceDetails.partyId.mobileNo2 !== '' ? ',' + invoiceDetails.partyId.mobileNo2 : '')

        let htmlTemplate = fs.readFileSync(path.join(__dirname, "..", "..", "uploads", "InvoiceTemplates", "DebitCreditNote.html"), "utf8");

        // Injecting CSS for empty pages
        htmlTemplate = htmlTemplate + `
                                <style>
                                    @page {
                                        size: A4;
                                        margin: 0;
                                    }
                                    .empty-page {
                                        page-break-before: always;
                                        height: 100vh;
                                    }
                                </style>
                                `;

        const generatePage = (copyType) => {
            return htmlTemplate.replace("#CompanyName", invoiceDetails.partyId.partyName)
                .replace('#NoteType', 'DEBIT NOTE')
                .replace('#CopyType', copyType)
                .replace('#ConCompanyName', invoiceDetails.partyId.partyName)
                .replace('#ConRecipientState', invoiceDetails.partyId.state ? invoiceDetails.partyId.state : '')
                .replace('#ConMobielNo', mobileNo)
                .replace('#RecipientAddress', recipientAddress)
                .replace('#ShippedToAddress', shippedToAddress)
                .replace('#RecipientState', invoiceDetails.partyId.state)
                .replace('#RecpGSTNNo', invoiceDetails.partyId.gstnNo ? invoiceDetails.partyId.gstnNo : '-')
                .replace('#FSSAINo', invoiceDetails.partyId.fssaiNo ? invoiceDetails.partyId.fssaiNo : '-')
                .replace('#RecpDLNo', (invoiceDetails.partyId.dlNo1 !== '' ? invoiceDetails.partyId.dlNo1 : '') + (invoiceDetails.partyId.dlNo2 ? (', ' + invoiceDetails.partyId.dlNo2) : ''))
                .replace('#MobielNo', mobileNo)
                .replace('#Destination', invoiceDetails.partyId.city)
                .replace('#InvoiceNo', invoiceDetails.noteNo)
                .replace('#HSNSacCode', invoiceDetails.hsnSacCode)
                .replace('#InvoiceDate', dayjs(invoiceDetails.date).format("DD-MM-YYYY"))
                .replace('#Desc1', invoiceDetails.description1)
                .replace('#Desc2', invoiceDetails.description2)
                .replace('#Desc3', invoiceDetails.description3)
                .replace('#Desc4', invoiceDetails.description4)
                .replace('#Desc5', invoiceDetails.description5)
                .replace('#Amount1', invoiceDetails.amount1 ? invoiceDetails.amount1 : '')
                .replace('#Amount2', invoiceDetails.amount2 ? invoiceDetails.amount2 : '')
                .replace('#Amount3', invoiceDetails.amount3 ? invoiceDetails.amount3 : '')
                .replace('#Amount4', invoiceDetails.amount4 ? invoiceDetails.amount4 : '')
                .replace('#Amount5', invoiceDetails.amount5 ? invoiceDetails.amount5 : '')
                .replace('#SubTotalAmountForGST', invoiceDetails.subTotal ? invoiceDetails.subTotal : 0)
                .replace('#SubTotalAmountForSub', invoiceDetails.subTotal ? invoiceDetails.subTotal : 0)
                .replace('#SGSTAmount', invoiceDetails.sgstAmount ? invoiceDetails.sgstAmount : 0)
                .replace('#CGSTAmount', invoiceDetails.cgstAmount ? invoiceDetails.cgstAmount : 0)
                .replace('#IGSTAmount', invoiceDetails.igstAmount ? invoiceDetails.igstAmount : 0)
                .replace('#SGST', invoiceDetails.sgst ? invoiceDetails.sgst : 0)
                .replace('#CGST', invoiceDetails.cgst ? invoiceDetails.cgst : 0)
                .replace('#IGST', invoiceDetails.igst ? invoiceDetails.igst : 0)
                .replace('#CRDRNote', 0)
                .replace('#GSTAmountForTable', (invoiceDetails.sgstAmount ? invoiceDetails.sgstAmount : 0) + (invoiceDetails.cgstAmount ? invoiceDetails.cgstAmount : 0) + (invoiceDetails.igstAmount ? invoiceDetails.igstAmount : 0))
                .replace('#GSTAmountForSummary', (invoiceDetails.sgstAmount ? invoiceDetails.sgstAmount : 0) + (invoiceDetails.cgstAmount ? invoiceDetails.cgstAmount : 0) + (invoiceDetails.igstAmount ? invoiceDetails.igstAmount : 0))
                .replace('#RoundOffAmount', invoiceDetails.roundOff ? invoiceDetails.roundOff : 0)
                .replace('#GrandTotal', invoiceDetails.grandTotal ? invoiceDetails.grandTotal : 0)
                .replaceAll('#AdminCompanyName', companyDetails.CompanyName)
                .replace('#AdminAddress', adminAddress)
                .replace('#AdminEmail', companyDetails.email)
                .replace('#AdminMobile', companyDetails.mobile)
                .replace('#AdminMfgLicNo', companyDetails.mfgLicNo)
                .replace('#AdminFssaiNo', companyDetails.fssaiNo)
                .replace('#AdminMSMENo', companyDetails.msmeNo)
                .replace('#AdminGSTNNo', companyDetails.gstnNo)
                .replace('#AdminPanNo', companyDetails.panNo)
                .replace('#TermsConditionLine1', companyDetails.termsConditionLine1)
                .replace('#TermsConditionLine2', companyDetails.termsConditionLine2)
                .replace('#TermsConditionLine3', companyDetails.termsConditionLine3)
                .replace('#TermsConditionLine4', companyDetails.termsConditionLine4)
                .replace('#AdminBankName', companyDetails.bankName)
                .replace('#AdminIFSCCode', companyDetails.ifscCode)
                .replace('#ADMINACNo', companyDetails.acNo)
                .replace('#AdminBankBranch', companyDetails.branch)
        }


        htmlTemplate = `
                <div class="empty-page">${generatePage("Original for Recipient")}</div>
                <div class="page-break"></div>
            `;

        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        const page = await browser.newPage();

        await page.setContent(htmlTemplate, { waitUntil: "load" });

        const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

        await browser.close();

        res.setHeader("Content-Disposition", 'inline; filename="document.pdf"');
        res.setHeader("Content-Type", "application/pdf");

        res.end(pdfBuffer);
    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

// General Credit Note Entry
const getGeneralCreditNoteEntrySRNo = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let response = {}
        let gCreditNoteModel = await generalCreditNoteModel(dbYear);
        let gstNoRecord = await gCreditNoteModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select('noteNo');

        if (gstNoRecord && gstNoRecord.noteNo) {
            let lastNumber = parseInt(gstNoRecord.noteNo.replace('GC', ''), 10);
            let newNumber = lastNumber + 1;

            response.noteNo = `GC${newNumber.toString().padStart(4, '0')}`;
        } else {
            response.noteNo = 'GC0001';
        }

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });
    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const addEditGeneralCreditNoteEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {}

        if (data.generalCreditNoteId && data.generalCreditNoteId.trim() !== '') {

            let gCreditNoteModel = await generalCreditNoteModel(dbYear);
            const response = await gCreditNoteModel.findByIdAndUpdate(data.generalCreditNoteId, data, { new: true });
            if (!response) {
                responseData = 'Purchase details not found';
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Purchase Not found",
                        responseData: responseData,
                        isEnType: true,
                    },
                });
            }

            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            await prEntryModel.deleteMany({ generalCreditNoteEntryId: data.generalCreditNoteId });

            // Create New Transactions
            let prEntryModel1 = await paymentReceiptEntryModel(dbYear);
            const debitTransaction = new prEntryModel1({
                voucherNo: data.noteNo,
                date: data.date,
                partyId: data.partyId,
                chqNo: '-',
                debitAmount: 0,
                creditAmount: data.grandTotal,
                narration1: `${data.acNarration1} `,
                narration2: data.acNarration2,
                narration3: '',
                entryType: 'CreditNote',
                from: 'GeneralCreditNoteEntry',
                generalCreditNoteEntryId: response._id
            });

            let prEntryModel2 = await paymentReceiptEntryModel(dbYear);
            const creditTransaction = new prEntryModel2({
                voucherNo: data.noteNo,
                date: data.date,
                partyId: data.acId,
                chqNo: '-',
                creditAmount: 0,
                debitAmount: data.grandTotal,
                narration1: `${data.acNarration1} `,
                narration2: data.acNarration2,
                narration3: '',
                entryType: 'CreditNote',
                from: 'GeneralCreditNoteEntry',
                generalCreditNoteEntryId: response._id
            });

            await debitTransaction.save();
            await creditTransaction.save();

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "General Credit Note Updated Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        } else {
            let gCreditNoteModel = await generalCreditNoteModel(dbYear);
            const response = new gCreditNoteModel(data);
            await response.save();

            // Create New Transactions
            let prEntryModel1 = await paymentReceiptEntryModel(dbYear);
            const debitTransaction = new prEntryModel1({
                voucherNo: data.noteNo,
                date: data.date,
                partyId: data.partyId,
                chqNo: '-',
                debitAmount: 0,
                creditAmount: data.grandTotal,
                narration1: `${data.acNarration1} `,
                narration2: data.acNarration2,
                narration3: '',
                entryType: 'CreditNote',
                from: 'GeneralCreditNoteEntry',
                generalCreditNoteEntryId: response._id
            });

            let prEntryModel2 = await paymentReceiptEntryModel(dbYear);
            const creditTransaction = new prEntryModel2({
                voucherNo: data.noteNo,
                date: data.date,
                partyId: data.acId,
                chqNo: '-',
                creditAmount: 0,
                debitAmount: data.grandTotal,
                narration1: `${data.acNarration1} `,
                narration2: data.acNarration2,
                narration3: '',
                entryType: 'CreditNote',
                from: 'GeneralCreditNoteEntry',
                generalCreditNoteEntryId: response._id
            });

            await debitTransaction.save();
            await creditTransaction.save();

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {

                    statusCode: 200,
                    Message: "General Credit Note Inserted Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const getAllGeneralCreditNoteEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
        }

        let sortOption = { noteNo: -1 };
        if (data.arrangedBy && data.arrangedBy.trim() !== '' && data.arrangedBy !== 'Select') {
            sortOption = { [data.arrangedBy]: 1 };
        }

        let gCreditNoteModel = await generalCreditNoteModel(dbYear);
        let response = await gCreditNoteModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "partyId",
                    foreignField: "_id",
                    as: "partyDetails"
                }
            },
            { $unwind: "$partyDetails" },
            {
                $project: {
                    noteNo: 1,
                    date: 1,
                    partyName: "$partyDetails.partyName",
                    grandTotal: 1,
                    _id: 1
                }
            },
            { $sort: sortOption }
        ]);

        if (data.partyName && data.partyName.trim() !== '') {
            response = response.filter(item =>
                item.partyName?.toLowerCase().startsWith(data.partyName.toLowerCase())
            );
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "General Credit Note Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getGeneralCreditNoteEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let gCreditNoteModel = await generalCreditNoteModel(dbYear);
        const response = await gCreditNoteModel
            .findOne({ _id: reqId })
            .populate({
                path: "partyId",
                select: "partyName",
            });

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const deleteGeneralCreditNoteEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let gCreditNoteModel = await generalCreditNoteModel(dbYear);
        const response = await gCreditNoteModel.findByIdAndUpdate(reqId, { isDeleted: true });

        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        await prEntryModel.deleteMany({ generalCreditNoteEntryId: reqId });

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "General Credit Note Deleted Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const generateCreditNoteEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let cgModel = await companyGroupModel(dbYear)
        let companyDetails = await cgModel.findOne({});
        let adminAddress = companyDetails.addressLine1 + ' '
            + companyDetails.addressLine2 + ' '
            + companyDetails.addressLine3 + ' '
            + companyDetails.pinCode + '(' + companyDetails.state + ')'

        let gdnModel = await generalCreditNoteModel(dbYear);
        let invoiceDetails = await gdnModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: 'partyId',
                select: 'partyName address1 address2 address3 address4 corrspAddress1 corrspAddress2 corrspAddress3 corrspAddress4 state pinCode gstnNo mobileNo1 mobileNo2 crdays person dlNo1 dlNo2 fssaiNo bankName city',
            });

        let recipientAddress = invoiceDetails.partyId.address1 + ' '
            + invoiceDetails.partyId.address2 + ' '
            + invoiceDetails.partyId.address3 + ' '
            + invoiceDetails.partyId.address4 + '-'
            + ((invoiceDetails.partyId.pinCode !== '' && invoiceDetails.partyId.pinCode) ? invoiceDetails.partyId.pinCode : '')

        let shippedToAddress =
            `${invoiceDetails.partyId.corrspAddress1 || invoiceDetails.partyId.address1 || ''} ` +
            `${invoiceDetails.partyId.corrspAddress2 || invoiceDetails.partyId.address2 || ''} ` +
            `${invoiceDetails.partyId.corrspAddress3 || invoiceDetails.partyId.address3 || ''} ` +
            `${invoiceDetails.partyId.corrspAddress4 || invoiceDetails.partyId.address4 || ''} -` +
            `${(invoiceDetails.partyId.pinCode !== '' && invoiceDetails.partyId.pinCode) ? invoiceDetails.partyId.pinCode : ''}`;


        let mobileNo = invoiceDetails.partyId.mobileNo1 + (invoiceDetails.partyId.mobileNo2 !== '' ? ',' + invoiceDetails.partyId.mobileNo2 : '')

        let htmlTemplate = fs.readFileSync(path.join(__dirname, "..", "..", "uploads", "InvoiceTemplates", "DebitCreditNote.html"), "utf8");

        // Injecting CSS for empty pages
        htmlTemplate = htmlTemplate + `
                                <style>
                                    @page {
                                        size: A4;
                                        margin: 0;
                                    }
                                    .empty-page {
                                        page-break-before: always;
                                        height: 100vh;
                                    }
                                </style>
                                `;

        const generatePage = (copyType) => {
            return htmlTemplate.replace("#CompanyName", invoiceDetails.partyId.partyName)
                .replace('#CopyType', copyType)
                .replace('#NoteType', 'CREDIT NOTE')
                .replace('#ConCompanyName', invoiceDetails.partyId.partyName)
                .replace('#ConRecipientState', invoiceDetails.partyId.state ? invoiceDetails.partyId.state : '')
                .replace('#ConMobielNo', mobileNo)
                .replace('#RecipientAddress', recipientAddress)
                .replace('#ShippedToAddress', shippedToAddress)
                .replace('#RecipientState', invoiceDetails.partyId.state)
                .replace('#RecpGSTNNo', invoiceDetails.partyId.gstnNo ? invoiceDetails.partyId.gstnNo : '-')
                .replace('#FSSAINo', invoiceDetails.partyId.fssaiNo ? invoiceDetails.partyId.fssaiNo : '-')
                .replace('#RecpDLNo', (invoiceDetails.partyId.dlNo1 !== '' ? invoiceDetails.partyId.dlNo1 : '') + (invoiceDetails.partyId.dlNo2 ? (', ' + invoiceDetails.partyId.dlNo2) : ''))
                .replace('#MobielNo', mobileNo)
                .replace('#Destination', invoiceDetails.partyId.city)
                .replace('#InvoiceNo', invoiceDetails.noteNo)
                .replace('#HSNSacCode', invoiceDetails.hsnSacCode)
                .replace('#InvoiceDate', dayjs(invoiceDetails.date).format("DD-MM-YYYY"))
                .replace('#Desc1', invoiceDetails.description1)
                .replace('#Desc2', invoiceDetails.description2)
                .replace('#Desc3', invoiceDetails.description3)
                .replace('#Desc4', invoiceDetails.description4)
                .replace('#Desc5', invoiceDetails.description5)
                .replace('#Amount1', invoiceDetails.amount1 ? invoiceDetails.amount1 : '')
                .replace('#Amount2', invoiceDetails.amount2 ? invoiceDetails.amount2 : '')
                .replace('#Amount3', invoiceDetails.amount3 ? invoiceDetails.amount3 : '')
                .replace('#Amount4', invoiceDetails.amount4 ? invoiceDetails.amount4 : '')
                .replace('#Amount5', invoiceDetails.amount5 ? invoiceDetails.amount5 : '')
                .replace('#SubTotalAmountForGST', invoiceDetails.subTotal ? invoiceDetails.subTotal : 0)
                .replace('#SubTotalAmountForSub', invoiceDetails.subTotal ? invoiceDetails.subTotal : 0)
                .replace('#SGSTAmount', invoiceDetails.sgstAmount ? invoiceDetails.sgstAmount : 0)
                .replace('#CGSTAmount', invoiceDetails.cgstAmount ? invoiceDetails.cgstAmount : 0)
                .replace('#IGSTAmount', invoiceDetails.igstAmount ? invoiceDetails.igstAmount : 0)
                .replace('#SGST', invoiceDetails.sgst ? invoiceDetails.sgst : 0)
                .replace('#CGST', invoiceDetails.cgst ? invoiceDetails.cgst : 0)
                .replace('#IGST', invoiceDetails.igst ? invoiceDetails.igst : 0)
                .replace('#CRDRNote', 0)
                .replace('#GSTAmountForTable', (invoiceDetails.sgstAmount ? invoiceDetails.sgstAmount : 0) + (invoiceDetails.cgstAmount ? invoiceDetails.cgstAmount : 0) + (invoiceDetails.igstAmount ? invoiceDetails.igstAmount : 0))
                .replace('#GSTAmountForSummary', (invoiceDetails.sgstAmount ? invoiceDetails.sgstAmount : 0) + (invoiceDetails.cgstAmount ? invoiceDetails.cgstAmount : 0) + (invoiceDetails.igstAmount ? invoiceDetails.igstAmount : 0))
                .replace('#RoundOffAmount', invoiceDetails.roundOff ? invoiceDetails.roundOff : 0)
                .replace('#GrandTotal', invoiceDetails.grandTotal ? invoiceDetails.grandTotal : 0)
                .replaceAll('#AdminCompanyName', companyDetails.CompanyName)
                .replace('#AdminAddress', adminAddress)
                .replace('#AdminEmail', companyDetails.email)
                .replace('#AdminMobile', companyDetails.mobile)
                .replace('#AdminMfgLicNo', companyDetails.mfgLicNo)
                .replace('#AdminFssaiNo', companyDetails.fssaiNo)
                .replace('#AdminMSMENo', companyDetails.msmeNo)
                .replace('#AdminGSTNNo', companyDetails.gstnNo)
                .replace('#AdminPanNo', companyDetails.panNo)
                .replace('#TermsConditionLine1', companyDetails.termsConditionLine1)
                .replace('#TermsConditionLine2', companyDetails.termsConditionLine2)
                .replace('#TermsConditionLine3', companyDetails.termsConditionLine3)
                .replace('#TermsConditionLine4', companyDetails.termsConditionLine4)
                .replace('#AdminBankName', companyDetails.bankName)
                .replace('#AdminIFSCCode', companyDetails.ifscCode)
                .replace('#ADMINACNo', companyDetails.acNo)
                .replace('#AdminBankBranch', companyDetails.branch)
        }


        htmlTemplate = `
                <div class="empty-page">${generatePage("Original for Recipient")}</div>
                <div class="page-break"></div>
            `;

        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        const page = await browser.newPage();

        await page.setContent(htmlTemplate, { waitUntil: "load" });

        const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

        await browser.close();

        res.setHeader("Content-Disposition", 'inline; filename="document.pdf"');
        res.setHeader("Content-Type", "application/pdf");

        res.end(pdfBuffer);
    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};


// J.V. Entry
const getJVEntryVoucherNo = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let response = {}
        let jvEModel = await jvEntryModel(dbYear);
        let gstNoRecord = await jvEModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select('srNo');

        if (gstNoRecord && gstNoRecord.srNo) {
            let lastNumber = parseInt(gstNoRecord.srNo.replace('JV', ''), 10);
            let newNumber = lastNumber + 1;

            response.srNo = `JV${newNumber.toString().padStart(4, '0')}`;
        } else {
            response.srNo = 'JV0001';
        }

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });
    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const addEditJVEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {}
        if (data.jvDetails.jvEntryId && data.jvDetails.jvEntryId.trim() !== '') {
            // Edit For Receipt Details
            let jvEModel = await jvEntryModel(dbYear);
            const response = await jvEModel.findByIdAndUpdate(data.jvDetails.jvEntryId, data.jvDetails, { new: true });
            if (!response) {
                responseData.jvDetails = 'Party details not found';
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "JV Details Not found",
                        responseData: encryptData,
                        isEnType: true,
                    },
                });
            }
            responseData.jvDetails = response;

            // Edit Items In Receipt Entry Model
            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            await prEntryModel.deleteMany({ jvEntryId: response._id });
            const items = data.jvEntryItemList.map(item => ({
                ...item,
                jvEntryId: response._id
            }));

            let prEntryModel1 = await paymentReceiptEntryModel(dbYear);
            await prEntryModel1.insertMany(items);

            let encryptData = encryptionAPI(responseData, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "JV Entry Updated Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });


        } else {
            // Add JV Entry
            let jvEModel = await jvEntryModel(dbYear);
            const response = new jvEModel(data.jvDetails);
            await response.save();

            const items = data.jvEntryItemList.map(item => ({
                ...item,
                jvEntryId: response._id
            }));

            // Add Items In Receipt Entry Model
            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            await prEntryModel.insertMany(items);

            responseData.jvDetails = response;
            let encryptData = encryptionAPI(responseData, 1);
            res.status(200).json({
                data: {

                    statusCode: 200,
                    Message: "JV Entry Inserted Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const getAllJVEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
        }

        let arrangedBy = { createdAt: -1 };

        if (data.arrangedBy && data.arrangedBy.trim() !== '' && data.arrangedBy !== 'Select') {
            arrangedBy = { [data.arrangedBy]: 1 };
        }

        let jvEModel = await jvEntryModel(dbYear);
        let response = await jvEModel
            .find(queryObject)
            .sort(arrangedBy)

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "JV Entry Details Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getJVEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}

        if (reqId) {
            let jvEModel = await jvEntryModel(dbYear);
            let jvDetails = await jvEModel.findOne({ isDeleted: false, _id: reqId })
            response.jvDetails = jvDetails

            let prEntryModel = await paymentReceiptEntryModel(dbYear);
            let jvEntryItemList = await prEntryModel
                .find({ isDeleted: false, jvEntryId: reqId, entryType: 'JVEntry' })
                .populate({
                    path: 'partyId',
                    select: 'partyName'
                })
            response.jvEntryItemList = jvEntryItemList
        }
        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "JV Entry details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

const deleteJVEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        await prEntryModel.updateMany({ jvEntryId: reqId }, { isDeleted: true });

        let jvEModel = await jvEntryModel(dbYear);
        const response = await jvEModel.findByIdAndUpdate(reqId, { isDeleted: true });

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "JV Entry Deleted Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account controller", error);
        errorHandler(error, req, res, "Error in Account controller")
    }
};

// Reports
const getAllAccountLedger = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
            partyId: data.partyId
        }

        let arrangedBy = 'date'

        if (data.arrangedBy && data.arrangedBy.trim() !== '') {
            arrangedBy = data.arrangedBy
        }

        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        let response = await prEntryModel
            .find(queryObject)
            .sort(arrangedBy)
            .populate({
                path: 'bankId',
                select: 'shortName'
            })

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Account Ledger Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getAllPendingInvoicePaymentReport = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
            pendingAmount: { $gt: 0 }
        }

        if (data.partyId && data.partyId.trim() !== '') {
            queryObject.partyId = data.partyId
        }

        let response = []
        if (data.searchFor === 'pendingPayment') {
            let gifgModel = await gstInvoiceFinishGoodsModel(dbYear);
            const finishGoodsData = await gifgModel
                .find(queryObject)
                .select('invoiceNo partyId invoiceDate pendingAmount grandTotal')
                .populate({
                    path: 'partyId',
                    select: 'partyName maintainAc'
                })
                .lean();

            let girModel = await gstInvoiceRMModel(dbYear);
            const rmData = await girModel
                .find(queryObject)
                .select('invoiceNo partyId invoiceDate pendingAmount grandTotal')
                .populate({
                    path: 'partyId',
                    select: 'partyName maintainAc'
                })
                .lean();

            let gipModel = await gstInvoicePMModel(dbYear);
            const pmData = await gipModel
                .find(queryObject)
                .select('invoiceNo partyId invoiceDate pendingAmount grandTotal')
                .populate({
                    path: 'partyId',
                    select: 'partyName maintainAc'
                })
                .lean();

            response = [
                ...finishGoodsData.map(item => ({
                    ...item,
                    gstInvoiceFinishGoodsId: item._id,
                    _id: undefined
                })),
                ...rmData.map(item => ({
                    ...item,
                    gstRMInvoiceId: item._id,
                    _id: undefined
                })),
                ...pmData.map(item => ({
                    ...item,
                    gstPMInvoiceId: item._id,
                    _id: undefined
                }))
            ];
        } else {
            let gpeRMPMModel = await gstPurchaseEntryRMPMModel(dbYear);
            const gstPurchaseEntryData = await gpeRMPMModel
                .find(queryObject)
                .select('invoiceNo partyId invoiceDate pendingAmount grandTotal')
                .populate({
                    path: 'partyId',
                    select: 'partyName maintainAc'
                })
                .lean();

            let gpWithoutInventoryEntryModel = await gstPurchaseWithoutInventoryEntryModel(dbYear);
            const gstPurchaseWithoutInventoryData = await gpWithoutInventoryEntryModel
                .find(queryObject)
                .select('invoiceNo partyId invoiceDate pendingAmount grandTotal')
                .populate({
                    path: 'partyId',
                    select: 'partyName maintainAc'
                })
                .lean();

            response = [
                ...gstPurchaseEntryData.map(item => ({
                    ...item,
                    gstPurchaseEntryRMPMId: item._id,
                    _id: undefined
                })),
                ...gstPurchaseWithoutInventoryData.map(item => ({
                    ...item,
                    gstPurchaseEntryWithoutInventoryId: item._id,
                    _id: undefined
                })),

            ];
        }

        const filteredData = response.filter(item => item.partyId && item.partyId.maintainAc === 'B');
        let encryptData = encryptionAPI(filteredData, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Account Ledger Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getRunningBalanceByPartyId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)
        let queryObject = {
            isDeleted: false,
            partyId: reqId
        }

        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        let response = await prEntryModel.find(queryObject).select('debitAmount creditAmount')

        let pModel = await partyModel(dbYear)
        let partyDetails = await pModel.findOne({ _id: reqId }).select('openBalance openBalanceDRCR');
        let openingBalance = partyDetails ? Number(partyDetails.openBalance) : 0;
        let openingBalanceDRCR = partyDetails ? partyDetails.openBalanceDRCR : 'Dr';

        // Adjust the sign of opening balance based on Dr/Cr
        console.log(partyDetails)
        let runningBalance = (openingBalanceDRCR === 'Dr' || openingBalanceDRCR === 'DR') ? openingBalance : -openingBalance;

        let processedTransactions = response.map((transaction) => {
            const credit = transaction.creditAmount || 0;
            const debit = transaction.debitAmount || 0;

            runningBalance -= credit;
            runningBalance += debit;

            return {
                ...transaction.toObject(),
                creditAmount: credit,
                debitAmount: debit,
                runningBalance: runningBalance,
                runningBalanceDRCR: runningBalance >= 0 ? 'Dr' : 'Cr'
            };
        });
        console.log(processedTransactions)
        let totalCreditAmount = processedTransactions.reduce((sum, item) => sum + Number(item.creditAmount), 0);
        let totalDebitAmount = processedTransactions.reduce((sum, item) => sum + Number(item.debitAmount), 0);

        let signedOpeningBalance = (openingBalanceDRCR === 'Dr' || openingBalanceDRCR === 'DR')
            ? openingBalance
            : -openingBalance;

        let finalBalance = (signedOpeningBalance + totalDebitAmount) - totalCreditAmount;
        let closingBalance = Math.abs(finalBalance);
        let closingBalanceDRCR = finalBalance >= 0 ? 'Dr' : 'Cr';

        let finalResponse = {
            closingBalanceDRCR: closingBalanceDRCR,
            closingBalance: closingBalance
        }

        let encryptData = encryptionAPI(finalResponse, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Running Balance Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getBankBalanceByBankId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        let queryObject = {
            isDeleted: false,
            _id: reqId
        }

        let dbMasterModel = await daybookMasterModel(dbYear)
        let response = await dbMasterModel.findOne(queryObject)

        const getFinancialYear = () => {
            const currentDate = dayjs();
            const currentYear = currentDate.year();
            const currentMonth = currentDate.month() + 1;

            return currentMonth >= 4 ? currentYear : currentYear - 1;
        };

        let financialYear = getFinancialYear()

        const startDateOfYear = dayjs(`${financialYear}-04-01`).startOf("day").toDate();
        const endDateOfYear = dayjs(`${financialYear + 1}-03-31`).endOf("day").toDate();



        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        let totalCreditDebitAmount = await prEntryModel.find({ isDeleted: false, bankId: reqId, date: { $gte: startDateOfYear, $lte: endDateOfYear } }).select('creditAmount debitAmount');

        // Summing up the credit and debit amounts
        let totalCreditAmount = totalCreditDebitAmount.reduce((sum, record) => sum + (record.creditAmount || 0), 0);
        let totalDebitAmount = totalCreditDebitAmount.reduce((sum, record) => sum + (record.debitAmount || 0), 0);
        let closingBalance = (response.openBalance + totalCreditAmount) - totalDebitAmount;

        let finalclosingBalance = {
            closingBalance: closingBalance
        }

        let encryptData = encryptionAPI(finalclosingBalance, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Bank Balance Feteched Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getAllBankWiseCashBankBookReport = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        // let apiData = req.body.data
        // let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
            bookType: { $in: ['Bank Book', 'Cash Book'] },
            // daybookName: 'GUJARAT AMBUJA CO-OP BANK'
        }

        let dbMasterModel = await daybookMasterModel(dbYear)
        let response = await dbMasterModel
            .find(queryObject)

        const getFinancialYear = () => {
            const currentDate = dayjs();
            const currentYear = currentDate.year();
            const currentMonth = currentDate.month() + 1;

            return currentMonth >= 4 ? currentYear : currentYear - 1;
        };

        let financialYear = getFinancialYear()

        const startDateOfYear = dayjs(`${financialYear}-04-01`).startOf("day").toDate();
        const endDateOfYear = dayjs(`${financialYear + 1}-03-31`).endOf("day").toDate();


        let finalResponse = await Promise.all(response.map(async (x) => {

            let prEntryModel = await paymentReceiptEntryModel(dbYear);

            let totalCreditDebitAmount = await prEntryModel.find({ isDeleted: false, bankId: x._id, date: { $gte: startDateOfYear, $lte: endDateOfYear } }).select('creditAmount debitAmount date');

            // Summing up the credit and debit amounts
            let totalCreditAmount = totalCreditDebitAmount.reduce((sum, record) => sum + (record.creditAmount || 0), 0);
            let totalDebitAmount = totalCreditDebitAmount.reduce((sum, record) => sum + (record.debitAmount || 0), 0);
            let closingBalance = (x.openBalance + totalCreditAmount) - totalDebitAmount;
            return {
                bankId: x._id,
                bankName: x.daybookName,
                openingBalance: x.openBalance,
                totalCreditAmount,
                totalDebitAmount,
                closingBalance,
                shortName: x.shortName,
            };
        }));

        let encryptData = encryptionAPI(finalResponse, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Bank Wise Report Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getAllMonthWiseCashBankBookReportbyBankId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let reqId = getRequestData(id)

        const months = [
            "April", "May", "June", "July", "August", "September",
            "October", "November", "December", "January", "February", "March"
        ];

        const getFinancialYear = () => {
            const currentDate = dayjs();
            const currentYear = currentDate.year();
            const currentMonth = currentDate.month() + 1;

            return currentMonth >= 4 ? currentYear : currentYear - 1;
        };

        let bankId = reqId
        let financialYear = getFinancialYear()

        const startDateOfYear = dayjs(`${financialYear}-04-01`).startOf("day").toDate();
        const endDateOfYear = dayjs(`${financialYear + 1}-03-31`).endOf("day").toDate();

        let dbMasterModel = await daybookMasterModel(dbYear)
        const bankDetails = await dbMasterModel.findOne({ _id: bankId }).select("openBalance openBalanceDRCR");
        if (!bankDetails) throw new Error("Bank not found");

        let runningBalance = Number(bankDetails.openBalance) || 0;
        if (bankDetails.openBalanceDRCR === "Cr") runningBalance = -runningBalance;

        const queryObject = {
            isDeleted: false,
            bankId,
            date: { $gte: startDateOfYear, $lte: endDateOfYear }
        };

        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        const transactions = await prEntryModel
            .find(queryObject)
            .select("date debitAmount creditAmount");

        let monthlyData = months.map((month, index) => {
            let monthIndex = (index + 3) % 12; // Convert from financial to calendar year index
            let year = monthIndex >= 3 ? financialYear : financialYear + 1;

            let startDate = dayjs(`${year}-${monthIndex + 1}-01`).startOf("month").toDate();
            let endDate = dayjs(`${year}-${monthIndex + 1}-01`).endOf("month").toDate();

            return {
                month,
                openingBalance: 0,
                openingBalanceDRCR: "Dr",
                receipt: 0,
                payment: 0,
                closingBalance: 0,
                closingBalanceDRCR: "Dr",
                bankId: reqId,
                startDate,
                endDate
            };
        });

        transactions.forEach((transaction) => {
            let monthIndex = dayjs(transaction.date).month();
            monthIndex = (monthIndex + 9) % 12;

            const debit = Number(transaction.debitAmount) || 0;
            const credit = Number(transaction.creditAmount) || 0;

            monthlyData[monthIndex].receipt += credit;
            monthlyData[monthIndex].payment += debit;
            monthlyData[monthIndex].monthIndex = monthIndex
        });

        monthlyData.forEach((monthData, index) => {
            if (index === 0) {
                monthData.openingBalance = Math.abs(runningBalance);
                monthData.openingBalanceDRCR = runningBalance >= 0 ? "Dr" : "Cr";
            } else {
                monthData.openingBalance = Math.abs(monthlyData[index - 1].closingBalance);
                monthData.openingBalanceDRCR = monthlyData[index - 1].closingBalanceDRCR;
            }

            runningBalance += monthData.receipt;
            runningBalance -= monthData.payment;

            monthData.closingBalance = Math.abs(runningBalance);
            monthData.closingBalanceDRCR = runningBalance >= 0 ? "Dr" : "Cr";
        });

        let encryptData = encryptionAPI(monthlyData, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Running Balance Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getAllDateWiseCashBankBookReportbyBankId = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let bankId = data.bankId

        let prEntryModel = await paymentReceiptEntryModel(dbYear);
        const transactions = await prEntryModel.find({
            isDeleted: false,
            bankId,
            date: { $gte: data.startDate, $lte: data.endDate }
        }).select("date debitAmount creditAmount partyId voucherNo chqNo")
            .populate({
                path: 'partyId',
                select: 'partyName'
            })
            .sort({ date: 1 });

        let encryptData = encryptionAPI(transactions, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Date Wise Report Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getAllGroupWiseAccountSummary = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
            // partyName : 'ZYDEN IT SOLUTION'
        }

        if (data.group && data.group.trim() !== '') {
            queryObject.acGroupCode = data.group
        }

        let pModel = await partyModel(dbYear)
        let partyList = await pModel.find(queryObject).select("partyName openBalance openBalanceDRCR acGroupCode").sort("partyName");

        partyList = await Promise.all(
            partyList.map(async (x) => {

                let queryObjectForParty = {
                    isDeleted: false,
                    partyId: x._id,
                }

                if (data.startDate && data.endDate) {
                    queryObjectForParty.date = { $gte: data.startDate, $lte: data.endDate }
                }

                let prEntryModel = await paymentReceiptEntryModel(dbYear);
                let partyTransaction = await prEntryModel.find(queryObjectForParty);

                let acModel = await accountGroupModel(dbYear)
                let accountGroupDetails = await acModel.findOne({ isDeleted: false, accountGroupCode: x.acGroupCode })

                let creditAmount = partyTransaction.reduce((sum, entry) => sum + entry.creditAmount, 0);
                let debitAmount = partyTransaction.reduce((sum, entry) => sum + entry.debitAmount, 0);

                let openingBalance = x.openBalance;
                let openingBalanceDRCR = x.openBalanceDRCR ? x.openBalanceDRCR : 'Dr';

                if (openingBalanceDRCR === "Dr" || openingBalanceDRCR === 'DR') {
                    openingBalance = -openingBalance;
                }

                let closingBalance = openingBalance + creditAmount - debitAmount;
                let closingBalanceDRCR = closingBalance >= 0 ? "Cr" : "Dr";

                return {
                    ...x.toObject(),
                    openingBalance: Math.abs(openingBalance),
                    openingBalanceDRCR,
                    creditAmount,
                    creditAmountDRCR: "Cr",
                    debitAmount,
                    debitAmountDRCR: "Dr",
                    closingBalance: Math.abs(closingBalance),
                    closingBalanceDRCR,
                    accountGroupname: accountGroupDetails?.accountGroupname ? accountGroupDetails.accountGroupname : ''
                };
            })
        );

        let encryptData = encryptionAPI(partyList, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Group Wise Report Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getAllOpeningBalanceReport = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
            openBalance: { $gt: 0 },
            // partyName : 'ZYDEN IT SOLUTION'
        }

        let sort = 'partyName'

        if (data.orderBy && data.orderBy.trim() !== '') {
            sort = data.orderBy
        }

        if (data.partyName && data.partyName.trim() !== "") {
            queryObject.partyName = { $regex: `^${data.partyName}`, $options: "i" };
        }

        let pModel = await partyModel(dbYear)
        let partyList = await pModel
            .find(queryObject)
            .select("partyName openBalance openBalanceDRCR acGroupCode")
            .sort(sort);

        partyList = await Promise.all(partyList.map(async (party) => {
            let acModel = await accountGroupModel(dbYear)
            let accountGroupDetails = await acModel.findOne({ isDeleted: false, accountGroupCode: party.acGroupCode });
            return {
                ...party.toObject(),
                accountGroupName: accountGroupDetails ? accountGroupDetails.accountGroupname : null
            };
        }));
        let encryptData = encryptionAPI(partyList, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Opening Balance Report Fetch Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getAllGSTSalesRegister = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let endDate = new Date(data.endDate);
        endDate.setHours(23, 59, 59, 999);

        let queryObject = {
            isDeleted: false,
            invoiceDate: { $gte: data.startDate, $lte: endDate },
            subTotal: { $gt: 0 }
        }

        if (data.partyId && data.partyId.trim() !== '') {
            queryObject.partyId = data.partyId
        }

        if (data.invoiceType === 'sgst') {
            queryObject.sgst = { $gt: 0 };
        } else if (data.invoiceType === 'cgst') {
            queryObject.cgst = { $gt: 0 };
        } else if (data.invoiceType === 'igst') {
            queryObject.igst = { $gt: 0 };
        }

        let gifgModel = await gstInvoiceFinishGoodsModel(dbYear);
        const finishGoodsData = await gifgModel.find(queryObject)
            .populate({
                path: 'partyId',
                select: 'partyName',
            })

        let gipModel = await gstInvoicePMModel(dbYear);
        const pmData = await gipModel.find(queryObject)
            .populate({
                path: 'partyId',
                select: 'partyName',
            })

        let girModel = await gstInvoiceRMModel(dbYear);
        const rmData = await girModel.find(queryObject)
            .populate({
                path: 'partyId',
                select: 'partyName',
            })

        let response = [...finishGoodsData, ...pmData, ...rmData]
        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "GST Sales Register Fetched Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

const getAllGSTPurchaseRegister = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let endDate = new Date(data.endDate);
        endDate.setHours(23, 59, 59, 999);

        let queryObject = {
            isDeleted: false,
            invoiceDate: { $gte: data.startDate, $lte: endDate },
            subTotal: { $gt: 0 }
        }

        let queryObjectForWithOutInventory = {
            isDeleted: false,
            invoiceDate: { $gte: data.startDate, $lte: endDate },
            amount: { $gt: 0 }
        }

        if (data.partyId && data.partyId.trim() !== '') {
            queryObject.partyId = data.partyId
        }

        if (data.partyId && data.partyId.trim() !== '') {
            queryObjectForWithOutInventory.partyId = data.partyId
        }

        if (data.invoiceType === 'sgst') {
            queryObject.sgst = { $gt: 0 };
        } else if (data.invoiceType === 'cgst') {
            queryObject.cgst = { $gt: 0 };
        } else if (data.invoiceType === 'igst') {
            queryObject.igst = { $gt: 0 };
        }

        if (data.invoiceType === 'sgst') {
            queryObjectForWithOutInventory.sgst = { $gt: 0 };
        } else if (data.invoiceType === 'cgst') {
            queryObjectForWithOutInventory.cgst = { $gt: 0 };
        } else if (data.invoiceType === 'igst') {
            queryObjectForWithOutInventory.igst = { $gt: 0 };
        }

        let gpeModel = await gstPurchaseEntryRMPMModel(dbYear);
        const gstPurchaseEntryList = await gpeModel.find(queryObject)
            .populate({
                path: 'partyId',
                select: 'partyName',
            })

        let gpilRMPMModel = await gstPurchaseWithoutInventoryEntryModel(dbYear);
        const gstPurchaseEntryWOInventoryList = await gpilRMPMModel.find(queryObjectForWithOutInventory)
            .populate({
                path: 'partyId',
                select: 'partyName',
            })

        const modifiedListForWithoutInvenotory = gstPurchaseEntryWOInventoryList.map(entry => {
            const obj = entry.toObject();
            obj.sgst = obj.sgstAmount;
            obj.cgst = obj.cgstAmount;
            obj.igst = obj.igstAmount;
            obj.ugst = obj.ugstAmount;
            obj.subTotal = obj.taxableAmount;
            delete obj.sgstAmount;
            delete obj.cgstAmount;
            delete obj.igstAmount;
            delete obj.ugstAmount;
            return obj;
        });

        let response = [...gstPurchaseEntryList, ...modifiedListForWithoutInvenotory]
        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "GST Sales Register Fetched Successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Account Controller", error);
        errorHandler(error, req, res, "Error in Account Controller")
    }
};

export {
    getReceiptEntryVoucherNo,
    getAllPendingInvoiceByPartyId,
    addEditReceiptEntry,
    getAllReceiptEntry,
    getReceiptDetailsByReceiptId,
    deleteReceiptDetailsByReceiptId,
    getPaymentEntryVoucherNo,
    getAllPendingInvoiceForPaymentEntryByPartyId,
    addEditPaymentEntry,
    getAllPaymnetEntry,
    getPaymentDetailsByPaymnetReceiptId,
    deletePaymentDetailsByPaymentReceiptId,
    getContraEntryVoucherNo,
    addEditContraEntry,
    getAllContraEntry,
    getContraEntryById,
    deleteContraEntryById,
    getGSTPurchseEntrySRNo,
    getAllPendingGRNPurchaseEntry,
    updateGRNEntryToPurchaseEntry,
    addEditGSTPurchaseEntryRMPM,
    getAllGSTPurchaseEntryRMPM,
    getGSTPurchaseEntryRMPMById,
    deleteGSTPurchaseEntryRMPMById,
    getGSTPurchseWithoutInventoryEntrySRNo,
    addEditGSTPurchaseEntryWithoutInventory,
    getAllPurchaseEntryWithoutInventory,
    getGSTPurchaseEntryWithoutInventoryById,
    deleteGSTPurchaseEntryWithoutInventoryById,
    getGeneralDebitNoteEntrySRNo,
    addEditGeneralDebitNoteEntry,
    getAllGeneralDebitNoteEntry,
    getGeneralDebitNoteEntryById,
    deleteGeneralDebitNoteEntryById,
    getGeneralCreditNoteEntrySRNo,
    addEditGeneralCreditNoteEntry,
    getAllGeneralCreditNoteEntry,
    getGeneralCreditNoteEntryById,
    deleteGeneralCreditNoteEntryById,
    generateCreditNoteEntryById,
    generateDebitNoteEntryById,
    getJVEntryVoucherNo,
    addEditJVEntry,
    getAllJVEntry,
    getJVEntryById,
    deleteJVEntryById,
    getAllAccountLedger,
    getAllPendingInvoicePaymentReport,
    getRunningBalanceByPartyId,
    getAllBankWiseCashBankBookReport,
    getAllMonthWiseCashBankBookReportbyBankId,
    getAllDateWiseCashBankBookReportbyBankId,
    getAllGroupWiseAccountSummary,
    getAllOpeningBalanceReport,
    getAllGSTSalesRegister,
    getAllGSTPurchaseRegister,
    getBankBalanceByBankId
};