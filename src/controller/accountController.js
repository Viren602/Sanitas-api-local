import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import contraEntryModel from "../model/Account/contraEntryModel.js";
import generalCreditNoteModel from "../model/Account/generalCreditNoteModel.js";
import generalDebitNoteModel from "../model/Account/generalDebitNoteModel.js";
import gstPurchaseWithoutInventoryEntryModel from "../model/Account/gstPurcaseWithoutInventoryEntryModel.js";
import gstPurchaseEntryRMPMModel from "../model/Account/gstPurchaseEntryRMPMModel.js";
import gstPurchaseItemListRMPMModel from "../model/Account/gstPurchaseItemListRMPMModel.js";
import paymentAdjustmentListModel from "../model/Account/paymentAdjustmentListModel.js";
import paymentReceiptEntryModel from "../model/Account/paymentReceiptEntryModel.js";
import gstInvoiceFinishGoodsModel from "../model/Despatch/gstInvoiceFinishGoods.js";
import gstInvoicePMModel from "../model/Despatch/gstInvoicePMModel.js";
import gstInvoiceRMModel from "../model/Despatch/gstInvoiceRMModel.js";
import grnEntryMaterialDetailsModel from "../model/InventoryModels/grnEntryMaterialDetailsModel.js";
import grnEntryPartyDetailsModel from "../model/InventoryModels/grnEntryPartyDetailsModel.js";
import errorHandler from "../server/errorHandle.js";

