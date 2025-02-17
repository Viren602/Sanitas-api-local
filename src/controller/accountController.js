import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import paymentAdjustmentListModel from "../model/Account/paymentAdjustmentListModel.js";
import paymentReceiptEntryModel from "../model/Account/paymentReceiptEntryModel.js";
import gstInvoiceFinishGoodsModel from "../model/Despatch/gstInvoiceFinishGoods.js";
import gstInvoicePMModel from "../model/Despatch/gstInvoicePMModel.js";
import gstInvoiceRMModel from "../model/Despatch/gstInvoiceRMModel.js";
import errorHandler from "../server/errorHandle.js";

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
        if (data.receiptDetails.receiptId && data.receiptDetails.receiptId.trim() !== '') {
            // Edit For Receipt Details
            const response = await paymentReceiptEntryModel.findByIdAndUpdate(data.receiptDetails.receiptId, data.receiptDetails, { new: true });
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
            responseData.invoiceDetails = response;


            // Retrieve Existing Adjustments 
            const existingAdjustments = await paymentAdjustmentListModel.find({ receiptId: response._id });

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
            await paymentAdjustmentListModel.deleteMany({ receiptId: response._id });
            const items = data.adjustmentDetailsList.map(item => ({
                ...item,
                receiptId: response._id
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
                    Message: "Receipt Details Updated Successfully",
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
                receiptId: response._id
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

const getAllReceiptEntry = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
            from: data.from
        }

        let sortBy = 'voucherNo'

        if (data.invoiceNo && data.invoiceNo.trim() !== "") {
            queryObject.invoiceNo = { $regex: `^${data.invoiceNo}`, $options: "i" };
        }

        if (data.arrangedBy && data.arrangedBy.trim() !== "") {
            sortBy = data.arrangedBy;
        }

        let response = []
        response = await paymentReceiptEntryModel
            .find(queryObject)
            .sort(sortBy)
            .populate({
                path: 'partyId',
                select: 'partyName',
            });

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

            let adjustmentDetailsList = await paymentAdjustmentListModel.find({ isDeleted: false, receiptId: reqId })
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
        const existingAdjustments = await paymentAdjustmentListModel.find({ receiptId: reqId });

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

        await paymentAdjustmentListModel.deleteMany({ receiptId: reqId });

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

export {
    getReceiptEntryVoucherNo,
    getAllPendingInvoiceByPartyId,
    addEditReceiptEntry,
    getAllReceiptEntry,
    getReceiptDetailsByReceiptId,
    deleteReceiptDetailsByReceiptId
};