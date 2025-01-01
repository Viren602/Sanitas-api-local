import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import grnEntryMaterialDetailsModel from "../model/InventoryModels/grnEntryMaterialDetailsModel.js";
import grnEntryPartyDetailsModel from "../model/InventoryModels/grnEntryPartyDetailsModel.js";
import productionRequisitionEntryModel from "../model/InventoryModels/additionalEntryProductionDetails.js";
import additionalEntryMaterialDetailsModel from "../model/InventoryModels/additionalEntryMaterialDetailsModel.js";
import purchaseOrderDetailsModel from "../model/InventoryModels/PurchaseOrderDetailsModel.js";
import purchaserOrderMaterialDetailsModel from "../model/InventoryModels/purchaseOrderMaterialDetailsModel.js";
import mailsender from "../utils/sendingEmail.js";
import partyModel from "../model/partiesModel.js";
import inquiryDetailsModel from "../model/InventoryModels/inquiryDetailsModel.js";
import inquiryMaterialDetailsModel from "../model/InventoryModels/inquiryMaterialDetails.js";

const addEditGRNEntryMaterialMapping = async (req, res) => {
    try {
        let data = req.body.data
        let responseData = {};
        if (data.grnRawMaterialPartyDetails.partyDetailsId && data.grnRawMaterialPartyDetails.partyDetailsId.trim() !== '') {
            const response = await grnEntryPartyDetailsModel.findByIdAndUpdate(data.grnRawMaterialPartyDetails.partyDetailsId, data.grnRawMaterialPartyDetails, { new: true });
            if (response) {
                responseData.partyDetails = response;
            } else {
                responseData.partyDetails = 'Party details not found';
            }
        } else {

            let nextGRNNO = 'G001';

            const lastRecord = await grnEntryPartyDetailsModel
                .findOne()
                .sort({ grnNo: -1 })
                .select('grnNo')
                .exec();

            if (lastRecord && lastRecord.grnNo) {
                const lastNumber = parseInt(lastRecord.grnNo.slice(1), 10);
                nextGRNNO = `G${String(lastNumber + 1).padStart(3, '0')}`;
            }

            data.grnRawMaterialPartyDetails.grnNo = nextGRNNO;

            const response = new grnEntryPartyDetailsModel(data.grnRawMaterialPartyDetails);
            await response.save();
            responseData.partyDetails = response;
        }

        if (data.grnMaterialDetails.materialDetailsId && data.grnMaterialDetails.materialDetailsId.trim() !== '') {
            data.grnMaterialDetails.grnEntryPartyDetailId = responseData.partyDetails._id
            const response = await grnEntryMaterialDetailsModel.findByIdAndUpdate(data.grnMaterialDetails.materialDetailsId, data.grnMaterialDetails, { new: true });
            if (response) {
                responseData.materialDetails = response;
            } else {
                responseData.materialDetails = 'Material details not found';
            }
        } else {
            data.grnMaterialDetails.grnEntryPartyDetailId = responseData.partyDetails._id
            const response = new grnEntryMaterialDetailsModel(data.grnMaterialDetails);
            await response.save();
            responseData.materialDetails = response;
        }

        res.status(200).json({
            Message: "GRN entry material mapping added/updated successfully",
            data: responseData
        });

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllPartyListForGRNEntry = async (req, res) => {
    try {
        let data = req.body.data

        let queryObject = { isDeleted: false }

        let filterBy = 'partyName'

        if (data.filterBy && data.filterBy.trim() !== '') {
            filterBy = data.filterBy
        }

        if (data.materialType && data.materialType !== 'Select' && data.materialType.trim() !== '') {
            queryObject.grnEntryType = data.materialType
        }

        let response = await grnEntryPartyDetailsModel
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

        res.status(200).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllgrnEntryMaterialDetailsById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = []
        if (id) {
            response = await grnEntryMaterialDetailsModel
                .find({ grnEntryPartyDetailId: id, isDeleted: false })
                .populate({
                    path: 'rawMaterialId',
                    select: 'rmName _id',
                })
                .populate({
                    path: 'packageMaterialId',
                    select: 'pmName _id',
                });
        }
        res.status(200).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("error in Inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteGRNEntryMaterialDetailsById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        if (id) {
            response = await grnEntryPartyDetailsModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(200).json({ Message: "GRN Party Details deleted successfully", responseContent: response });
    } catch (error) {
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteItemforGRNEntryMaterialById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        if (id) {
            response = await grnEntryMaterialDetailsModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(200).json({ Message: "GRN Material Detail deleted successfully", responseContent: response });
    } catch (error) {
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addEditAdditionalEntryMaterialMapping = async (req, res) => {
    try {
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')


        let responseData = {};
        if (reqData.productionRequisitionEntry.productionDetailId && reqData.productionRequisitionEntry.productionDetailId.trim() !== '') {
            const response = await productionRequisitionEntryModel.findByIdAndUpdate(reqData.productionRequisitionEntry.productionDetailId, reqData.productionRequisitionEntry, { new: true });
            if (response) {
                responseData.productionRequisitionDetails = response;
            } else {
                responseData.productionRequisitionDetails = 'Additional Production Requisition details not found';
            }
        } else {

            let nextSlipno = 'AR001';

            const lastRecord = await productionRequisitionEntryModel
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

            const response = new productionRequisitionEntryModel(reqData.productionRequisitionEntry);
            await response.save();
            responseData.productionRequisitionDetails = response;
        }

        if (reqData.productionRequisitionMaterialDetails.productionMaterialDetailId && reqData.productionRequisitionMaterialDetails.productionMaterialDetailId.trim() !== '') {
            reqData.productionRequisitionMaterialDetails.additionalEntryDetailsId = responseData.productionRequisitionDetails._id
            const response = await additionalEntryMaterialDetailsModel.findByIdAndUpdate(reqData.productionRequisitionMaterialDetails.productionMaterialDetailId, reqData.productionRequisitionMaterialDetails, { new: true });
            if (response) {
                responseData.materialDetails = response;
            } else {
                responseData.materialDetails = 'Material details not found';
            }
        } else {
            reqData.productionRequisitionMaterialDetails.additionalEntryDetailsId = responseData.productionRequisitionDetails._id
            const response = new additionalEntryMaterialDetailsModel(reqData.productionRequisitionMaterialDetails);
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
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllAdditionalEntryMaterialDetailsById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = []
        if (reqId) {
            response = await additionalEntryMaterialDetailsModel
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
        console.log("error in Inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllAdditionalEntryList = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }
        let filterBy = 'slipNo'

        if (data.filterBy && data.filterBy.trim() !== '') {
            filterBy = data.filterBy
        }

        if (data.materialType && data.materialType !== 'Select' && data.materialType.trim() !== '') {
            queryObject.materialType = data.materialType
        }

        let response = await productionRequisitionEntryModel
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteAdditionalEntryDetailsById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await productionRequisitionEntryModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteAdditionalEntryMaterialDetailsById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await additionalEntryMaterialDetailsModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addEditPurchaseOrderDetails = async (req, res) => {
    try {
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')


        let responseData = {};
        if (reqData.purchaseOrderId && reqData.purchaseOrderId.trim() !== '') {
            const response = await purchaseOrderDetailsModel.findByIdAndUpdate(reqData.purchaseOrderId, reqData, { new: true });
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

            const lastRecord = await purchaseOrderDetailsModel
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

            const response = new purchaseOrderDetailsModel(reqData);
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
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllPurchaseOrders = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }
        let filterBy = 'purchaseOrderNo'

        if (data.filterBy && data.filterBy.trim() !== '') {
            filterBy = data.filterBy
        }

        if (data.materialType && data.materialType !== 'Select' && data.materialType.trim() !== '') {
            queryObject.materialType = data.materialType
        }

        if (data.status && data.status !== 'Select' && data.status.trim() !== '') {
            queryObject.status = data.status
        }

        let response = await purchaseOrderDetailsModel
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addEditPurchaserOrderMaterialDetails = async (req, res) => {
    try {
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let responseData = {};
        if (reqData.purchaseOrderMaterialDetialId && reqData.purchaseOrderMaterialDetialId.trim() !== '') {
            const response = await purchaserOrderMaterialDetailsModel.findByIdAndUpdate(reqData.purchaseOrderMaterialDetialId, reqData, { new: true });
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

            const response = new purchaserOrderMaterialDetailsModel(reqData);
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
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getPurchaseOrderMaterialDetailsByPurchaseOrderId = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = []
        if (reqId) {
            response = await purchaserOrderMaterialDetailsModel
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
        console.log("error in Inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deletePurchaseOrderDetailsById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await purchaseOrderDetailsModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deletepurchaseOrderMaterialDetialsById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await purchaserOrderMaterialDetailsModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const sendPurchaseOrderMail = async (req, res) => {
    try {
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')

        if (reqData.partyId._id) {
            let id = reqData.partyId._id
            let partyDetails = await partyModel.findOne({ _id: id }).select("partyName person");

            let purchaseMaterial = await purchaserOrderMaterialDetailsModel
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
            let gstAmount = subTotalAmount * (gstRate / (100 + gstRate))
            let totalAmount = subTotalAmount + gstAmount

            const tableRows = purchaseMaterial && purchaseMaterial.length > 0
                ? purchaseMaterial.map(material => `
                <tr>
                    <td>${material.packageMaterialId ? material.packageMaterialId.pmName : material.rawMaterialId.rmName}</td>
                    <td>${material.packageMaterialId ? material.packageMaterialId.pmUOM : material.rawMaterialId.rmUOM}</td>
                    <td>${material.qty}</td>
                    <td>${material.rate}</td>
                    <td>${material.per}</td>
                    <td>${material.amount}</td>
                </tr>
            `).join('')
                : '';

            let emaildata = {
                toMail: reqData.email,
                subject: "Purchase Order Confirmation",
                fromMail: "zyden.itsolutions@gmail.com",
                html: `
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body {
                                margin: 0;
                                padding: 0;
                                background-color: #f4f7f9;
                                font-family: Nunito Sans, sans-serif;
                            }

                            p {
                                margin-top: 6px;
                                margin-bottom: 2px !important;
                            }

                            .email-container {
                                max-width: 800px;
                                margin: auto;
                                background-color: #ffffff;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            }

                            .header {
                                background-color: #e0f7fa;
                                padding: 20px;
                                border-radius: 8px;
                                display: flex;
                                justify-content: space-between !important;
                                align-items: center !important;
                            }

                            .header img {
                                max-width: 150px;
                                height: auto;
                            }

                            .header .main-title {
                                font-size: 24px;
                                color: #00796b;
                                font-weight: bold;
                                text-align: right;
                                margin: 0;
                            }

                            .content {
                                padding: 5px;
                                background-color: #ffffff;
                                border-radius: 8px;
                            }

                            .content h1 {
                                font-size: 16px;
                                color: #00796b;
                                margin-bottom: 10px;
                                margin-top: 2px !important;
                            }

                            .content p {
                                font-size: 16px;
                                color: #333333;
                                line-height: 1.5;
                                margin-bottom: 15px;
                            }

                            .purchase-table table td {
                                padding: 5px 10px;
                                text-align: left;
                                border: 1px solid #ddd;
                            }

                            .purchase-table table thead {
                                background: linear-gradient(135deg, #1e3a8a, #77bfca);
                            }

                            .purchase-table table thead tr td {
                                color: #ffffff;
                                font-weight: 600;
                            }

                            table tbody tr td, table tbody tr td p {
                                font-size: 14px !important;
                                margin: 0;
                            }
                            .purchase-table table {
                                width: 100%;
                                border-collapse: collapse;
                                table-layout: auto;
                            }

                            .footer {
                                background-color: #b2dfdb;
                                padding: 20px;
                                border-radius: 8px;
                                text-align: center;
                                margin-top: 20px;
                            }

                            .footer .social-links a {
                                margin: 0 10px;
                                display: inline-block;
                            }

                            .footer .social-links img {
                                width: 32px;
                                height: 32px;
                                vertical-align: middle;
                            }

                            .footer .site-link {
                                font-size: 16px;
                                font-weight: bold;
                                color: #00796b;
                                display: block;
                                margin: 10px 0;
                                /* text-decoration: none; */
                            }

                            .footer .small-print {
                                font-size: 12px;
                                color: #004d40;
                                font-weight: 600;
                            }
                        </style>
                    </head>

                    <body>
                        <div class="email-container">
                            <!-- Header -->
                            <div class="header">
                                <img src="https://www.sanitashealthcare.in/Sanitash-logo.png" alt="Header Logo">
                                <div class="main-title"></div>
                            </div>

                            <!-- Content -->
                            <div class="content">
                                <h4>Dear ${partyDetails.person} (${partyDetails.partyName}),</h4>
                                <p>Please find attached the details of our purchase order for the following products:</p>
                                <div class="purchase-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <td style="width: 40%;">Item Name</td>
                                                <td style="width: 10%;">Unit</td>
                                                <td style="width: 15%;">Quantity</td>
                                                <td style="width: 10%;">Rate</td>
                                                <td style="width: 10%;">Per</td>
                                                <td style="width: 15%;">Amount</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                       ${tableRows}
                                        </tbody>
                                    </table>
                                    <table class="amount-box">
                                        <tbody>
                                            <tr>
                                                <td style="width: 60%; border: none;"> </td>
                                                <td style="width: 25%; border-right: none; border-top: none; padding: 0;">
                                                    <p style="padding: 2px 10px;">Sub Total:</p>
                                                    <p style="padding: 1px 10px;">GST(${gstRate}) :</p>
                                                    <p style='border-top: 1px solid #ddd; padding: 5px 10px;'>Total Amount :</p>
                                                </td>
                                                <td style="width: 15%; border-left: none; border-top: none; padding: 0;">
                                                    <p style="padding: 2px 10px;">${subTotalAmount.toFixed(2)}</p>
                                                    <p style="padding: 1px 10px;">${gstAmount.toFixed(2)}</p>
                                                    <p style='border-top: 1px solid #ddd; padding: 5px 10px;'>${totalAmount.toFixed(2)}</p></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p>If you have any questions about your order or need further assistance, please do not hesitate to contact
                                    us.</p>
                                <p class="thank-you"><strong>Thank you!</strong></p>
                            </div>

                            <!-- Footer -->
                            <div class="footer">
                            <div class="social-links">
                                <a href="https://www.facebook.com/people/Sanitas-Healthcare/100091492130628/" target="_blank"
                                    rel="noopener">
                                    <img src="https://www.sanitashealthcare.in/Facebook.png" alt="Facebook">
                                </a>
                                <a href="https://www.instagram.com/sanitashealthcare/?igsh=YTBycW5nc2lzd3Rl" target="_blank"
                                    rel="noopener">
                                    <img src="https://www.sanitashealthcare.in/instagram.png" alt="Instagram">
                                </a>
                            </div>
                                <a href="https://www.sanitashealthcare.in/" target="_blank" rel="noopener" class="site-link">
                                    www.sanitashealthcare.in
                                </a>
                                <div class="small-print">
                                    &copy; 2022 Sanitas Healthcare. All rights are reserved.
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>`,
            };
            mailsender(emaildata)

            if (reqData.purchaseOrderId && reqData.purchaseOrderId.trim() !== '') {
                let reqeust = {
                    status: 'Email Sent'
                }
                const response = await purchaseOrderDetailsModel.findByIdAndUpdate(reqData.purchaseOrderId, reqeust, { new: true });
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
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const approvePurchaseOrderByPurchaseId = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await purchaseOrderDetailsModel.findByIdAndUpdate(reqId, { status: 'Order Approved' }, { new: true, useFindAndModify: false });
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const addEditInquiryDetails = async (req, res) => {
    try {
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let responseData = {};
        if (reqData.inquiryEntryDetails.inquiryId && reqData.inquiryEntryDetails.inquiryId.trim() !== '') {
            const response = await inquiryDetailsModel.findByIdAndUpdate(reqData.inquiryEntryDetails.inquiryId, reqData.inquiryEntryDetails, { new: true });
            if (response) {
                responseData.inquiryEntryDetails = response;
            } else {
                responseData.inquiryEntryDetails = 'Party details not found';
            }
        } else {
            let nextInquiryNo = 'IQR0001';

            const lastRecord = await inquiryDetailsModel
                .findOne()
                .sort({ inquiryNo: -1 })
                .select('inquiryNo')
                .exec();

            if (lastRecord && lastRecord.inquiryNo) {
                const lastNumber = parseInt(lastRecord.inquiryNo.slice(3), 10);
                nextInquiryNo = `IQR${String(lastNumber + 1).padStart(4, '0')}`;
            }

            reqData.inquiryEntryDetails.inquiryNo = nextInquiryNo;

            const response = new inquiryDetailsModel(reqData.inquiryEntryDetails);
            await response.save();
            responseData.inquiryEntryDetails = response;
        }

        if (reqData.inquiryMaterialDetails.inquiryMaterialDetailsId && reqData.inquiryMaterialDetails.inquiryMaterialDetailsId.trim() !== '') {
            reqData.inquiryMaterialDetails.inquiryId = responseData.inquiryEntryDetails._id
            const response = await inquiryMaterialDetailsModel.findByIdAndUpdate(reqData.inquiryMaterialDetails.inquiryMaterialDetailsId, reqData.inquiryMaterialDetails, { new: true });
            if (response) {
                responseData.materialDetails = response;
            } else {
                responseData.materialDetails = 'Material details not found';
            }
        } else {
            reqData.inquiryMaterialDetails.inquiryId = responseData.inquiryEntryDetails._id
            const response = new inquiryMaterialDetailsModel(reqData.inquiryMaterialDetails);
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
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getallInquiryDetails = async (req, res) => {
    try {
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
        let response = await inquiryDetailsModel
            .find(queryObject);

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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllInquiryMaterialDetailsByInquiryId = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = []
        if (reqId) {
            response = await inquiryMaterialDetailsModel
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
        console.log("error in Inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteInquiryDetailsById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await inquiryDetailsModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteInquiryMaterialDetailsById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await inquiryMaterialDetailsModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const sendInquiryToCompany = async (req, res) => {
    try {
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')

        if (reqData.inquiryId) {
            let inquiryMaterialList = await inquiryMaterialDetailsModel
                .find({ inquiryId: reqData.inquiryId, isDeleted: false })
                .populate({
                    path: 'rawMaterialId',
                    select: 'rmName rmUOM _id',
                })
                .populate({
                    path: 'packageMaterialId',
                    select: 'pmName pmUOM _id',
                });


            const tableRows = inquiryMaterialList && inquiryMaterialList.length > 0
                ? inquiryMaterialList.map(material => `
                <tr>
                    <td>${material.packageMaterialId ? material.packageMaterialId.pmName : material.rawMaterialId.rmName}</td>
                    <td>${material.packageMaterialId ? material.packageMaterialId.pmUOM : material.rawMaterialId.rmUOM}</td>
                    <td>${material.qty}</td>
                </tr>
            `).join('') : '';

            reqData.companies.forEach(async (company) => {

                let emaildata = {
                    toMail: company.email,
                    subject: "Purchase Order Confirmation",
                    fromMail: "zyden.itsolutions@gmail.com",
                    html: `
                        <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <style>
                                    body {
                                        margin: 0;
                                        padding: 0;
                                        background-color: #f4f7f9;
                                        font-family: Nunito Sans, sans-serif;
                                    }
    
                                    p {
                                        margin-top: 6px;
                                        margin-bottom: 2px !important;
                                    }
    
                                    .email-container {
                                        max-width: 800px;
                                        margin: auto;
                                        background-color: #ffffff;
                                        padding: 20px;
                                        border-radius: 8px;
                                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                    }
    
                                    .header {
                                        background-color: #e0f7fa;
                                        padding: 20px;
                                        border-radius: 8px;
                                        display: flex;
                                        justify-content: space-between !important;
                                        align-items: center !important;
                                    }
    
                                    .header img {
                                        max-width: 150px;
                                        height: auto;
                                    }
    
                                    .header .main-title {
                                        font-size: 24px;
                                        color: #00796b;
                                        font-weight: bold;
                                        text-align: right;
                                        margin: 0;
                                    }
    
                                    .content {
                                        padding: 5px;
                                        background-color: #ffffff;
                                        border-radius: 8px;
                                    }
    
                                    .content h1 {
                                        font-size: 16px;
                                        color: #00796b;
                                        margin-bottom: 10px;
                                        margin-top: 2px !important;
                                    }
    
                                    .content p {
                                        font-size: 16px;
                                        color: #333333;
                                        line-height: 1.5;
                                        margin-bottom: 15px;
                                    }
    
                                    .purchase-table table td {
                                        padding: 5px 10px;
                                        text-align: left;
                                        border: 1px solid #ddd;
                                    }
    
                                    .purchase-table table thead {
                                        background: linear-gradient(135deg, #1e3a8a, #77bfca);
                                    }
    
                                    .purchase-table table thead tr td {
                                        color: #ffffff;
                                        font-weight: 600;
                                    }
    
                                    table tbody tr td,
                                    table tbody tr td p {
                                        font-size: 14px !important;
                                        margin: 0;
                                    }
    
                                    .purchase-table table {
                                        width: 100%;
                                        border-collapse: collapse;
                                        table-layout: auto;
                                    }
    
                                    .footer {
                                        background-color: #b2dfdb;
                                        padding: 20px;
                                        border-radius: 8px;
                                        text-align: center;
                                        margin-top: 20px;
                                    }
    
                                    .footer .social-links a {
                                        margin: 0 10px;
                                        display: inline-block;
                                    }
    
                                    .footer .social-links img {
                                        width: 32px;
                                        height: 32px;
                                        vertical-align: middle;
                                    }
    
                                    .footer .site-link {
                                        font-size: 16px;
                                        font-weight: bold;
                                        color: #00796b;
                                        display: block;
                                        margin: 10px 0;
                                        /* text-decoration: none; */
                                    }
    
                                    .footer .small-print {
                                        font-size: 12px;
                                        color: #004d40;
                                        font-weight: 600;
                                    }
                                </style>
                            </head>
    
                            <body>
                                <div class="email-container">
                                    <!-- Header -->
                                    <div class="header">
                                        <img src="https://www.sanitashealthcare.in/Sanitash-logo.png" alt="Header Logo">
                                        <div class="main-title"></div>
                                    </div>
    
                                    <!-- Content -->
                                    <div class="content">
                                        <h4>Dear ${company.label},</h4>
                                        <p>I hope you're doing well. We are planning our next production cycle and would like to discuss the
                                            availability and pricing of the raw materials for this products :</p>
                                        <div class="purchase-table">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <td style="width: 40%;">Product Name</td>
                                                        <td style="width: 10%;">Unit</td>
                                                        <td style="width: 15%;">Quantity</td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${tableRows}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p>Looking forward to your response.</p>
                                        <p class="thank-you"><strong>Thank you!</strong></p>
                                        <p class="thank-you"><strong>SANITAS HEALTHCARE</strong></p>
                                    </div>
    
                                    <!-- Footer -->
                                    <div class="footer">
                                        <div class="social-links">
                                            <a href="https://www.facebook.com/people/Sanitas-Healthcare/100091492130628/" target="_blank"
                                                rel="noopener">
                                                <img src="https://www.sanitashealthcare.in/Facebook.png" alt="Facebook">
                                            </a>
                                            <a href="https://www.instagram.com/sanitashealthcare/?igsh=YTBycW5nc2lzd3Rl" target="_blank"
                                                rel="noopener">
                                                <img src="https://www.sanitashealthcare.in/instagram.png" alt="Instagram">
                                            </a>
                                        </div>
                                        <a href="https://www.sanitashealthcare.in/" target="_blank" rel="noopener" class="site-link">
                                            www.sanitashealthcare.in
                                        </a>
                                        <div class="small-print">
                                            &copy; 2022 Sanitas Healthcare. All rights are reserved.
                                        </div>
                                    </div>
                                </div>
                            </body>
    
                            </html>`,
                };
                mailsender(emaildata)

            });

            let reqeust = {
                status: 'Email Sent'
            }
            const response = await inquiryDetailsModel.findByIdAndUpdate(reqData.inquiryId, reqeust, { new: true });

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
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllGoodsRegistered = async (req, res) => {
    try {
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let queryObject = {
            isDeleted: false,
        };

        if (reqData.startDate && reqData.endDate) {
            queryObject.createdAt = { $gte: new Date(reqData.startDate), $lte: new Date(reqData.endDate) }
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
        let response = await grnEntryMaterialDetailsModel
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
                path: 'grnEntryPartyDetailId',
                select: 'partyId grnNo grnDate invoiceNo _id',
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });

        if (reqData.partyId && reqData.partyId.trim() !== '') {
            response = response.filter(item =>
                item.grnEntryPartyDetailId.partyId._id.toString() === reqData.partyId)
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllMaterialWisePurchaseReport = async (req, res) => {
    try {
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let queryObject = {
            isDeleted: false,
        };

        if (reqData.startDate && reqData.endDate) {
            queryObject.createdAt = { $gte: new Date(reqData.startDate), $lte: new Date(reqData.endDate) }
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

        let response = await purchaserOrderMaterialDetailsModel
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllItemsForStockLedgerReport = async (req, res) => {
    try {
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let queryObject = {
            isDeleted: false,
        };

        if (reqData.endingDate) {
            queryObject.createdAt = { $lte: new Date(reqData.endingDate) }
        }

        if (reqData.materialType === 'Raw Material') {
            queryObject.rawMaterialId = { $exists: true, $ne: null };
            queryObject.packageMaterialId = null;
        }

        if (reqData.materialType === 'Packing Material') {
            queryObject.packageMaterialId = { $exists: true, $ne: null };
            queryObject.rawMaterialId = null;
        }
        let response = await grnEntryMaterialDetailsModel
            .find(queryObject)
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

        console.log("response", response)
        console.log("reqData.materialType", reqData.categoryName)
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllStatementForPurchaseItemByItemId = async (req, res) => {
    try {
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

        let response = await grnEntryMaterialDetailsModel
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllShourtageReport = async (req, res) => {
    try {
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

        let response = await grnEntryMaterialDetailsModel
            .find(queryObject)
            .populate({
                path: 'rawMaterialId',
                select: 'rmName rmUOM minQty rmCategory _id',
            })
            .populate({
                path: 'packageMaterialId',
                select: 'pmName pmUOM pmMinQty pmCategory _id',
            });

        const combinedItems = response.reduce((acc, row) => {
            const key = reqData.materialType === 'Raw Material'
                ? row.rawMaterialId?.rmName
                : row.packageMaterialId?.pmName;

            if (key) {
                if (!acc[key]) {
                    acc[key] = {
                        ...row,
                        qty: row.qty || 0,
                    };
                } else {
                    acc[key].qty += row.qty || 0;
                }
            }

            return acc;
        }, {});

        const Data = Object.values(combinedItems);

        const processedData = Data.filter(item => {
            if (reqData.materialType === 'Raw Material') {
                return item.qty < (item._doc.rawMaterialId?.minQty || 0);
            } else {
                return item.qty < (item._doc.packageMaterialId?.pmMinQty || 0);
            }
        });

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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllNearExpiryReport = async (req, res) => {
    try {
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

        let response = await grnEntryMaterialDetailsModel
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

        const responseWithDayDifference = response.map(item => {
            const expDate = item.expDate;
            const dayDifference = expDate
                ? Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))
                : null;
            return { ...item.toObject(), dayDifference };
        })
            .filter(item => item.dayDifference !== null && item.dayDifference >= 0 && item.dayDifference <= reqData.days);

        let encryptData = encryptionAPI(responseWithDayDifference, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Details fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllPurchaseOrderRegister = async (req, res) => {
    try {
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let queryObject = {
            isDeleted: false,
            purchaseOrderId: { $exists: true, $ne: null },
        };

        if (reqData.startDate && reqData.endDate) {
            queryObject.createdAt = { $gte: new Date(reqData.startDate), $lte: new Date(reqData.endDate) }
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
            status.push('Order Approved');
        } else {
            status.push('Order Created', 'Email Sent', 'Order Approved');
        }

        let response = await purchaserOrderMaterialDetailsModel
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
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
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
    getAllPurchaseOrderRegister
};