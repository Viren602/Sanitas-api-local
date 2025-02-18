import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import contraEntryModel from "../model/Account/contraEntryModel.js";
import paymentAdjustmentListModel from "../model/Account/paymentAdjustmentListModel.js";
import paymentReceiptEntryModel from "../model/Account/paymentReceiptEntryModel.js";
import gstInvoiceFinishGoodsModel from "../model/Despatch/gstInvoiceFinishGoods.js";
import gstInvoicePMModel from "../model/Despatch/gstInvoicePMModel.js";
import gstInvoiceRMModel from "../model/Despatch/gstInvoiceRMModel.js";
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
            // const existingAdjustments = await paymentAdjustmentListModel.find({ paymentReceiptId: response._id });

            // const revertPromises = existingAdjustments.map(item => {
            //     let updates = [];
            //     let paidAmount = item.adjAmount;

            //     if (item.gstInvoiceFinishGoodsId) {
            //         updates.push(
            //             gstInvoiceFinishGoodsModel.findByIdAndUpdate(
            //                 item.gstInvoiceFinishGoodsId,
            //                 { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
            //             )
            //         );
            //     }
            //     return Promise.all(updates);
            // });

            // await Promise.all(revertPromises);

            // Edit Adjustment Details
            await paymentAdjustmentListModel.deleteMany({ paymentReceiptId: response._id });
            const items = data.adjustmentDetailsList.map(item => ({
                ...item,
                paymentReceiptId: response._id
            }));
            await paymentAdjustmentListModel.insertMany(items);

            // Re-Update Adjustment
            // const updatePromises = data.adjustmentDetailsList.map(item => {
            //     let updates = [];
            //     let paidAmount = item.adjAmount;

            //     if (item.gstInvoiceFinishGoodsId) {
            //         updates.push(
            //             gstInvoiceFinishGoodsModel.findByIdAndUpdate(
            //                 item.gstInvoiceFinishGoodsId,
            //                 { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
            //             )
            //         );
            //     }
            //     return Promise.all(updates);
            // });
            // await Promise.all(updatePromises);

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
            // const updatePromises = data.adjustmentDetailsList.map(item => {
            //     const updates = [];
            //     let paidAmount = item.adjAmount;

            //     if (item.gstInvoiceFinishGoodsId) {
            //         updates.push(
            //             gstInvoiceFinishGoodsModel.findByIdAndUpdate(
            //                 item.gstInvoiceFinishGoodsId,
            //                 { $inc: { pendingAmount: -paidAmount, paidAmount: paidAmount } }
            //             )
            //         );
            //     }
            //     return Promise.all(updates);
            // });
            // await Promise.all(updatePromises);

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
        // const existingAdjustments = await paymentAdjustmentListModel.find({ paymentReceiptId: reqId });

        // // const revertPromises = existingAdjustments.map(item => {
        // //     let updates = [];
        // //     let paidAmount = item.adjAmount;

        // //     if (item.gstInvoiceFinishGoodsId) {
        // //         updates.push(
        // //             gstInvoiceFinishGoodsModel.findByIdAndUpdate(
        // //                 item.gstInvoiceFinishGoodsId,
        // //                 { $inc: { pendingAmount: paidAmount, paidAmount: -paidAmount } }
        // //             )
        // //         );
        // //     }
        // //     return Promise.all(updates);
        // // });
        // // await Promise.all(revertPromises);

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

export {
    getReceiptEntryVoucherNo,
    getAllPendingInvoiceByPartyId,
    addEditReceiptEntry,
    getAllReceiptEntry,
    getReceiptDetailsByReceiptId,
    deleteReceiptDetailsByReceiptId,
    getPaymentEntryVoucherNo,
    addEditPaymentEntry,
    getAllPaymnetEntry,
    getPaymentDetailsByPaymnetReceiptId,
    deletePaymentDetailsByPaymentReceiptId,
    getContraEntryVoucherNo,
    addEditContraEntry,
    getAllContraEntry,
    getContraEntryById,
    deleteContraEntryById
};