// Receipt Entry
const getReceiptEntryVoucherNo = async (req, res) => {
    try {
        let response = {}
        let voucherNoRecord = await paymentReceiptEntryModel
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let queryObject = {
            isDeleted: false,
            partyId: reqId
        }
        let response = []

        if (reqId) {
            const finishGoodsData = await gstInvoiceFinishGoodsModel
                .find(queryObject)
                .select('invoiceNo partyId invoiceDate pendingAmount grandTotal')
                .lean();

            const rmData = await gstInvoiceRMModel
                .find(queryObject)
                .select('invoiceNo partyId invoiceDate pendingAmount grandTotal')
                .lean();

            const pmData = await gstInvoicePMModel
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {}
        if (data.receiptDetails.paymentReceiptId && data.receiptDetails.paymentReceiptId.trim() !== '') {
            // Edit For Receipt Details
            const response = await paymentReceiptEntryModel.findByIdAndUpdate(data.receiptDetails.paymentReceiptId, data.receiptDetails, { new: true });
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


            const existingAdjustments = await paymentAdjustmentListModel.find({ paymentReceiptId: response._id });

            const revertPromises = existingAdjustments.map(item => {
                let updates = [];
                let paidAmount = item.adjAmount;

                if (item.gstInvoiceFinishGoodsId) {
                    updates.push(
                        gstInvoiceFinishGoodsModel.findByIdAndUpdate(
                            item.gstInvoiceFinishGoodsId,
                            { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                        )
                    );
                }
                if (item.gstRMInvoiceId) {
                    updates.push(
                        gstInvoiceRMModel.findByIdAndUpdate(
                            item.gstRMInvoiceId,
                            { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                        )
                    );
                }
                if (item.gstPMInvoiceId) {
                    updates.push(
                        gstInvoicePMModel.findByIdAndUpdate(
                            item.gstPMInvoiceId,
                            { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                        )
                    );
                }
                return Promise.all(updates);
            });

            await Promise.all(revertPromises);

            // Edit Adjustment Details
            await paymentAdjustmentListModel.deleteMany({ paymentReceiptId: response._id });
            const items = data.adjustmentDetailsList.map(item => ({
                ...item,
                paymentReceiptId: response._id
            }));
            await paymentAdjustmentListModel.insertMany(items);

            // Re-Update Adjustment
            const updatePromises = data.adjustmentDetailsList.map(item => {
                let updates = [];
                let paidAmount = item.adjAmount;

                if (item.gstInvoiceFinishGoodsId) {
                    updates.push(
                        gstInvoiceFinishGoodsModel.findByIdAndUpdate(
                            item.gstInvoiceFinishGoodsId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                if (item.gstRMInvoiceId) {
                    updates.push(
                        gstInvoiceRMModel.findByIdAndUpdate(
                            item.gstRMInvoiceId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                if (item.gstPMInvoiceId) {
                    updates.push(
                        gstInvoicePMModel.findByIdAndUpdate(
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
            const response = new paymentReceiptEntryModel(data.receiptDetails);
            await response.save();

            const items = data.adjustmentDetailsList.map(item => ({
                ...item,
                paymentReceiptId: response._id
            }));

            // Add Adjustment Details
            await paymentAdjustmentListModel.insertMany(items);

            // Update Amounts in GST Invoices
            const updatePromises = data.adjustmentDetailsList.map(item => {
                const updates = [];
                let paidAmount = item.adjAmount;

                if (item.gstInvoiceFinishGoodsId) {
                    updates.push(
                        gstInvoiceFinishGoodsModel.findByIdAndUpdate(
                            item.gstInvoiceFinishGoodsId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                if (item.gstRMInvoiceId) {
                    updates.push(
                        gstInvoiceRMModel.findByIdAndUpdate(
                            item.gstRMInvoiceId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                if (item.gstPMInvoiceId) {
                    updates.push(
                        gstInvoicePMModel.findByIdAndUpdate(
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
            from: data.from
        }

        let sortOption = { voucherNo: 1 };
        if (data.arrangedBy && data.arrangedBy.trim() !== '') {
            sortOption = { [data.arrangedBy]: 1 };
        }

        let response = await paymentReceiptEntryModel.aggregate([
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}

        if (reqId) {
            let receiptDetails = await paymentReceiptEntryModel.findOne({ isDeleted: false, _id: reqId })
            response.receiptDetails = receiptDetails

            let adjustmentDetailsList = await paymentAdjustmentListModel.find({ isDeleted: false, paymentReceiptId: reqId })
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
        const { id } = req.query;
        let reqId = getRequestData(id)

        // Retrieve Existing Adjustments 
        const existingAdjustments = await paymentAdjustmentListModel.find({ paymentReceiptId: reqId });

        const revertPromises = existingAdjustments.map(item => {
            let updates = [];
            let paidAmount = item.adjAmount;

            if (item.gstInvoiceFinishGoodsId) {
                updates.push(
                    gstInvoiceFinishGoodsModel.findByIdAndUpdate(
                        item.gstInvoiceFinishGoodsId,
                        { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                    )
                );
            }
            if (item.gstRMInvoiceId) {
                updates.push(
                    gstInvoiceRMModel.findByIdAndUpdate(
                        item.gstRMInvoiceId,
                        { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                    )
                );
            }
            if (item.gstPMInvoiceId) {
                updates.push(
                    gstInvoicePMModel.findByIdAndUpdate(
                        item.gstPMInvoiceId,
                        { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                    )
                );
            }
            return Promise.all(updates);
        });
        await Promise.all(revertPromises);

        await paymentAdjustmentListModel.deleteMany({ paymentReceiptId: reqId });

        const response = await paymentReceiptEntryModel.findByIdAndUpdate(reqId, { isDeleted: true });

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
        let response = {}
        let voucherNoRecord = await paymentReceiptEntryModel
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let queryObject = {
            isDeleted: false,
            partyId: reqId
        }
        let response = []

        if (reqId) {
            const gstPurchaseEntryData = await gstPurchaseEntryRMPMModel
                .find(queryObject)
                .select('invoiceNo partyId invoiceDate pendingAmount grandTotal')
                .lean();

            const gstPurchaseWithoutInventoryData = await gstPurchaseWithoutInventoryEntryModel
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {}
        if (data.paymentDetails.paymentReceiptId && data.paymentDetails.paymentReceiptId.trim() !== '') {
            // Edit For Receipt Details
            const response = await paymentReceiptEntryModel.findByIdAndUpdate(data.paymentDetails.paymentReceiptId, data.paymentDetails, { new: true });
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
            const existingAdjustments = await paymentAdjustmentListModel.find({ paymentReceiptId: response._id });

            const revertPromises = existingAdjustments.map(item => {
                let updates = [];
                let paidAmount = item.adjAmount;

                if (item.gstPurchaseEntryRMPMId) {
                    updates.push(
                        gstPurchaseEntryRMPMModel.findByIdAndUpdate(
                            item.gstPurchaseEntryRMPMId,
                            { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                        )
                    );
                }
                if (item.gstPurchaseEntryWithoutInventoryId) {
                    updates.push(
                        gstPurchaseWithoutInventoryEntryModel.findByIdAndUpdate(
                            item.gstPurchaseEntryWithoutInventoryId,
                            { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                        )
                    );
                }
                return Promise.all(updates);
            });

            await Promise.all(revertPromises);

            // Edit Adjustment Details
            await paymentAdjustmentListModel.deleteMany({ paymentReceiptId: response._id });
            const items = data.adjustmentDetailsList.map(item => ({
                ...item,
                paymentReceiptId: response._id
            }));
            await paymentAdjustmentListModel.insertMany(items);

            // Re-Update Adjustment
            const updatePromises = data.adjustmentDetailsList.map(item => {
                let updates = [];
                let paidAmount = item.adjAmount;

                if (item.gstPurchaseEntryRMPMId) {
                    updates.push(
                        gstPurchaseEntryRMPMModel.findByIdAndUpdate(
                            item.gstPurchaseEntryRMPMId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                if (item.gstPurchaseEntryWithoutInventoryId) {
                    updates.push(
                        gstPurchaseWithoutInventoryEntryModel.findByIdAndUpdate(
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
            const response = new paymentReceiptEntryModel(data.paymentDetails);
            await response.save();

            const items = data.adjustmentDetailsList.map(item => ({
                ...item,
                paymentReceiptId: response._id
            }));

            // Add Adjustment Details
            await paymentAdjustmentListModel.insertMany(items);

            // Update Amounts in GST Invoices
            const updatePromises = data.adjustmentDetailsList.map(item => {
                const updates = [];
                let paidAmount = item.adjAmount;

                if (item.gstPurchaseEntryRMPMId) {
                    updates.push(
                        gstPurchaseEntryRMPMModel.findByIdAndUpdate(
                            item.gstPurchaseEntryRMPMId,
                            { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
                        )
                    );
                }
                if (item.gstPurchaseEntryWithoutInventoryId) {
                    updates.push(
                        gstPurchaseWithoutInventoryEntryModel.findByIdAndUpdate(
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
            from: data.from
        }

        let sortOption = { voucherNo: 1 };
        if (data.arrangedBy && data.arrangedBy.trim() !== '') {
            sortOption = { [data.arrangedBy]: 1 };
        }

        let response = await paymentReceiptEntryModel.aggregate([
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}

        if (reqId) {
            let paymentDetails = await paymentReceiptEntryModel.findOne({ isDeleted: false, _id: reqId })
            response.paymentDetails = paymentDetails

            let adjustmentDetailsList = await paymentAdjustmentListModel.find({ isDeleted: false, paymentReceiptId: reqId })
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
        const { id } = req.query;
        let reqId = getRequestData(id)

        // Retrieve Existing Adjustments 
        const existingAdjustments = await paymentAdjustmentListModel.find({ paymentReceiptId: reqId });

        const revertPromises = existingAdjustments.map(item => {
            let updates = [];
            let paidAmount = item.adjAmount;

            if (item.gstPurchaseEntryRMPMId) {
                updates.push(
                    gstPurchaseEntryRMPMModel.findByIdAndUpdate(
                        item.gstPurchaseEntryRMPMId,
                        { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                    )
                );
            }
            if (item.gstPurchaseEntryWithoutInventoryId) {
                updates.push(
                    gstPurchaseWithoutInventoryEntryModel.findByIdAndUpdate(
                        item.gstPurchaseEntryWithoutInventoryId,
                        { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
                    )
                );
            }
            return Promise.all(updates);
        });
        await Promise.all(revertPromises);

        await paymentAdjustmentListModel.deleteMany({ paymentReceiptId: reqId });

        const response = await paymentReceiptEntryModel.findByIdAndUpdate(reqId, { isDeleted: true });

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
        let response = {}
        let voucherNoRecord = await contraEntryModel
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        if (data.contraId && data.contraId.trim() !== '') {
            const response = await contraEntryModel.findByIdAndUpdate(data.contraId, data, { new: true });

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

            await paymentReceiptEntryModel.deleteMany({ contraId: data.contraId });

            // Create New Transactions
            const debitTransaction = new paymentReceiptEntryModel({
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

            const creditTransaction = new paymentReceiptEntryModel({
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
            const response = new contraEntryModel(data);
            await response.save();

            // Paymen Receipt Entry Table
            const debitTransaction = new paymentReceiptEntryModel({
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

            const creditTransaction = new paymentReceiptEntryModel({
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
        }

        let sortBy = 'voucherNo'

        if (data.search && data.search.trim() !== "") {
            queryObject.voucherNo = { $regex: `^${data.search}`, $options: "i" };
        }

        if (data.arrangedBy && data.arrangedBy.trim() !== "") {
            sortBy = data.arrangedBy;
        }

        let response = []
        response = await contraEntryModel
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
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}

        if (reqId) {
            response = await contraEntryModel.findOne({ isDeleted: false, _id: reqId })
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
        const { id } = req.query;
        let reqId = getRequestData(id)

        await paymentReceiptEntryModel.updateMany(
            { contraId: reqId },
            { isDeleted: true });

        const response = await contraEntryModel.findByIdAndUpdate(reqId, { isDeleted: true });

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
        let response = {}
        let gstNoRecord = await gstPurchaseEntryRMPMModel
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let response = await grnEntryMaterialDetailsModel
            .find({
                isDeleted: false,
                isGSTPurchaseEntryRMPM: false,
                grnEntryPartyDetailId: await grnEntryPartyDetailsModel.findOne({
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let response = await grnEntryMaterialDetailsModel
            .findByIdAndUpdate(data.grnMaterialId, { isGSTPurchaseEntryRMPM: data.isGRNEntryDone })

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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {}

        if (data.invoiceDetails.gstPurchaseEntryRMPMId && data.invoiceDetails.gstPurchaseEntryRMPMId.trim() !== '') {
            // Edit For Purchase Details
            const response = await gstPurchaseEntryRMPMModel.findByIdAndUpdate(data.invoiceDetails.gstPurchaseEntryRMPMId, data.invoiceDetails, { new: true });
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

            // Edit Items For GST Purchase Details
            await gstPurchaseItemListRMPMModel.deleteMany({ gstPurchaseEntryRMPMId: response._id });

            const items = data.itemListing.map(item => ({
                ...item,
                gstPurchaseEntryRMPMId: response._id
            }));

            await gstPurchaseItemListRMPMModel.insertMany(items);

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
            const response = new gstPurchaseEntryRMPMModel(data.invoiceDetails);
            await response.save();

            responseData.invoiceDetails = response;

            const items = data.itemListing.map(item => ({
                ...item,
                gstPurchaseEntryRMPMId: response._id
            }));

            // ADD Items For GST Purchase Details
            await gstPurchaseItemListRMPMModel.insertMany(items);

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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
        }

        let sortOption = { srNo: 1 };
        if (data.arrangedBy && data.arrangedBy.trim() !== '') {
            sortOption = { [data.arrangedBy]: 1 };
        }

        let response = await gstPurchaseEntryRMPMModel.aggregate([
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
        const { id } = req.query;
        let reqId = getRequestData(id)

        let invoiceDetails = await gstPurchaseEntryRMPMModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: "partyId",
                select: "partyName",
            });

        let itemListing = await gstPurchaseItemListRMPMModel
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
        const { id } = req.query;
        let reqId = getRequestData(id)

        await gstPurchaseItemListRMPMModel.updateMany({ gstPurchaseEntryRMPMId: reqId }, { isDeleted: true });

        const response = await gstPurchaseEntryRMPMModel.findByIdAndUpdate(reqId, { isDeleted: true });

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
        let response = {}
        let gstNoRecord = await gstPurchaseWithoutInventoryEntryModel
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {}

        if (data.gstPurchaseEntryWithoutInventoryId && data.gstPurchaseEntryWithoutInventoryId.trim() !== '') {

            const response = await gstPurchaseWithoutInventoryEntryModel.findByIdAndUpdate(data.gstPurchaseEntryWithoutInventoryId, data, { new: true });
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
            const response = new gstPurchaseWithoutInventoryEntryModel(data);
            await response.save();

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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
        }

        let sortOption = { srNo: 1 };
        if (data.arrangedBy && data.arrangedBy.trim() !== '') {
            sortOption = { [data.arrangedBy]: 1 };
        }

        let response = await gstPurchaseWithoutInventoryEntryModel.aggregate([
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
        const { id } = req.query;
        let reqId = getRequestData(id)

        const response = await gstPurchaseWithoutInventoryEntryModel
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
        const { id } = req.query;
        let reqId = getRequestData(id)

        const response = await gstPurchaseWithoutInventoryEntryModel.findByIdAndUpdate(reqId, { isDeleted: true });

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
        let response = {}
        let gstNoRecord = await generalDebitNoteModel
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {}

        if (data.generalDebitNoteId && data.generalDebitNoteId.trim() !== '') {

            const response = await generalDebitNoteModel.findByIdAndUpdate(data.generalDebitNoteId, data, { new: true });
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
            const response = new generalDebitNoteModel(data);
            await response.save();

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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
        }

        let sortOption = { noteNo: 1 };
        if (data.arrangedBy && data.arrangedBy.trim() !== '') {
            sortOption = { [data.arrangedBy]: 1 };
        }

        let response = await generalDebitNoteModel.aggregate([
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
        const { id } = req.query;
        let reqId = getRequestData(id)

        const response = await generalDebitNoteModel
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
        const { id } = req.query;
        let reqId = getRequestData(id)

        const response = await generalDebitNoteModel.findByIdAndUpdate(reqId, { isDeleted: true });

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

// General Credit Note Entry
const getGeneralCreditNoteEntrySRNo = async (req, res) => {
    try {
        let response = {}
        let gstNoRecord = await generalCreditNoteModel
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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let responseData = {}

        if (data.generalCreditNoteId && data.generalCreditNoteId.trim() !== '') {

            const response = await generalCreditNoteModel.findByIdAndUpdate(data.generalCreditNoteId, data, { new: true });
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
            const response = new generalCreditNoteModel(data);
            await response.save();

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
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
        }

        let sortOption = { noteNo: 1 };
        if (data.arrangedBy && data.arrangedBy.trim() !== '') {
            sortOption = { [data.arrangedBy]: 1 };
        }

        let response = await generalCreditNoteModel.aggregate([
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
        const { id } = req.query;
        let reqId = getRequestData(id)

        const response = await generalCreditNoteModel
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
        const { id } = req.query;
        let reqId = getRequestData(id)

        const response = await generalCreditNoteModel.findByIdAndUpdate(reqId, { isDeleted: true });

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
    deleteGeneralCreditNoteEntryById
};