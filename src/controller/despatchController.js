import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import batchWiseProductStockModel from "../model/Despatch/batchWiseProductStockModel.js";
import gstInvoiceFinishGoodsModel from "../model/Despatch/gstInvoiceFinishGoods.js";
import gstInvoiceFinishGoodsItemsModel from "../model/Despatch/gstInvoiceFinishGoodsItems.js";
import batchClearingEntryModel from "../model/ProductionModels/batchClearingEntryModel.js";
import errorHandler from "../server/errorHandle.js";
import path from "path";
import fs from 'fs'
import puppeteer from "puppeteer";
import dayjs from "dayjs";
import { fileURLToPath } from "node:url";
import HNSCodesScHema from "../model/hnsCode.js";
import { showHSNCodes } from "../utils/hsnCodeCountTable.js";
import gstInvoiceRMModel from "../model/Despatch/gstInvoiceRMModel.js";
import ProductionRequisitionRMFormulaModel from "../model/InventoryModels/productionRequisitionRMFormulaModel.js";
import grnEntryMaterialDetailsModel from "../model/InventoryModels/grnEntryMaterialDetailsModel.js";
import gstinvoiceRMItemModel from "../model/Despatch/gstInvoiceRMItemsModel.js";
import InvoiceRMStockModel from "../model/Despatch/InvoiceRMStockModel.js";
import PackingRequisitionPMFormulaModel from "../model/InventoryModels/packingRequisitionPMFormulaModel.js";
import InvoicePMStockModel from "../model/Despatch/invoicePMStockModel.js";
import gstInvoicePMModel from "../model/Despatch/gstInvoicePMModel.js";
import gstInvoicePMItemModel from "../model/Despatch/gstInvoicePMItemsModel.js";
import orderDetailsSalesOrderEntryModel from "../model/Despatch/orderDetailsSalesOrderEntryModel.js";
import orderDetailsSalesOrderItemMappingModel from "../model/Despatch/orderDetailsSalesOrderItemMappingModel.js";
import salesGoodsReturnEntryModel from "../model/Despatch/salesGoodsReturnEntryModel.js";
import salesGoodsReturnItemsModel from "../model/Despatch/salesGoodsReturnItems.js";
import mongoose from "mongoose";
import partyModel from "../model/partiesModel.js";
import inwardPostModel from "../model/Despatch/inwardPostEntry.js";
import paymentReceiptEntryModel from "../model/Account/paymentReceiptEntryModel.js";
import { populate } from "dotenv";
import outwardPostModel from "../model/Despatch/outwardPostEntry.js";
import companyGroupModel from "../model/companyGroup.js";
import mailsender from "../utils/sendingEmail.js";
import emailTemplateModel from "../model/emailTemplateModel.js";
import { FromMail } from "../middleware/appSetting.js";
import additionalEntryMaterialDetailsModel from "../model/InventoryModels/additionalEntryMaterialDetailsModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GST Invoice Finish Goods

const getProductionStockByProductId = async (req, res) => {
    try {
        const { id } = req.query;

        let reqId = getRequestData(id)

        let queryObject = {
            isDeleted: false,
            packingItemId: reqId
        };

        let batchClrModel = await batchClearingEntryModel()
        let batchClearingData = await batchClrModel
            .find(queryObject)
            .populate({
                path: "productDetialsId",
                select: "productionNo productId batchNo packing batchSize mfgDate expDate",
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            })
            .populate({
                path: "packingItemId",
                select: "HSNCode",
            });

        const totalStock = batchClearingData.map(item => ({
            productionNo: item?.productDetialsId?.productionNo,
            batchClearingEntryId: item._id,
            productId: item?.packingItemId?._id,
            batchNo: item?.productDetialsId?.batchNo,
            expDate: item?.productDetialsId?.expDate,
            mfgDate: item?.productDetialsId?.mfgDate,
            quantity: item.quantity,
            mrp: item.mrp,
            hsnCode: item?.packingItemId?.HSNCode,
            isFromOpeningStock: item?.isFromOpeningStock,
        }));

        for (let stockItem of totalStock) {
            let batchwiseProdStkModel = await batchWiseProductStockModel()
            if (stockItem.isFromOpeningStock !== true && stockItem?.batchClearingEntryId !== null && stockItem?.batchClearingEntryId !== undefined && stockItem?.batchClearingEntryId !== '' && stockItem?.batchNo !== null && stockItem?.batchNo !== undefined && stockItem?.batchNo !== '' && stockItem?.productId !== null && stockItem?.productId !== undefined && stockItem?.productId !== '') {
                const existingStock = await batchwiseProdStkModel.findOne({
                    batchNo: stockItem?.batchNo,
                    batchClearingEntryId: stockItem?.batchClearingEntryId,
                    productId: stockItem?.productId,
                });
                if (!existingStock) {
                    let batchwiseProdStkModel = await batchWiseProductStockModel()
                    await batchwiseProdStkModel.create(stockItem);
                }
            }
        }

        let batchwiseProdStkModel = await batchWiseProductStockModel()
        let response = await batchwiseProdStkModel.find({
            productId: reqId,
            // quantity: { $gt: 0 }
        })
            .sort({ updatedAt: -1 });


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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const getGSTInvoiceFinishGoodsInvoiceNo = async (req, res) => {
    try {
        let response = {}
        let gifgModel = await gstInvoiceFinishGoodsModel();
        let gstNoRecord = await gifgModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select('invoiceNo');

        if (gstNoRecord && gstNoRecord.invoiceNo) {
            let lastNumber = parseInt(gstNoRecord.invoiceNo.replace('SI', ''), 10);
            let newNumber = lastNumber + 1;

            response.invoiceNo = `SI${newNumber.toString().padStart(3, '0')}`;
        } else {
            response.invoiceNo = 'SI001';
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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const addEditGSTInvoiceFinishGoods = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let responseData = {}
        if (data.invoiceDetails.gstInvoiceFinishGoodsId && data.invoiceDetails.gstInvoiceFinishGoodsId.trim() !== '') {
            // Add Edit For Invoice Details
            let gifgModel = await gstInvoiceFinishGoodsModel();
            const response = await gifgModel.findByIdAndUpdate(data.invoiceDetails.gstInvoiceFinishGoodsId, data.invoiceDetails, { new: true });
            if (!response) {
                responseData.invoiceDetails = 'Party details not found';
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Invoice Details Not found",
                        responseData: encryptData,
                        isEnType: true,
                    },
                });
            }


            // Stock Updating
            try {
                await Promise.all(data.itemListing.map(async (item) => {
                    const totalReduceQty = (Number(item.qty) || 0) + (Number(item.free) || 0);

                    let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
                    const existingItemDetails = await gifinishGoodsITemModel.findOne({ _id: item._id, isDeleted: false });

                    if (existingItemDetails) {
                        const existingQty = (Number(existingItemDetails.qty) || 0) + (Number(existingItemDetails.free) || 0);
                        const updatedQty = existingQty - totalReduceQty;
                        console.log(existingQty, totalReduceQty)
                        console.log(updatedQty)
                        let batchwiseProdStkModel = await batchWiseProductStockModel()
                        await batchwiseProdStkModel.findByIdAndUpdate(
                            item.stockId,
                            { $inc: { quantity: updatedQty } },
                            { new: true }
                        );
                    } else {
                        let batchwiseProdStkModel = await batchWiseProductStockModel()
                        await batchwiseProdStkModel.findByIdAndUpdate(
                            item.stockId,
                            { $inc: { quantity: -totalReduceQty } },
                            { new: true }
                        );
                    }
                }));

                // Payment Receipt Entry
                let request = {
                    voucherNo: data.invoiceDetails.invoiceNo,
                    date: data.invoiceDetails.invoiceDate,
                    partyId: data.invoiceDetails.partyId,
                    debitAmount: data.invoiceDetails.grandTotal,
                    narration1: `INVOICE NO : ${data.invoiceDetails.invoiceNo}`,
                }

                let prEntryModel = await paymentReceiptEntryModel();
                await prEntryModel.findOneAndUpdate(
                    { gstInvoiceFinishGoodsId: data.invoiceDetails.gstInvoiceFinishGoodsId },
                    request,
                    { new: true }
                );

                // After Stock Updating, proceed with Invoice Item Details
                let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
                await gifinishGoodsITemModel.deleteMany({ gstInvoiceFinishGoodsId: response._id });

                const items = data.itemListing.map(item => ({
                    ...item,
                    gstInvoiceFinishGoodsId: response._id
                }));

                let gifinishGoodsITemModel1 = await gstInvoiceFinishGoodsItemsModel()
                await gifinishGoodsITemModel1.insertMany(items);

                responseData.invoiceDetails = response;
                let encryptData = encryptionAPI(responseData, 1);

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Invoice Details Updated Successfully",
                        responseData: encryptData,
                        isEnType: true,
                    },
                });

            } catch (error) {
                console.log("Error in Despatch controller", error);
                errorHandler(error, req, res, "Error in Despatch controller")
            }

        } else {
            // Add Edit For Invoice Details
            let gifgModel = await gstInvoiceFinishGoodsModel();
            const response = new gifgModel(data.invoiceDetails);
            await response.save();

            responseData.invoiceDetails = response;

            // Dhruvi
            const items = data.itemListing.map(item => {
                const newItem = { ...item, gstInvoiceFinishGoodsId: response._id };
                delete newItem._id; // Properly deleting _id
                return newItem;
            });

            // Add Edit For Invoice Item Details
            let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
            await gifinishGoodsITemModel.insertMany(items);

            let encryptData = encryptionAPI(responseData, 1);

            res.status(200).json({
                data: {

                    statusCode: 200,
                    Message: "Invoice Details Inserted Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });

            // Payment Receipt Entry
            let request = {
                voucherNo: data.invoiceDetails.invoiceNo,
                bankName: 'SALES',
                date: data.invoiceDetails.invoiceDate,
                partyId: data.invoiceDetails.partyId,
                partyBankNameOrPayto: '-',
                chqNo: '-',
                debitAmount: data.invoiceDetails.grandTotal,
                creditAmount: 0,
                narration1: `INVOICE NO : ${data.invoiceDetails.invoiceNo}`,
                narration2: '',
                narration3: '',
                entryType: 'Receipt',
                from: 'GSTInvoiceFinishGoods',
                gstInvoiceFinishGoodsId: response._id,
            }
            let prEntryModel = await paymentReceiptEntryModel();
            let paymentEntry = new prEntryModel(request);
            await paymentEntry.save();


            // Stock Updating
            for (let item of data.itemListing) {
                let totalReduceQty = (Number(item.qty) || 0) + (Number(item.free) || 0)
                let batchwiseProdStkModel = await batchWiseProductStockModel()
                await batchwiseProdStkModel.findByIdAndUpdate(
                    item.stockId,
                    { $inc: { quantity: -totalReduceQty } },
                    { new: true });
            }
        }

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const getAllGSTInvoiceFinishGoodsRecords = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }

        let sortBy = 'invoiceNo'

        if (data.invoiceNo && data.invoiceNo.trim() !== "") {
            queryObject.invoiceNo = { $regex: `^${data.invoiceNo}`, $options: "i" };
        }

        if (data.arrangedBy && data.arrangedBy.trim() !== "") {
            sortBy = data.arrangedBy;
        }

        let response = []
        let gifgModel = await gstInvoiceFinishGoodsModel();
        response = await gifgModel
            .find(queryObject)
            .sort(sortBy)
            .populate({
                path: 'partyId',
                select: 'partyName',
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });

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
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

const getGSTInvoiceFinishGoodsById = async (req, res) => {
    try {
        const { id } = req.query;

        let reqId = getRequestData(id)

        let gifgModel = await gstInvoiceFinishGoodsModel();
        let invoiceDetails = await gifgModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: "partyId",
                select: "partyName state",
            })
            .populate({
                path: "transportId",
                select: "transportName",
            });

        let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
        let itemListing = await gifinishGoodsITemModel
            .find({ gstInvoiceFinishGoodsId: reqId, isDeleted: false });

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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const deleteItemFromDBById = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        // Stock Updating
        let totalReduceQty = (Number(data.qty) || 0) + (Number(data.free) || 0)
        let batchwiseProdStkModel = await batchWiseProductStockModel()
        await batchwiseProdStkModel.findByIdAndUpdate(
            data.stockId,
            { $inc: { quantity: +totalReduceQty } },
            { new: true });

        // Removing Particualr Item From GST Invoice
        let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
        let response = await gifinishGoodsITemModel.findByIdAndUpdate(data.gstInvoiceBatchId, { isDeleted: true })


        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Item Deleted successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const deleteInvoiceById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)

        let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
        let itemList = await gifinishGoodsITemModel.find({ gstInvoiceFinishGoodsId: reqId, isDeleted: false })

        itemList.map(async item => {
            // Stock Updating
            let totalReduceQty = (Number(item.qty) || 0) + (Number(item.free) || 0)
            let batchwiseProdStkModel = await batchWiseProductStockModel()
            await batchwiseProdStkModel.findByIdAndUpdate(
                item.stockId,
                { $inc: { quantity: +totalReduceQty } },
                { new: true });

            // Removing Particualr Item From GST Invoice
            await gifinishGoodsITemModel.findByIdAndUpdate(item._id, { isDeleted: true })
        })

        // Payment Receipt Entry
        let prEntryModel = await paymentReceiptEntryModel();
        await prEntryModel.findOneAndUpdate({ gstInvoiceFinishGoodsId: reqId }, { isDeleted: true }, { new: true });

        // Removing GST Invoice Finish Goods Record
        let gifgModel = await gstInvoiceFinishGoodsModel();
        let response = await gifgModel.findByIdAndUpdate(reqId, { isDeleted: true })

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Invoice Details Deleted Successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const generateGSTInvoiceForFinishGoodsById = async (req, res) => {
    try {

        const { id, id1 } = req.query;
        let reqId = getRequestData(id)
        let isDeliveryChallanNeed = id1 ? getRequestData(id1) : false

        let cgModel = await companyGroupModel()
        let companyDetails = await cgModel.findOne({});
        let adminAddress = companyDetails.addressLine1 + ' '
            + companyDetails.addressLine2 + ' '
            + companyDetails.addressLine3 + ' '
            + companyDetails.pinCode + '(' + companyDetails.state + ')'

        let gifgModel = await gstInvoiceFinishGoodsModel();
        let invoiceDetails = await gifgModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: 'partyId',
                select: 'partyName address1 address2 address3 address4 corrspAddress1 corrspAddress2 corrspAddress3 corrspAddress4 state pinCode gstnNo mobileNo1 mobileNo2 crdays person dlNo1 dlNo2 fssaiNo bankName city',
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });

        let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
        let itemListing = await gifinishGoodsITemModel
            .find({ gstInvoiceFinishGoodsId: reqId, isDeleted: false });

        let recipientAddress = invoiceDetails.partyId.address1 + ' '
            + invoiceDetails.partyId.address2 + ' '
            + invoiceDetails.partyId.address3 + ' '
            + invoiceDetails.partyId.address4 + '-'
            + invoiceDetails.partyId.pinCode

        let shippedToAddress = (invoiceDetails.partyId.corrspAddress1 !== '' ? invoiceDetails.partyId.corrspAddress1 : invoiceDetails.partyId.address1) + ' ' +
            (invoiceDetails.partyId.corrspAddress2 !== '' ? invoiceDetails.partyId.corrspAddress2 : invoiceDetails.partyId.address2) + ' ' +
            (invoiceDetails.partyId.corrspAddress3 !== '' ? invoiceDetails.partyId.corrspAddress3 : invoiceDetails.partyId.address3) + ' ' +
            (invoiceDetails.partyId.corrspAddress4 !== '' ? invoiceDetails.partyId.corrspAddress4 : invoiceDetails.partyId.address4) + '-' +
            invoiceDetails.partyId.pinCode

        let mobileNo = invoiceDetails.partyId.mobileNo1 + (invoiceDetails.partyId.mobileNo2 !== '' ? ',' + invoiceDetails.partyId.mobileNo2 : '')

        const itemListingTotalCalculation = itemListing.reduce((acc, item) => {
            acc.amount += Number(item.amount);
            acc.discAmount += Number(item.discAmount);
            acc.taxableAmount += Number(item.taxableAmount);
            return acc;
        }, { amount: 0, discAmount: 0, taxableAmount: 0 });

        const itemListingRows = itemListing && itemListing.length > 0
            ? itemListing.map(item => `
                <tr>
                    <td class="border border-x border-y-0 border-l-0 border-t-[0px] px-[4px] py-[2px] text-[12px] text-start">${item.itemName}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.packing ? item.packing : '-'}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.hsnCodeName}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.batchNo ? item.batchNo : '-'}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.mfgDate ? dayjs(item.mfgDate).format('MM-YYYY') : '-'}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.expDate ? dayjs(item.expDate).format('MM-YYYY') : '-'}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${Number(item.mrp).toFixed(2)}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.qty}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.free}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${Number(item.rate).toFixed(2)}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${Number(item.amount).toFixed(2)}</td>
                    <td class="border border-x border-y-0 border-r-0 border-t-[0px] px-[4px] py-[2px] text-right">${Number(item.taxableAmount).toFixed(2)}</td>
                </tr>
            `).join('')
            : '';

        const deliveryChallanRowLsting = itemListing && itemListing.length > 0
            ? itemListing.map(item => `
                <tr>
                    <td class="text-start px-[5px] py-[2px]">${item.itemName}</td>
                    <td class="text-center px-[5px] py-[2px]">${item.packing ? item.packing : '-'}</td>
                    <td class="text-center px-[5px] py-[2px]">${item.batchNo ? item.batchNo : ''}</td>
                    <td class="text-center px-[5px] py-[2px]">${item.mfgDate ? dayjs(item.mfgDate).format('MM-YYYY') : ''}</td>
                    <td class="text-center px-[5px] py-[2px]">${item.expDate ? dayjs(item.expDate).format('MM-YYYY') : ''}</td>
                    <td class="text-end px-[5px] py-[2px]">${item.qty}</td>
                </tr>
            `).join('')
            : '';

        let hcModel = await HNSCodesScHema()
        let hsnCodeList = await hcModel.find({});

        let hsnCodeListForTable = showHSNCodes(itemListing, hsnCodeList, invoiceDetails.partyId.state)
        const hsnCodeTotalCalculation = hsnCodeListForTable.reduce(
            (acc, item) => {
                acc.taxableAmount += Number(item.taxableAmount);
                acc.sgstAmount += Number(item.sgstAmount);
                acc.cgstAmount += Number(item.cgstAmount);
                acc.igstAmount += Number(item.igstAmount);
                acc.totalAmount += Number(item.totalAmount);
                return acc;
            },
            { taxableAmount: 0, sgstAmount: 0, cgstAmount: 0, igstAmount: 0, totalAmount: 0 }
        );
        const hsnCodeTableRows = hsnCodeListForTable && hsnCodeListForTable.length > 0
            ? hsnCodeListForTable.map(item => `
                <tr>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x border-l-0">${item.HSNCode}</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.taxableAmount}</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.SGST}%</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.sgstAmount}</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.CGST}%</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.cgstAmount}</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.IGST}%</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.igstAmount}</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x border-r-0">${item.totalAmount}</td>
                </tr>
            `).join('')
            : '';


        let date = new Date(invoiceDetails.invoiceDate);
        date.setDate(date.getDate() + invoiceDetails.creditDay);
        let dueDate = date.toDateString()

        let htmlTemplate = fs.readFileSync(path.join(__dirname, "..", "..", "uploads", "InvoiceTemplates", "gstInvoiceFinishGoodsTemplate.html"), "utf8");
        let deliveryChallanTemplate = fs.readFileSync(path.join(__dirname, "..", "..", "uploads", "InvoiceTemplates", "deliveryChallanTemplate.html"), "utf8");

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
                .replace('#TransportName', invoiceDetails.transportId.transportName)
                .replace('#Cases', invoiceDetails.cases)
                .replace('#Destination', invoiceDetails.partyId.city)
                .replace('#Weight', invoiceDetails.weight)
                .replace('#LRNo', invoiceDetails.lRNo)
                .replace('#LRDate', invoiceDetails.lRDate ? dayjs(invoiceDetails.lRDate).format("DD-MM-YYYY") : '')
                .replace('#RDPermitNo', '-')
                .replace('#InvoiceNo', invoiceDetails.invoiceNo)
                .replace('#InvoiceDate', dayjs(invoiceDetails.invoiceDate).format("DD-MM-YYYY"))
                .replace('#DueDate', dayjs(dueDate).format("DD-MM-YYYY"))
                .replace('#ItemListingRows', itemListingRows)
                .replace('#SubTotalAmount', invoiceDetails.subTotal ? invoiceDetails.subTotal : 0)
                .replace('#DisCountAmount', invoiceDetails.discount ? invoiceDetails.discount : 0)
                .replace('#SGSTAmount', invoiceDetails.sgst ? invoiceDetails.sgst : 0)
                .replace('#CGSTAmount', invoiceDetails.cgst ? invoiceDetails.cgst : 0)
                .replace('#IGSTAmount', invoiceDetails.igst ? invoiceDetails.igst : 0)
                .replace('#CRDRNote', invoiceDetails.crDrNote ? invoiceDetails.crDrNote : 0)
                .replace('#Freight', invoiceDetails.freight && invoiceDetails.freight > 0 ? invoiceDetails.freight : 0)
                .replace('#OtherCharges', invoiceDetails.other && invoiceDetails.other > 0 ? invoiceDetails.other : 0)
                .replace('#RoundOffAmount', invoiceDetails.roundOff ? invoiceDetails.roundOff : 0)
                .replace('#GrandTotal', invoiceDetails.grandTotal ? invoiceDetails.grandTotal : 0)
                .replace('#HSNCodeTableRows', hsnCodeTableRows)
                .replace('#TotalSalesAmount', itemListingTotalCalculation.amount)
                .replace('#TotalDisAmount', itemListingTotalCalculation.discAmount)
                .replace('#TotalTaxableAmount', itemListingTotalCalculation.taxableAmount)
                .replace('#TaxableAmountTotal', hsnCodeTotalCalculation.taxableAmount)
                .replace('#SGSTTotalAmount', hsnCodeTotalCalculation.sgstAmount)
                .replace('#CGSTTotalAmount', hsnCodeTotalCalculation.cgstAmount)
                .replace('#IGSTTotalAmount', hsnCodeTotalCalculation.igstAmount)
                .replace('#TotalGSTCalculation', hsnCodeTotalCalculation.totalAmount)
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

        const generateDeliveryChallanPage = () => {
            return deliveryChallanTemplate.replace('#InvoiceNo', invoiceDetails.invoiceNo)
                .replace('#InvoiceDate', dayjs(invoiceDetails.invoiceDate).format("DD-MM-YYYY"))
                .replace('#DeliveryChallanRowLsting', deliveryChallanRowLsting)
                .replaceAll('#AdminCompanyName', companyDetails.CompanyName)
                .replace('#AdminAddress', adminAddress)
                .replace('#AdminEmail', companyDetails.email)
                .replace('#CompanyLocation', companyDetails.location)
                .replace('#AdminMobile', companyDetails.mobile);
        };

        htmlTemplate = `
                <div class="empty-page">${generatePage("Original for Recipient")}</div>
                <div class="page-break"></div>
                
                <div class="empty-page">${generatePage("Duplicate for Transporter")}</div>
                <div class="page-break"></div>
                
                <div class="empty-page">${generatePage("Triplicate for Supplier")}</div>
                <div class="page-break"></div>
                
                ${(isDeliveryChallanNeed === true || isDeliveryChallanNeed === "true") ? `
                    <div class="empty-page">${generateDeliveryChallanPage()}</div>
                    <div class="page-break"></div>
                ` : ""}
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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const sendGSTInvoiceFinishGoodsToClient = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)

        let cgModel = await companyGroupModel()
        let companyDetails = await cgModel.findOne({});
        let adminAddress = companyDetails.addressLine1 + ' '
            + companyDetails.addressLine2 + ' '
            + companyDetails.addressLine3 + ' '
            + companyDetails.pinCode + '(' + companyDetails.state + ')'

        let gifgModel = await gstInvoiceFinishGoodsModel();
        let invoiceDetails = await gifgModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: 'partyId',
                select: 'email partyName address1 address2 address3 address4 corrspAddress1 corrspAddress2 corrspAddress3 corrspAddress4 state pinCode gstnNo mobileNo1 mobileNo2 crdays person dlNo1 dlNo2 fssaiNo bankName city',
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });
        if (invoiceDetails.partyId.email && invoiceDetails.partyId.email !== '') {
            let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
            let itemListing = await gifinishGoodsITemModel
                .find({ gstInvoiceFinishGoodsId: reqId, isDeleted: false });

            let recipientAddress = invoiceDetails.partyId.address1 + ' '
                + invoiceDetails.partyId.address2 + ' '
                + invoiceDetails.partyId.address3 + ' '
                + invoiceDetails.partyId.address4 + '-'
                + invoiceDetails.partyId.pinCode

            let shippedToAddress = (invoiceDetails.partyId.corrspAddress1 !== '' ? invoiceDetails.partyId.corrspAddress1 : invoiceDetails.partyId.address1) + ' ' +
                (invoiceDetails.partyId.corrspAddress2 !== '' ? invoiceDetails.partyId.corrspAddress2 : invoiceDetails.partyId.address2) + ' ' +
                (invoiceDetails.partyId.corrspAddress3 !== '' ? invoiceDetails.partyId.corrspAddress3 : invoiceDetails.partyId.address3) + ' ' +
                (invoiceDetails.partyId.corrspAddress4 !== '' ? invoiceDetails.partyId.corrspAddress4 : invoiceDetails.partyId.address4) + '-' +
                invoiceDetails.partyId.pinCode

            let mobileNo = invoiceDetails.partyId.mobileNo1 + (invoiceDetails.partyId.mobileNo2 !== '' ? ',' + invoiceDetails.partyId.mobileNo2 : '')

            const itemListingTotalCalculation = itemListing.reduce((acc, item) => {
                acc.amount += Number(item.amount);
                acc.discAmount += Number(item.discAmount);
                acc.taxableAmount += Number(item.taxableAmount);
                return acc;
            }, { amount: 0, discAmount: 0, taxableAmount: 0 });

            const itemListingRows = itemListing && itemListing.length > 0
                ? itemListing.map(item => `
                <tr>
                    <td class="border border-x border-y-0 border-l-0 border-t-[0px] px-[4px] py-[2px] text-[12px] text-start">${item.itemName}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.packing ? item.packing : '-'}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.hsnCodeName}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.batchNo ? item.batchNo : ''}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.mfgDate ? dayjs(item.mfgDate).format('MM-YYYY') : ''}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.expDate ? dayjs(item.expDate).format('MM-YYYY') : ''}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${Number(item.mrp).toFixed(2)}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.qty}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${item.free}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${Number(item.rate).toFixed(2)}</td>
                    <td class="border border-x border-y-0 border-t-[0px] px-[4px] py-[2px] text-start">${Number(item.amount).toFixed(2)}</td>
                    <td class="border border-x border-y-0 border-r-0 border-t-[0px] px-[4px] py-[2px] text-right">${Number(item.taxableAmount).toFixed(2)}</td>
                </tr>
            `).join('')
                : '';

            let hcModel = await HNSCodesScHema()
            let hsnCodeList = await hcModel.find({});


            let hsnCodeListForTable = showHSNCodes(itemListing, hsnCodeList, invoiceDetails.partyId.state)
            const hsnCodeTotalCalculation = hsnCodeListForTable.reduce(
                (acc, item) => {
                    acc.taxableAmount += Number(item.taxableAmount);
                    acc.sgstAmount += Number(item.sgstAmount);
                    acc.cgstAmount += Number(item.cgstAmount);
                    acc.igstAmount += Number(item.igstAmount);
                    acc.totalAmount += Number(item.totalAmount);
                    return acc;
                },
                { taxableAmount: 0, sgstAmount: 0, cgstAmount: 0, igstAmount: 0, totalAmount: 0 }
            );


            const hsnCodeTableRows = hsnCodeListForTable && hsnCodeListForTable.length > 0
                ? hsnCodeListForTable.map(item => `
                <tr>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x border-l-0">${item.HSNCode}</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.taxableAmount}</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.SGST}%</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.sgstAmount}</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.CGST}%</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.cgstAmount}</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.IGST}%</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.igstAmount}</td>
                    <td class="px-[3px] border-gray-400 border border-y-0 border-x border-r-0">${item.totalAmount}</td>
                </tr>
            `).join('')
                : '';


            let date = new Date(invoiceDetails.invoiceDate);
            date.setDate(date.getDate() + invoiceDetails.creditDay);
            let dueDate = date.toDateString()

            let htmlTemplate = fs.readFileSync(path.join(__dirname, "..", "..", "uploads", "InvoiceTemplates", "gstInvoiceFinishGoodsTemplate.html"), "utf8");

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
                    .replace('#TransportName', invoiceDetails.transportId.transportName)
                    .replace('#Cases', invoiceDetails.cases)
                    .replace('#Destination', invoiceDetails.partyId.city)
                    .replace('#Weight', invoiceDetails.weight)
                    .replace('#LRNo', invoiceDetails.lRNo)
                    .replace('#LRDate', invoiceDetails.lRDate ? dayjs(invoiceDetails.lRDate).format("DD-MM-YYYY") : '')
                    .replace('#RDPermitNo', '-')
                    .replace('#InvoiceNo', invoiceDetails.invoiceNo)
                    .replace('#InvoiceDate', dayjs(invoiceDetails.invoiceDate).format("DD-MM-YYYY"))
                    .replace('#DueDate', dayjs(dueDate).format("DD-MM-YYYY"))
                    .replace('#ItemListingRows', itemListingRows)
                    .replace('#SubTotalAmount', invoiceDetails.subTotal ? invoiceDetails.subTotal : 0)
                    .replace('#DisCountAmount', invoiceDetails.discount ? invoiceDetails.discount : 0)
                    .replace('#SGSTAmount', invoiceDetails.sgst ? invoiceDetails.sgst : 0)
                    .replace('#CGSTAmount', invoiceDetails.cgst ? invoiceDetails.cgst : 0)
                    .replace('#IGSTAmount', invoiceDetails.igst ? invoiceDetails.igst : 0)
                    .replace('#CRDRNote', invoiceDetails.crDrNote ? invoiceDetails.crDrNote : 0)
                    .replace('#Freight', invoiceDetails.freight && invoiceDetails.freight > 0 ? invoiceDetails.freight : 0)
                    .replace('#OtherCharges', invoiceDetails.other && invoiceDetails.other > 0 ? invoiceDetails.other : 0)
                    .replace('#RoundOffAmount', invoiceDetails.roundOff ? invoiceDetails.roundOff : 0)
                    .replace('#GrandTotal', invoiceDetails.grandTotal ? invoiceDetails.grandTotal : 0)
                    .replace('#HSNCodeTableRows', hsnCodeTableRows)
                    .replace('#TotalSalesAmount', itemListingTotalCalculation.amount)
                    .replace('#TotalDisAmount', itemListingTotalCalculation.discAmount)
                    .replace('#TotalTaxableAmount', itemListingTotalCalculation.taxableAmount)
                    .replace('#TaxableAmountTotal', hsnCodeTotalCalculation.taxableAmount)
                    .replace('#SGSTTotalAmount', hsnCodeTotalCalculation.sgstAmount)
                    .replace('#CGSTTotalAmount', hsnCodeTotalCalculation.cgstAmount)
                    .replace('#IGSTTotalAmount', hsnCodeTotalCalculation.igstAmount)
                    .replace('#TotalGSTCalculation', hsnCodeTotalCalculation.totalAmount)
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
                `;

            const browser = await puppeteer.launch({
                headless: "new",
                args: ["--no-sandbox", "--disable-setuid-sandbox"]
            });
            const page = await browser.newPage();

            await page.setContent(htmlTemplate, { waitUntil: "load" });

            const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

            await browser.close();

            let etModel = await emailTemplateModel()
            const EmailTemplate = await etModel.findOne({ emailTemplateId: 3 });

            let html = EmailTemplate.description.replace('#CompanyName', invoiceDetails.partyId.partyName);

            let emaildata = {
                toMail: invoiceDetails.partyId.email,
                subject: EmailTemplate.emailSubject,
                fromMail: FromMail,
                html: html,
                filename: 'GSTInvoiceFinishGoods',
                pdfBuffer: pdfBuffer,
                contentType: "application/pdf"
            };

            mailsender(emaildata)

            let encryptData = encryptionAPI(invoiceDetails, 1);

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Mail Sent Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        } else {
            let encryptData = encryptionAPI(invoiceDetails, 1);
            res.status(200).json({
                data: {
                    statusCode: 404,
                    Message: "Email is not available for this company",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

// GST Invoice RM

const getGSTInvoiceRMInvoice = async (req, res) => {
    try {
        let response = {}
        let girModel = await gstInvoiceRMModel();
        let gstNoRecord = await girModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select('invoiceNo');

        if (gstNoRecord && gstNoRecord.invoiceNo) {
            let lastNumber = parseInt(gstNoRecord.invoiceNo.replace('RM', ''), 10);
            let newNumber = lastNumber + 1;

            response.invoiceNo = `RM${newNumber.toString().padStart(4, '0')}`;
        } else {
            response.invoiceNo = 'RM0001';
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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const getrawMaterialStockByRMId = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let queryObject = {
            isDeleted: false,
            rawMaterialId: data.id
        };

        // From GRN Entry
        let gemDetailsModel = await grnEntryMaterialDetailsModel();
        const rawMaterialData = await gemDetailsModel
            .find(queryObject)
            .populate({
                path: 'rawMaterialId',
                select: 'rmName rmCategory _id',
            })
            .populate({
                path: 'grnEntryPartyDetailId',
                select: 'partyId grnNo grnDate invoiceNo _id',
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });

        const totalPurchaseQty = rawMaterialData.reduce((sum, item) => sum + item.qty, 0);

        // From Production Used Qty
        let prRMFormulaModel = await ProductionRequisitionRMFormulaModel();
        const responseFromUsedQty = await prRMFormulaModel
            .find({ rmName: data.rmName, isDeleted: false })
            .populate({
                path: 'productDetialsId',
                select: 'partyId productionNo productionPlanningDate batchNo _id',
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });

        const totalUsedQtyInProduction = responseFromUsedQty.reduce((sum, item) => sum + item.netQty, 0);

        // From Invoice Used Qty
        let iRMStock = await InvoiceRMStockModel();
        const responseFromUsedQtyGSTInvoice = await iRMStock.find({ rmId: data.id, isDeleted: false });

        const totalUsedQtyInGSTInvoice = responseFromUsedQtyGSTInvoice.reduce((sum, item) => sum + item.qty, 0);

        let isFromGSTInvoiceRecord = false

        if (responseFromUsedQtyGSTInvoice.length > 0 && totalUsedQtyInGSTInvoice > 0) {
            isFromGSTInvoiceRecord = true
        }

        // From Additional Entry
        let addEntryModel = await additionalEntryMaterialDetailsModel();
        let additionalEntry = await addEntryModel.find({ rawMaterialId: data.id, isDeleted: false }).select('qty');
        const totalUsedQtyInAdditionalEntry = additionalEntry.reduce((sum, item) => sum + item.qty, 0);

        let totalStock = {
            productionNo: '',
            batchClearingEntryId: null,
            productId: data.id,
            batchNo: '',
            expDate: '',
            mfgDate: '',
            quantity: totalPurchaseQty - totalUsedQtyInProduction - (Number(totalUsedQtyInGSTInvoice) || 0) - (Number(totalUsedQtyInAdditionalEntry) || 0),
            mrp: '',
            hsnCode: '',
            name: data.rmName,
            uom: data.uom,
            isFromGSTInvoiceRecord: isFromGSTInvoiceRecord

        }

        let array = []
        array.push(totalStock)
        let encryptData = encryptionAPI(array, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const addEditInvoiceRM = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let responseData = {}
        if (data.invoiceDetails.gstInvoiceRMID && data.invoiceDetails.gstInvoiceRMID.trim() !== '') {
            // Add Edit For Invoice Details
            let girModel = await gstInvoiceRMModel();
            const response = await girModel.findByIdAndUpdate(data.invoiceDetails.gstInvoiceRMID, data.invoiceDetails, { new: true });
            if (!response) {
                responseData.invoiceDetails = 'Party details not found';
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Invoice Details Not found",
                        responseData: encryptData,
                        isEnType: true,
                    },
                });
            }


            // Stock Updating
            try {
                await Promise.all(data.itemListing.map(async (item) => {
                    const totalReduceQty = (Number(item.finalQty) || 0);
                    let id = item._id ? item._id : null
                    let giRMItemModel = await gstinvoiceRMItemModel()
                    const existingItemDetails = await giRMItemModel.findOne({ _id: id, isDeleted: false });

                    if (existingItemDetails) {
                        let iRMStock = await InvoiceRMStockModel();
                        await iRMStock.findOneAndUpdate(
                            { rmId: item.itemId },
                            { $inc: { qty: totalReduceQty } },
                            { new: true }
                        );
                    } else {
                        let iRMStock = await InvoiceRMStockModel();
                        await iRMStock.findOneAndUpdate(
                            { rmId: item.itemId },
                            { $inc: { qty: Number(item.qty) } },
                            { new: true }
                        );
                    }
                }));

                // Payment Receipt Entry
                let request = {
                    voucherNo: data.invoiceDetails.invoiceNo,
                    date: data.invoiceDetails.invoiceDate,
                    partyId: data.invoiceDetails.partyId,
                    debitAmount: data.invoiceDetails.grandTotal,
                    narration1: `INVOICE NO : ${data.invoiceDetails.invoiceNo}`,
                }

                let prEntryModel = await paymentReceiptEntryModel();
                await prEntryModel.findOneAndUpdate(
                    { gstInvoiceRMId: data.invoiceDetails.gstInvoiceRMID },
                    request,
                    { new: true }
                );

                // After Stock Updating, proceed with Invoice Item Details
                let giRMItemModel = await gstinvoiceRMItemModel()
                await giRMItemModel.deleteMany({ gstInvoiceRMID: response._id });

                const items = data.itemListing.map(item => ({
                    ...item,
                    gstInvoiceRMID: response._id
                }));

                let giRMItemModel1 = await gstinvoiceRMItemModel()
                await giRMItemModel1.insertMany(items);

                responseData.invoiceDetails = response;
                let encryptData = encryptionAPI(responseData, 1);

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Invoice Details Updated Successfully",
                        responseData: encryptData,
                        isEnType: true,
                    },
                });

            } catch (error) {
                console.log("Error in Despatch controller", error);
                errorHandler(error, req, res, "Error in Despatch controller")
            }

        } else {
            // Add Edit For Invoice Details
            let girModel = await gstInvoiceRMModel();
            const response = new girModel(data.invoiceDetails);
            await response.save();

            responseData.invoiceDetails = response;

            const items = data.itemListing.map(item => ({
                ...item,
                gstInvoiceRMID: response._id
            }));

            // Add Edit For Invoice Item Details
            let giRMItemModel = await gstinvoiceRMItemModel()
            await giRMItemModel.insertMany(items);

            // Payment Receipt Entry
            let request = {
                voucherNo: data.invoiceDetails.invoiceNo,
                bankName: 'SALES',
                date: data.invoiceDetails.invoiceDate,
                partyId: data.invoiceDetails.partyId,
                partyBankNameOrPayto: '-',
                chqNo: '-',
                debitAmount: data.invoiceDetails.grandTotal,
                creditAmount: 0,
                narration1: `INVOICE NO : ${data.invoiceDetails.invoiceNo}`,
                narration2: '',
                narration3: '',
                entryType: 'Receipt',
                from: 'GSTInvoiceRM',
                gstInvoiceRMId: response._id,
            }
            let prEntryModel = await paymentReceiptEntryModel();
            let paymentEntry = new prEntryModel(request);
            await paymentEntry.save();


            // Stock Data Inserting
            data.itemListing.map(async (item) => {
                const totalReduceQty = (Number(item.qty) || 0);
                let iRMStock = await InvoiceRMStockModel();
                const existingItemDetails = await iRMStock.findOne({ rmId: item.itemId, isDeleted: false });

                if (existingItemDetails) {
                    const existingQty = (Number(existingItemDetails.qty) || 0);
                    const updatedQty = existingQty - totalReduceQty;

                    let iRMStock = await InvoiceRMStockModel();
                    await iRMStock.findOneAndUpdate(
                        { rmId: item.itemId },
                        { $inc: { qty: totalReduceQty } },
                        { new: true }
                    );
                } else {
                    let itemDetails = {
                        rmId: item.itemId,
                        batchNo: item.batchNo,
                        qty: item.qty,
                        rmName: item.itemName,
                        invoiceNo: item.invoiceNo
                    }
                    let iRMStock = await InvoiceRMStockModel();
                    await iRMStock.create(itemDetails);
                }
            })

            let encryptData = encryptionAPI(responseData, 1);

            res.status(200).json({
                data: {

                    statusCode: 200,
                    Message: "Invoice Details Inserted Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });


        }

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const getAllGSTInvoiceRMRecords = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }

        let sortBy = 'invoiceNo'

        if (data.invoiceNo && data.invoiceNo.trim() !== "") {
            queryObject.invoiceNo = { $regex: `^${data.invoiceNo}`, $options: "i" };
        }

        if (data.arrangedBy && data.arrangedBy.trim() !== "") {
            sortBy = data.arrangedBy;
        }

        let response = []
        let girModel = await gstInvoiceRMModel();
        response = await girModel
            .find(queryObject)
            .sort(sortBy)
            .populate({
                path: 'partyId',
                select: 'partyName',
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });

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
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

const getGSTInvoiceRMById = async (req, res) => {
    try {
        const { id } = req.query;

        let reqId = getRequestData(id)

        let girModel = await gstInvoiceRMModel();
        let invoiceDetails = await girModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: "partyId",
                select: "partyName",
            })
            .populate({
                path: "transportId",
                select: "transportName",
            });

        let giRMItemModel = await gstinvoiceRMItemModel()
        let itemListing = await giRMItemModel
            .find({ gstInvoiceRMID: reqId, isDeleted: false });

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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const deleteRMItemFromDBById = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        // Stock Updating
        let totalReduceQty = (Number(data.qty) || 0)
        let iRMStock = await InvoiceRMStockModel();
        await iRMStock.findOneAndUpdate(
            { rmId: data.itemId },
            { $inc: { qty: -totalReduceQty } },
            { new: true }
        );
        // Removing Particualr Item From GST Invoice
        let giRMItemModel = await gstinvoiceRMItemModel()
        let response = await giRMItemModel.findByIdAndUpdate(data.gstInvoiceItemId, { isDeleted: true })

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Item Deleted successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const deleteRMInvoiceById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)

        let giRMItemModel = await gstinvoiceRMItemModel()
        let itemList = await giRMItemModel.find({ gstInvoiceRMID: reqId, isDeleted: false })

        itemList.map(async item => {
            // Stock Updating
            let totalReduceQty = (Number(item.qty) || 0)

            let iRMStock = await InvoiceRMStockModel();
            await iRMStock.findOneAndUpdate(
                { rmId: item.itemId },
                { $inc: { qty: -totalReduceQty } },
                { new: true }
            );

            // Removing Particualr Item From GST Invoice
            let giRMItemModel = await gstinvoiceRMItemModel()
            await giRMItemModel.findByIdAndUpdate(item._id, { isDeleted: true })
        })

        // Payment Receipt Entry
        let prEntryModel = await paymentReceiptEntryModel();
        await prEntryModel.findOneAndUpdate({ gstInvoiceRMId: reqId }, { isDeleted: true }, { new: true });

        // Removing GST Invoice Finish Goods Record
        let girModel = await gstInvoiceRMModel();
        let response = await girModel.findByIdAndUpdate(reqId, { isDeleted: true })

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Invoice Details Deleted Successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const generateGSTInvoiceForRMById = async (req, res) => {
    try {

        const { id } = req.query;
        let reqId = getRequestData(id)

        let cgModel = await companyGroupModel()
        let companyDetails = await cgModel.findOne({});
        let adminAddress = companyDetails.addressLine1 + ' '
            + companyDetails.addressLine2 + ' '
            + companyDetails.addressLine3 + ' '
            + companyDetails.pinCode + '(' + companyDetails.state + ')'

        let girModel = await gstInvoiceRMModel();
        let invoiceDetails = await girModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: 'partyId',
                select: 'email partyName address1 address2 address3 address4 corrspAddress1 corrspAddress2 corrspAddress3 corrspAddress4 state pinCode gstnNo mobileNo1 mobileNo2 crdays person dlNo1 dlNo2 fssaiNo bankName city',
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });

        let giRMItemModel = await gstinvoiceRMItemModel()
        let itemListing = await giRMItemModel
            .find({ gstInvoiceRMID: reqId, isDeleted: false });

        let recipientAddress = invoiceDetails.partyId.address1 + ' '
            + invoiceDetails.partyId.address2 + ' '
            + invoiceDetails.partyId.address3 + ' '
            + invoiceDetails.partyId.address4 + '-'
            + invoiceDetails.partyId.pinCode

        let shippedToAddress = (invoiceDetails.partyId.corrspAddress1 !== '' ? invoiceDetails.partyId.corrspAddress1 : invoiceDetails.partyId.address1) + ' ' +
            (invoiceDetails.partyId.corrspAddress2 !== '' ? invoiceDetails.partyId.corrspAddress2 : invoiceDetails.partyId.address2) + ' ' +
            (invoiceDetails.partyId.corrspAddress3 !== '' ? invoiceDetails.partyId.corrspAddress3 : invoiceDetails.partyId.address3) + ' ' +
            (invoiceDetails.partyId.corrspAddress4 !== '' ? invoiceDetails.partyId.corrspAddress4 : invoiceDetails.partyId.address4) + '-' +
            invoiceDetails.partyId.pinCode

        let mobileNo = invoiceDetails.partyId.mobileNo1 + (invoiceDetails.partyId.mobileNo2 !== '' ? ',' + invoiceDetails.partyId.mobileNo2 : '')

        const itemListingTotalCalculation = itemListing.reduce((acc, item) => {
            acc.amount += Number(item.amount);
            acc.discAmount += Number(item.discAmount);
            acc.taxableAmount += Number(item.taxableAmount);
            return acc;
        }, { amount: 0, discAmount: 0, taxableAmount: 0 });

        const itemListingRows = itemListing && itemListing.length > 0
            ? itemListing.map(item => `
                <tr>
                    <td class="border border-x border-l-0 border-y-0 px-[4px] text-start">${item.itemName}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.hsnCodeName}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.batchNo ? item.batchNo : ''}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.mfgDate ? dayjs(item.mfgDate).format('MM-YYYY') : ''}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.expDate ? dayjs(item.expDate).format('MM-YYYY') : ''}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.qty}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${Number(item.rate).toFixed(2)}</td>
                    <td class="border border-x border-r-0 border-y-0 px-[4px] text-start">${Number(item.amount).toFixed(2)}</td>
                </tr>
            `).join('')
            : '';

        let hcModel = await HNSCodesScHema()
        let hsnCodeList = await hcModel.find({});

        let hsnCodeListForTable = showHSNCodes(itemListing, hsnCodeList, invoiceDetails.partyId.state)

        const hsnCodeTotalCalculation = hsnCodeListForTable.reduce(
            (acc, item) => {
                acc.taxableAmount += Number(item.taxableAmount);
                acc.sgstAmount += Number(item.sgstAmount);
                acc.cgstAmount += Number(item.cgstAmount);
                acc.igstAmount += Number(item.igstAmount);
                acc.totalAmount += Number(item.totalAmount);
                return acc;
            },
            { taxableAmount: 0, sgstAmount: 0, cgstAmount: 0, igstAmount: 0, totalAmount: 0 }
        );
        const hsnCodeTableRows = hsnCodeListForTable && hsnCodeListForTable.length > 0
            ? hsnCodeListForTable.map(item => `
                            <tr>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x border-l-0">${item.HSNCode}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.taxableAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.SGST}%</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.sgstAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.CGST}%</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.cgstAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.IGST}%</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.igstAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x border-r-0">${item.totalAmount}</td>
        </tr>
            `).join('')
            : '';


        let date = new Date(invoiceDetails.invoiceDate);
        date.setDate(date.getDate() + invoiceDetails.creditDay);
        let dueDate = date.toDateString()

        let htmlTemplate = fs.readFileSync(path.join(__dirname, "..", "..", "uploads", "InvoiceTemplates", "gstInvoiceRMTemplate.html"), "utf8");

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
                .replace('#ConCompanyName', invoiceDetails.partyId.partyName)
                .replace('#ConRecipientState', invoiceDetails.partyId.state)
                .replace('#ConMobielNo', mobileNo)
                .replace('#RecipientAddress', recipientAddress)
                .replace('#ShippedToAddress', shippedToAddress)
                .replace('#RecipientState', invoiceDetails.partyId.state)
                .replace('#RecpGSTNNo', invoiceDetails.partyId.gstnNo ? invoiceDetails.partyId.gstnNo : '-')
                .replace('#FSSAINo', invoiceDetails.partyId.fssaiNo ? invoiceDetails.partyId.fssaiNo : '-')
                .replace('#RecpDLNo', (invoiceDetails.partyId.dlNo1 !== '' ? invoiceDetails.partyId.dlNo1 : '') + (invoiceDetails.partyId.dlNo2 ? (', ' + invoiceDetails.partyId.dlNo2) : ''))
                .replace('#MobielNo', mobileNo)
                .replace('#TransportName', invoiceDetails.transportId.transportName)
                .replace('#Cases', invoiceDetails.cases)
                .replace('#Destination', invoiceDetails.partyId.city)
                .replace('#Weight', invoiceDetails.weight)
                .replace('#LRNo', invoiceDetails.lRNo)
                .replace('#LRDate', dayjs(invoiceDetails.lRDate).format("DD-MM-YYYY"))
                .replace('#RDPermitNo', invoiceDetails.roadPermitNo)
                .replace('#InvoiceNo', invoiceDetails.invoiceNo)
                .replace('#InvoiceDate', dayjs(invoiceDetails.invoiceDate).format("DD-MM-YYYY"))
                .replace('#DueDate', dayjs(dueDate).format("DD-MM-YYYY"))
                .replace('#ItemListingRows', itemListingRows)
                .replace('#SubTotalAmount', invoiceDetails.subTotal)
                .replace('#DisCountAmount', invoiceDetails.discount)
                .replace('#SGSTAmount', invoiceDetails.sgst)
                .replace('#CGSTAmount', invoiceDetails.cgst)
                .replace('#IGSTAmount', invoiceDetails.igst)
                .replace('#CRDRNote', invoiceDetails.crDrNote)
                .replace('#Freight', invoiceDetails.freight && invoiceDetails.freight > 0 ? invoiceDetails.freight : 0)
                .replace('#OtherCharges', invoiceDetails.other && invoiceDetails.other > 0 ? invoiceDetails.other : 0)
                .replace('#RoundOffAmount', invoiceDetails.roundOff)
                .replace('#GrandTotal', invoiceDetails.grandTotal)
                .replace('#HSNCodeTableRows', hsnCodeTableRows)
                .replace('#TotalSalesAmount', itemListingTotalCalculation.amount)
                .replace('#TotalDisAmount', itemListingTotalCalculation.discAmount)
                .replace('#TotalTaxableAmount', itemListingTotalCalculation.taxableAmount)
                .replace('#TaxableAmountTotal', hsnCodeTotalCalculation.taxableAmount)
                .replace('#SGSTTotalAmount', hsnCodeTotalCalculation.sgstAmount)
                .replace('#CGSTTotalAmount', hsnCodeTotalCalculation.cgstAmount)
                .replace('#IGSTTotalAmount', hsnCodeTotalCalculation.igstAmount)
                .replace('#TotalGSTCalculation', hsnCodeTotalCalculation.totalAmount)
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
            <div class="empty-page">${generatePage("Duplicate for Transporter")}</div>
            <div class="page-break"></div>
            <div class="empty-page">${generatePage("Triplicate for Supplier")}</div>
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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const sendGSTInvoiceRMToClient = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)

        let cgModel = await companyGroupModel()
        let companyDetails = await cgModel.findOne({});
        let adminAddress = companyDetails.addressLine1 + ' '
            + companyDetails.addressLine2 + ' '
            + companyDetails.addressLine3 + ' '
            + companyDetails.pinCode + '(' + companyDetails.state + ')'

        let girModel = await gstInvoiceRMModel();
        let invoiceDetails = await girModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: 'partyId',
                select: 'email partyName address1 address2 address3 address4 corrspAddress1 corrspAddress2 corrspAddress3 corrspAddress4 state pinCode gstnNo mobileNo1 mobileNo2 crdays person dlNo1 dlNo2 fssaiNo bankName city',
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });

        if (invoiceDetails.partyId.email && invoiceDetails.partyId.email !== '') {
            let giRMItemModel = await gstinvoiceRMItemModel()
            let itemListing = await giRMItemModel
                .find({ gstInvoiceRMID: reqId, isDeleted: false });

            let recipientAddress = invoiceDetails.partyId.address1 + ' '
                + invoiceDetails.partyId.address2 + ' '
                + invoiceDetails.partyId.address3 + ' '
                + invoiceDetails.partyId.address4 + '-'
                + invoiceDetails.partyId.pinCode

            let shippedToAddress = (invoiceDetails.partyId.corrspAddress1 !== '' ? invoiceDetails.partyId.corrspAddress1 : invoiceDetails.partyId.address1) + ' ' +
                (invoiceDetails.partyId.corrspAddress2 !== '' ? invoiceDetails.partyId.corrspAddress2 : invoiceDetails.partyId.address2) + ' ' +
                (invoiceDetails.partyId.corrspAddress3 !== '' ? invoiceDetails.partyId.corrspAddress3 : invoiceDetails.partyId.address3) + ' ' +
                (invoiceDetails.partyId.corrspAddress4 !== '' ? invoiceDetails.partyId.corrspAddress4 : invoiceDetails.partyId.address4) + '-' +
                invoiceDetails.partyId.pinCode

            let mobileNo = invoiceDetails.partyId.mobileNo1 + (invoiceDetails.partyId.mobileNo2 !== '' ? ',' + invoiceDetails.partyId.mobileNo2 : '')

            const itemListingTotalCalculation = itemListing.reduce((acc, item) => {
                acc.amount += Number(item.amount);
                acc.discAmount += Number(item.discAmount);
                acc.taxableAmount += Number(item.taxableAmount);
                return acc;
            }, { amount: 0, discAmount: 0, taxableAmount: 0 });

            const itemListingRows = itemListing && itemListing.length > 0
                ? itemListing.map(item => `
                <tr>
                    <td class="border border-x border-l-0 border-y-0 px-[4px] text-start">${item.itemName}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.hsnCodeName}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.batchNo ? item.batchNo : ''}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.mfgDate ? dayjs(item.mfgDate).format('MM-YYYY') : ''}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.expDate ? dayjs(item.expDate).format('MM-YYYY') : ''}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.qty}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${Number(item.rate).toFixed(2)}</td>
                    <td class="border border-x border-r-0 border-y-0 px-[4px] text-start">${Number(item.amount).toFixed(2)}</td>
                </tr>
            `).join('')
                : '';

            let hcModel = await HNSCodesScHema()
            let hsnCodeList = await hcModel.find({});

            let hsnCodeListForTable = showHSNCodes(itemListing, hsnCodeList, invoiceDetails.partyId.state)

            const hsnCodeTotalCalculation = hsnCodeListForTable.reduce(
                (acc, item) => {
                    acc.taxableAmount += Number(item.taxableAmount);
                    acc.sgstAmount += Number(item.sgstAmount);
                    acc.cgstAmount += Number(item.cgstAmount);
                    acc.igstAmount += Number(item.igstAmount);
                    acc.totalAmount += Number(item.totalAmount);
                    return acc;
                },
                { taxableAmount: 0, sgstAmount: 0, cgstAmount: 0, igstAmount: 0, totalAmount: 0 }
            );
            const hsnCodeTableRows = hsnCodeListForTable && hsnCodeListForTable.length > 0
                ? hsnCodeListForTable.map(item => `
                            <tr>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x border-l-0">${item.HSNCode}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.taxableAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.SGST}%</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.sgstAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.CGST}%</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.cgstAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.IGST}%</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.igstAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x border-r-0">${item.totalAmount}</td>
                        </tr>
            `).join('')
                : '';


            let date = new Date(invoiceDetails.invoiceDate);
            date.setDate(date.getDate() + invoiceDetails.creditDay);
            let dueDate = date.toDateString()

            let htmlTemplate = fs.readFileSync(path.join(__dirname, "..", "..", "uploads", "InvoiceTemplates", "gstInvoiceRMTemplate.html"), "utf8");

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
                    .replace('#ConCompanyName', invoiceDetails.partyId.partyName)
                    .replace('#ConRecipientState', invoiceDetails.partyId.state)
                    .replace('#ConMobielNo', mobileNo)
                    .replace('#RecipientAddress', recipientAddress)
                    .replace('#ShippedToAddress', shippedToAddress)
                    .replace('#RecipientState', invoiceDetails.partyId.state)
                    .replace('#RecpGSTNNo', invoiceDetails.partyId.gstnNo ? invoiceDetails.partyId.gstnNo : '-')
                    .replace('#FSSAINo', invoiceDetails.partyId.fssaiNo ? invoiceDetails.partyId.fssaiNo : '-')
                    .replace('#RecpDLNo', (invoiceDetails.partyId.dlNo1 !== '' ? invoiceDetails.partyId.dlNo1 : '') + (invoiceDetails.partyId.dlNo2 ? (', ' + invoiceDetails.partyId.dlNo2) : ''))
                    .replace('#MobielNo', mobileNo)
                    .replace('#TransportName', invoiceDetails.transportId.transportName)
                    .replace('#Cases', invoiceDetails.cases)
                    .replace('#Destination', invoiceDetails.partyId.city)
                    .replace('#Weight', invoiceDetails.weight)
                    .replace('#LRNo', invoiceDetails.lRNo)
                    .replace('#LRDate', dayjs(invoiceDetails.lRDate).format("DD-MM-YYYY"))
                    .replace('#RDPermitNo', invoiceDetails.roadPermitNo)
                    .replace('#InvoiceNo', invoiceDetails.invoiceNo)
                    .replace('#InvoiceDate', dayjs(invoiceDetails.invoiceDate).format("DD-MM-YYYY"))
                    .replace('#DueDate', dayjs(dueDate).format("DD-MM-YYYY"))
                    .replace('#ItemListingRows', itemListingRows)
                    .replace('#SubTotalAmount', invoiceDetails.subTotal)
                    .replace('#DisCountAmount', invoiceDetails.discount)
                    .replace('#SGSTAmount', invoiceDetails.sgst)
                    .replace('#CGSTAmount', invoiceDetails.cgst)
                    .replace('#IGSTAmount', invoiceDetails.igst)
                    .replace('#CRDRNote', invoiceDetails.crDrNote)
                    .replace('#Freight', invoiceDetails.freight && invoiceDetails.freight > 0 ? invoiceDetails.freight : 0)
                    .replace('#OtherCharges', invoiceDetails.other && invoiceDetails.other > 0 ? invoiceDetails.other : 0)
                    .replace('#RoundOffAmount', invoiceDetails.roundOff)
                    .replace('#GrandTotal', invoiceDetails.grandTotal)
                    .replace('#HSNCodeTableRows', hsnCodeTableRows)
                    .replace('#TotalSalesAmount', itemListingTotalCalculation.amount)
                    .replace('#TotalDisAmount', itemListingTotalCalculation.discAmount)
                    .replace('#TotalTaxableAmount', itemListingTotalCalculation.taxableAmount)
                    .replace('#TaxableAmountTotal', hsnCodeTotalCalculation.taxableAmount)
                    .replace('#SGSTTotalAmount', hsnCodeTotalCalculation.sgstAmount)
                    .replace('#CGSTTotalAmount', hsnCodeTotalCalculation.cgstAmount)
                    .replace('#IGSTTotalAmount', hsnCodeTotalCalculation.igstAmount)
                    .replace('#TotalGSTCalculation', hsnCodeTotalCalculation.totalAmount)
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
        `;

            const browser = await puppeteer.launch({
                headless: "new",
                args: ["--no-sandbox", "--disable-setuid-sandbox"]
            });
            const page = await browser.newPage();

            await page.setContent(htmlTemplate, { waitUntil: "load" });

            const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

            await browser.close();

            let etModel = await emailTemplateModel()
            const EmailTemplate = await etModel.findOne({ emailTemplateId: 3 });

            let html = EmailTemplate.description.replace('#CompanyName', invoiceDetails.partyId.partyName);

            let emaildata = {
                toMail: invoiceDetails.partyId.email,
                subject: EmailTemplate.emailSubject,
                fromMail: FromMail,
                html: html,
                filename: 'GSTInvoiceRM',
                pdfBuffer: pdfBuffer,
                contentType: "application/pdf"
            };

            mailsender(emaildata)


            let encryptData = encryptionAPI(invoiceDetails, 1);

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Mail Sent Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });

        } else {
            let encryptData = encryptionAPI(invoiceDetails, 1);
            res.status(200).json({
                data: {
                    statusCode: 404,
                    Message: "Email is not available for this company",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }
    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

// GST Invoice PM
const getGSTInvoicePMInvoiceNo = async (req, res) => {
    try {
        let response = {}
        let gipModel = await gstInvoicePMModel();
        let gstNoRecord = await gipModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select('invoiceNo');

        if (gstNoRecord && gstNoRecord.invoiceNo) {
            let lastNumber = parseInt(gstNoRecord.invoiceNo.replace('PM', ''), 10);
            let newNumber = lastNumber + 1;

            response.invoiceNo = `PM${newNumber.toString().padStart(4, '0')}`;
        } else {
            response.invoiceNo = 'PM0001';
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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const getPakcingMaterialStockByPMID = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let queryObject = {
            isDeleted: false,
            packageMaterialId: data.id
        };

        // From GRN Entry
        let gemDetailsModel = await grnEntryMaterialDetailsModel();
        const packingMaterialData = await gemDetailsModel
            .find(queryObject)
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

        const totalPurchaseQty = packingMaterialData.reduce((sum, item) => sum + item.qty, 0);

        // From Production Used Qty
        let prPMFormualModel = await PackingRequisitionPMFormulaModel()
        const responseFromUsedQty = await prPMFormualModel
            .find({ pmName: data.pmName, isDeleted: false })
            .populate({
                path: 'productDetialsId',
                select: 'partyId productionNo productionPlanningDate batchNo _id',
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });

        const totalUsedQtyInProduction = responseFromUsedQty.reduce((sum, item) => sum + item.netQty, 0);

        // From Invoice Used Qty
        let iPMStockModel = await InvoicePMStockModel()
        const responseFromUsedQtyGSTInvoice = await iPMStockModel
            .find({ pmId: data.id, isDeleted: false });

        const totalUsedQtyInGSTInvoice = responseFromUsedQtyGSTInvoice.reduce((sum, item) => sum + item.qty, 0);

        let isFromGSTInvoiceRecord = false

        if (responseFromUsedQtyGSTInvoice.length > 0 && totalUsedQtyInGSTInvoice > 0) {
            isFromGSTInvoiceRecord = true
        }

        // From Additional Entry
        let addEntryModel = await additionalEntryMaterialDetailsModel();
        let additionalEntry = await addEntryModel.find({ packageMaterialId: data.id, isDeleted: false }).select('qty');
        const totalUsedQtyInAdditionalEntry = additionalEntry.reduce((sum, item) => sum + item.qty, 0);


        let totalStock = {
            productionNo: '',
            batchClearingEntryId: null,
            productId: data.id,
            batchNo: '',
            expDate: '',
            mfgDate: '',
            quantity: totalPurchaseQty - totalUsedQtyInProduction - (Number(totalUsedQtyInGSTInvoice) || 0) - (Number(totalUsedQtyInAdditionalEntry) || 0),
            mrp: '',
            hsnCode: '',
            name: data.pmName,
            uom: data.uom,
            isFromGSTInvoiceRecord: isFromGSTInvoiceRecord

        }

        let array = []
        array.push(totalStock)
        let encryptData = encryptionAPI(array, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const addEditInvoicePM = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let responseData = {}
        if (data.invoiceDetails.gstInvoicePMID && data.invoiceDetails.gstInvoicePMID.trim() !== '') {
            // Add Edit For Invoice Details
            let gipModel = await gstInvoicePMModel();
            const response = await gipModel.findByIdAndUpdate(data.invoiceDetails.gstInvoicePMID, data.invoiceDetails, { new: true });
            if (!response) {
                responseData.invoiceDetails = 'Party details not found';
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Invoice Details Not found",
                        responseData: encryptData,
                        isEnType: true,
                    },
                });
            }


            // Stock Updating
            try {
                await Promise.all(data.itemListing.map(async (item) => {
                    const totalReduceQty = (Number(item.finalQty) || 0);
                    let id = item._id ? item._id : null
                    let giPMItemModel = await gstInvoicePMItemModel()
                    const existingItemDetails = await giPMItemModel.findOne({ _id: id, isDeleted: false });
                    if (existingItemDetails) {
                        let iPMStockModel = await InvoicePMStockModel()
                        await iPMStockModel.findOneAndUpdate(
                            { pmId: item.itemId },
                            { $inc: { qty: totalReduceQty } },
                            { new: true }
                        );
                    } else {
                        let iPMStockModel = await InvoicePMStockModel()
                        await iPMStockModel.findOneAndUpdate(
                            { pmId: item.itemId },
                            { $inc: { qty: Number(item.qty) } },
                            { new: true }
                        );
                    }
                }));


                // Payment Receipt Entry
                let request = {
                    voucherNo: data.invoiceDetails.invoiceNo,
                    date: data.invoiceDetails.invoiceDate,
                    partyId: data.invoiceDetails.partyId,
                    debitAmount: data.invoiceDetails.grandTotal,
                    narration1: `INVOICE NO : ${data.invoiceDetails.invoiceNo}`,
                }

                let prEntryModel = await paymentReceiptEntryModel();
                await prEntryModel.findOneAndUpdate(
                    { gstInvoicePMId: data.invoiceDetails.gstInvoicePMID },
                    request,
                    { new: true }
                );

                // After Stock Updating, proceed with Invoice Item Details
                let giPMItemModel = await gstInvoicePMItemModel()
                await giPMItemModel.deleteMany({ gstInvoicePMID: response._id });

                const items = data.itemListing.map(item => ({
                    ...item,
                    gstInvoicePMID: response._id
                }));

                let giPMItemModel1 = await gstInvoicePMItemModel()
                await giPMItemModel1.insertMany(items);

                responseData.invoiceDetails = response;
                let encryptData = encryptionAPI(responseData, 1);

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Invoice Details Updated Successfully",
                        responseData: encryptData,
                        isEnType: true,
                    },
                });

            } catch (error) {
                console.log("Error in Despatch controller", error);
                errorHandler(error, req, res, "Error in Despatch controller")
            }

        } else {
            // Add Edit For Invoice Details
            let gipModel = await gstInvoicePMModel();
            const response = new gipModel(data.invoiceDetails);
            await response.save();

            responseData.invoiceDetails = response;

            const items = data.itemListing.map(item => ({
                ...item,
                gstInvoicePMID: response._id
            }));

            // Add Edit For Invoice Item Details
            let giPMItemModel = await gstInvoicePMItemModel()
            await giPMItemModel.insertMany(items);

            // Payment Receipt Entry
            let request = {
                voucherNo: data.invoiceDetails.invoiceNo,
                bankName: 'SALES',
                date: data.invoiceDetails.invoiceDate,
                partyId: data.invoiceDetails.partyId,
                partyBankNameOrPayto: '-',
                chqNo: '-',
                debitAmount: data.invoiceDetails.grandTotal,
                creditAmount: 0,
                narration1: `INVOICE NO : ${data.invoiceDetails.invoiceNo}`,
                narration2: '',
                narration3: '',
                entryType: 'Receipt',
                from: 'GSTInvoicePM',
                gstInvoicePMId: response._id,
            }

            let prEntryModel = await paymentReceiptEntryModel();
            let paymentEntry = new prEntryModel(request);
            await paymentEntry.save();


            // Stock Data Inserting
            data.itemListing.map(async (item) => {
                const totalReduceQty = (Number(item.qty) || 0);
                let iPMStockModel = await InvoicePMStockModel()
                const existingItemDetails = await iPMStockModel.findOne({ pmId: item.itemId, isDeleted: false });

                if (existingItemDetails) {
                    const existingQty = (Number(existingItemDetails.qty) || 0);

                    let iPMStockModel = await InvoicePMStockModel()
                    await iPMStockModel.findOneAndUpdate(
                        { pmId: item.itemId },
                        { $inc: { qty: totalReduceQty } },
                        { new: true }
                    );
                } else {
                    let itemDetails = {
                        pmId: item.itemId,
                        batchNo: item.batchNo,
                        qty: item.qty,
                        rmName: item.itemName,
                        invoiceNo: item.invoiceNo
                    }
                    let iPMStockModel = await InvoicePMStockModel()
                    await iPMStockModel.create(itemDetails);
                }
            })

            let encryptData = encryptionAPI(responseData, 1);

            res.status(200).json({
                data: {

                    statusCode: 200,
                    Message: "Invoice Details Inserted Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });


        }

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const getAllGSTInvoicePMRecords = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }

        let sortBy = 'invoiceNo'

        if (data.invoiceNo && data.invoiceNo.trim() !== "") {
            queryObject.invoiceNo = { $regex: `^${data.invoiceNo}`, $options: "i" };
        }

        if (data.arrangedBy && data.arrangedBy.trim() !== "") {
            sortBy = data.arrangedBy;
        }

        let response = []
        let gipModel = await gstInvoicePMModel();
        response = await gipModel
            .find(queryObject)
            .sort(sortBy)
            .populate({
                path: 'partyId',
                select: 'partyName',
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });

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
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

const getGSTInvoicePMById = async (req, res) => {
    try {
        const { id } = req.query;

        let reqId = getRequestData(id)

        let gipModel = await gstInvoicePMModel();
        let invoiceDetails = await gipModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: "partyId",
                select: "partyName",
            })
            .populate({
                path: "transportId",
                select: "transportName",
            });

        let giPMItemModel = await gstInvoicePMItemModel()
        let itemListing = await giPMItemModel
            .find({ gstInvoicePMID: reqId, isDeleted: false });

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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const deletePMItemFromDBById = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        // Stock Updating
        let totalReduceQty = (Number(data.qty) || 0)
        let iPMStockModel = await InvoicePMStockModel()
        await iPMStockModel.findOneAndUpdate(
            { pmId: data.itemId },
            { $inc: { qty: -totalReduceQty } },
            { new: true }
        );
        // Removing Particualr Item From GST Invoice
        let giPMItemModel = await gstInvoicePMItemModel()
        let response = await giPMItemModel.findByIdAndUpdate(data.gstInvoiceItemId, { isDeleted: true })

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Item Deleted successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const deletePMInvoiceById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)

        let giPMItemModel = await gstInvoicePMItemModel()
        let itemList = await giPMItemModel.find({ gstInvoicePMID: reqId, isDeleted: false })

        itemList.map(async item => {
            // Stock Updating
            let totalReduceQty = (Number(item.qty) || 0)

            let iPMStockModel = await InvoicePMStockModel()
            await iPMStockModel.findOneAndUpdate(
                { pmId: item.itemId },
                { $inc: { qty: -totalReduceQty } },
                { new: true }
            );

            // Removing Particualr Item From GST Invoice
            let giPMItemModel = await gstInvoicePMItemModel()
            await giPMItemModel.findByIdAndUpdate(item._id, { isDeleted: true })
        })

        // Payment Receipt Entry
        let prEntryModel = await paymentReceiptEntryModel();
        await prEntryModel.findOneAndUpdate({ gstInvoicePMId: reqId }, { isDeleted: true }, { new: true });

        // Removing GST Invoice Finish Goods Record
        let gipModel = await gstInvoicePMModel();
        let response = await gipModel.findByIdAndUpdate(reqId, { isDeleted: true })

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Invoice Details Deleted Successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const generateGSTInvoiceForPMById = async (req, res) => {
    try {

        const { id } = req.query;
        let reqId = getRequestData(id)

        let cgModel = await companyGroupModel()
        let companyDetails = await cgModel.findOne({});
        let adminAddress = companyDetails.addressLine1 + ' '
            + companyDetails.addressLine2 + ' '
            + companyDetails.addressLine3 + ' '
            + companyDetails.pinCode + '(' + companyDetails.state + ')'

        let gipModel = await gstInvoicePMModel();
        let invoiceDetails = await gipModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: 'partyId',
                select: 'email partyName address1 address2 address3 address4 corrspAddress1 corrspAddress2 corrspAddress3 corrspAddress4 state pinCode gstnNo mobileNo1 mobileNo2 crdays person dlNo1 dlNo2 fssaiNo bankName city',
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });

        let giPMItemModel = await gstInvoicePMItemModel()
        let itemListing = await giPMItemModel
            .find({ gstInvoicePMID: reqId, isDeleted: false });

        let recipientAddress = invoiceDetails.partyId.address1 + ' '
            + invoiceDetails.partyId.address2 + ' '
            + invoiceDetails.partyId.address3 + ' '
            + invoiceDetails.partyId.address4 + '-'
            + invoiceDetails.partyId.pinCode

        let shippedToAddress = (invoiceDetails.partyId.corrspAddress1 !== '' ? invoiceDetails.partyId.corrspAddress1 : invoiceDetails.partyId.address1) + ' ' +
            (invoiceDetails.partyId.corrspAddress2 !== '' ? invoiceDetails.partyId.corrspAddress2 : invoiceDetails.partyId.address2) + ' ' +
            (invoiceDetails.partyId.corrspAddress3 !== '' ? invoiceDetails.partyId.corrspAddress3 : invoiceDetails.partyId.address3) + ' ' +
            (invoiceDetails.partyId.corrspAddress4 !== '' ? invoiceDetails.partyId.corrspAddress4 : invoiceDetails.partyId.address4) + '-' +
            invoiceDetails.partyId.pinCode

        let mobileNo = invoiceDetails.partyId.mobileNo1 + (invoiceDetails.partyId.mobileNo2 !== '' ? ',' + invoiceDetails.partyId.mobileNo2 : '')

        const itemListingTotalCalculation = itemListing.reduce((acc, item) => {
            acc.amount += Number(item.amount);
            acc.discAmount += Number(item.discAmount);
            acc.taxableAmount += Number(item.taxableAmount);
            return acc;
        }, { amount: 0, discAmount: 0, taxableAmount: 0 });

        const itemListingRows = itemListing && itemListing.length > 0
            ? itemListing.map(item => `
                <tr>
                    <td class="border border-x border-l-0 border-y-0 px-[4px] text-start">${item.itemName}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.hsnCodeName}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.batchNo ? item.batchNo : ''}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.mfgDate ? dayjs(item.mfgDate).format('MM-YYYY') : ''}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.expDate ? dayjs(item.expDate).format('MM-YYYY') : ''}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.qty}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${Number(item.rate).toFixed(2)}</td>
                    <td class="border border-x border-r-0 border-y-0 px-[4px] text-start">${Number(item.amount).toFixed(2)}</td>
                </tr>
            `).join('')
            : '';

        let hcModel = await HNSCodesScHema()
        let hsnCodeList = await hcModel.find({});

        let hsnCodeListForTable = showHSNCodes(itemListing, hsnCodeList, invoiceDetails.partyId.state)

        const hsnCodeTotalCalculation = hsnCodeListForTable.reduce(
            (acc, item) => {
                acc.taxableAmount += Number(item.taxableAmount);
                acc.sgstAmount += Number(item.sgstAmount);
                acc.cgstAmount += Number(item.cgstAmount);
                acc.igstAmount += Number(item.igstAmount);
                acc.totalAmount += Number(item.totalAmount);
                return acc;
            },
            { taxableAmount: 0, sgstAmount: 0, cgstAmount: 0, igstAmount: 0, totalAmount: 0 }
        );

        const hsnCodeTableRows = hsnCodeListForTable && hsnCodeListForTable.length > 0
            ? hsnCodeListForTable.map(item => `
                            <tr>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x border-l-0">${item.HSNCode}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.taxableAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.SGST}%</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.sgstAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.CGST}%</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.cgstAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.IGST}%</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.igstAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x border-r-0">${item.totalAmount}</td>
        </tr>
            `).join('')
            : '';


        let date = new Date(invoiceDetails.invoiceDate);
        date.setDate(date.getDate() + invoiceDetails.creditDay);
        let dueDate = date.toDateString()

        let htmlTemplate = fs.readFileSync(path.join(__dirname, "..", "..", "uploads", "InvoiceTemplates", "gstInvoiceRMTemplate.html"), "utf8");

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
                .replace('#ConCompanyName', invoiceDetails.partyId.partyName)
                .replace('#ConRecipientState', invoiceDetails.partyId.state)
                .replace('#ConMobielNo', mobileNo)
                .replace('#RecipientAddress', recipientAddress)
                .replace('#ShippedToAddress', shippedToAddress)
                .replace('#RecipientState', invoiceDetails.partyId.state)
                .replace('#RecpGSTNNo', invoiceDetails.partyId.gstnNo ? invoiceDetails.partyId.gstnNo : '-')
                .replace('#FSSAINo', invoiceDetails.partyId.fssaiNo ? invoiceDetails.partyId.fssaiNo : '-')
                .replace('#RecpDLNo', (invoiceDetails.partyId.dlNo1 !== '' ? invoiceDetails.partyId.dlNo1 : '') + (invoiceDetails.partyId.dlNo2 ? (', ' + invoiceDetails.partyId.dlNo2) : ''))
                .replace('#MobielNo', mobileNo)
                .replace('#TransportName', invoiceDetails.transportId.transportName)
                .replace('#Cases', invoiceDetails.cases)
                .replace('#Destination', invoiceDetails.partyId.city)
                .replace('#Weight', invoiceDetails.weight)
                .replace('#LRNo', invoiceDetails.lRNo)
                .replace('#LRDate', dayjs(invoiceDetails.lRDate).format("DD-MM-YYYY"))
                .replace('#RDPermitNo', invoiceDetails.roadPermitNo)
                .replace('#InvoiceNo', invoiceDetails.invoiceNo)
                .replace('#InvoiceDate', dayjs(invoiceDetails.invoiceDate).format("DD-MM-YYYY"))
                .replace('#DueDate', dayjs(dueDate).format("DD-MM-YYYY"))
                .replace('#ItemListingRows', itemListingRows)
                .replace('#SubTotalAmount', invoiceDetails.subTotal)
                .replace('#DisCountAmount', invoiceDetails.discount)
                .replace('#SGSTAmount', invoiceDetails.sgst)
                .replace('#CGSTAmount', invoiceDetails.cgst)
                .replace('#IGSTAmount', invoiceDetails.igst)
                .replace('#CRDRNote', invoiceDetails.crDrNote)
                .replace('#Freight', invoiceDetails.freight && invoiceDetails.freight > 0 ? invoiceDetails.freight : 0)
                .replace('#OtherCharges', invoiceDetails.other && invoiceDetails.other > 0 ? invoiceDetails.other : 0)
                .replace('#RoundOffAmount', invoiceDetails.roundOff)
                .replace('#GrandTotal', invoiceDetails.grandTotal)
                .replace('#HSNCodeTableRows', hsnCodeTableRows)
                .replace('#TotalSalesAmount', itemListingTotalCalculation.amount)
                .replace('#TotalDisAmount', itemListingTotalCalculation.discAmount)
                .replace('#TotalTaxableAmount', itemListingTotalCalculation.taxableAmount)
                .replace('#TaxableAmountTotal', hsnCodeTotalCalculation.taxableAmount)
                .replace('#SGSTTotalAmount', hsnCodeTotalCalculation.sgstAmount)
                .replace('#CGSTTotalAmount', hsnCodeTotalCalculation.cgstAmount)
                .replace('#IGSTTotalAmount', hsnCodeTotalCalculation.igstAmount)
                .replace('#TotalGSTCalculation', hsnCodeTotalCalculation.totalAmount)
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
            <div class="empty-page">${generatePage("Duplicate for Transporter")}</div>
            <div class="page-break"></div>
            <div class="empty-page">${generatePage("Triplicate for Supplier")}</div>
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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const sendGSTInvoicePMToClient = async (req, res) => {
    try {

        const { id } = req.query;
        let reqId = getRequestData(id)

        let cgModel = await companyGroupModel()
        let companyDetails = await cgModel.findOne({});
        let adminAddress = companyDetails.addressLine1 + ' '
            + companyDetails.addressLine2 + ' '
            + companyDetails.addressLine3 + ' '
            + companyDetails.pinCode + '(' + companyDetails.state + ')'

        let gipModel = await gstInvoicePMModel();
        let invoiceDetails = await gipModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: 'partyId',
                select: 'email partyName address1 address2 address3 address4 corrspAddress1 corrspAddress2 corrspAddress3 corrspAddress4 state pinCode gstnNo mobileNo1 mobileNo2 crdays person dlNo1 dlNo2 fssaiNo bankName city',
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });

        if (invoiceDetails.partyId.email && invoiceDetails.partyId.email !== '') {
            let giPMItemModel = await gstInvoicePMItemModel()
            let itemListing = await giPMItemModel
                .find({ gstInvoicePMID: reqId, isDeleted: false });

            let recipientAddress = invoiceDetails.partyId.address1 + ' '
                + invoiceDetails.partyId.address2 + ' '
                + invoiceDetails.partyId.address3 + ' '
                + invoiceDetails.partyId.address4 + '-'
                + invoiceDetails.partyId.pinCode

            let shippedToAddress = (invoiceDetails.partyId.corrspAddress1 !== '' ? invoiceDetails.partyId.corrspAddress1 : invoiceDetails.partyId.address1) + ' ' +
                (invoiceDetails.partyId.corrspAddress2 !== '' ? invoiceDetails.partyId.corrspAddress2 : invoiceDetails.partyId.address2) + ' ' +
                (invoiceDetails.partyId.corrspAddress3 !== '' ? invoiceDetails.partyId.corrspAddress3 : invoiceDetails.partyId.address3) + ' ' +
                (invoiceDetails.partyId.corrspAddress4 !== '' ? invoiceDetails.partyId.corrspAddress4 : invoiceDetails.partyId.address4) + '-' +
                invoiceDetails.partyId.pinCode

            let mobileNo = invoiceDetails.partyId.mobileNo1 + (invoiceDetails.partyId.mobileNo2 !== '' ? ',' + invoiceDetails.partyId.mobileNo2 : '')

            const itemListingTotalCalculation = itemListing.reduce((acc, item) => {
                acc.amount += Number(item.amount);
                acc.discAmount += Number(item.discAmount);
                acc.taxableAmount += Number(item.taxableAmount);
                return acc;
            }, { amount: 0, discAmount: 0, taxableAmount: 0 });

            const itemListingRows = itemListing && itemListing.length > 0
                ? itemListing.map(item => `
                <tr>
                    <td class="border border-x border-l-0 border-y-0 px-[4px] text-start">${item.itemName}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.hsnCodeName}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.batchNo ? item.batchNo : ''}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.mfgDate ? dayjs(item.mfgDate).format('MM-YYYY') : ''}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.expDate ? dayjs(item.expDate).format('MM-YYYY') : ''}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${item.qty}</td>
                    <td class="border border-x border-y-0 px-[4px] text-start">${Number(item.rate).toFixed(2)}</td>
                    <td class="border border-x border-r-0 border-y-0 px-[4px] text-start">${Number(item.amount).toFixed(2)}</td>
                </tr>
            `).join('')
                : '';

            let hcModel = await HNSCodesScHema()
            let hsnCodeList = await hcModel.find({});

            let hsnCodeListForTable = showHSNCodes(itemListing, hsnCodeList, invoiceDetails.partyId.state)

            const hsnCodeTotalCalculation = hsnCodeListForTable.reduce(
                (acc, item) => {
                    acc.taxableAmount += Number(item.taxableAmount);
                    acc.sgstAmount += Number(item.sgstAmount);
                    acc.cgstAmount += Number(item.cgstAmount);
                    acc.igstAmount += Number(item.igstAmount);
                    acc.totalAmount += Number(item.totalAmount);
                    return acc;
                },
                { taxableAmount: 0, sgstAmount: 0, cgstAmount: 0, igstAmount: 0, totalAmount: 0 }
            );

            const hsnCodeTableRows = hsnCodeListForTable && hsnCodeListForTable.length > 0
                ? hsnCodeListForTable.map(item => `
                            <tr>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x border-l-0">${item.HSNCode}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.taxableAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.SGST}%</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.sgstAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.CGST}%</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.cgstAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.IGST}%</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x">${item.igstAmount}</td>
                        <td class="px-[3px] border-gray-400 border border-y-0 border-x border-r-0">${item.totalAmount}</td>
        </tr>
            `).join('')
                : '';


            let date = new Date(invoiceDetails.invoiceDate);
            date.setDate(date.getDate() + invoiceDetails.creditDay);
            let dueDate = date.toDateString()

            let htmlTemplate = fs.readFileSync(path.join(__dirname, "..", "..", "uploads", "InvoiceTemplates", "gstInvoiceRMTemplate.html"), "utf8");

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
                    .replace('#ConCompanyName', invoiceDetails.partyId.partyName)
                    .replace('#ConRecipientState', invoiceDetails.partyId.state)
                    .replace('#ConMobielNo', mobileNo)
                    .replace('#RecipientAddress', recipientAddress)
                    .replace('#ShippedToAddress', shippedToAddress)
                    .replace('#RecipientState', invoiceDetails.partyId.state)
                    .replace('#RecpGSTNNo', invoiceDetails.partyId.gstnNo ? invoiceDetails.partyId.gstnNo : '-')
                    .replace('#FSSAINo', invoiceDetails.partyId.fssaiNo ? invoiceDetails.partyId.fssaiNo : '-')
                    .replace('#RecpDLNo', (invoiceDetails.partyId.dlNo1 !== '' ? invoiceDetails.partyId.dlNo1 : '') + (invoiceDetails.partyId.dlNo2 ? (', ' + invoiceDetails.partyId.dlNo2) : ''))
                    .replace('#MobielNo', mobileNo)
                    .replace('#TransportName', invoiceDetails.transportId.transportName)
                    .replace('#Cases', invoiceDetails.cases)
                    .replace('#Destination', invoiceDetails.partyId.city)
                    .replace('#Weight', invoiceDetails.weight)
                    .replace('#LRNo', invoiceDetails.lRNo)
                    .replace('#LRDate', dayjs(invoiceDetails.lRDate).format("DD-MM-YYYY"))
                    .replace('#RDPermitNo', invoiceDetails.roadPermitNo)
                    .replace('#InvoiceNo', invoiceDetails.invoiceNo)
                    .replace('#InvoiceDate', dayjs(invoiceDetails.invoiceDate).format("DD-MM-YYYY"))
                    .replace('#DueDate', dayjs(dueDate).format("DD-MM-YYYY"))
                    .replace('#ItemListingRows', itemListingRows)
                    .replace('#SubTotalAmount', invoiceDetails.subTotal)
                    .replace('#DisCountAmount', invoiceDetails.discount)
                    .replace('#SGSTAmount', invoiceDetails.sgst)
                    .replace('#CGSTAmount', invoiceDetails.cgst)
                    .replace('#IGSTAmount', invoiceDetails.igst)
                    .replace('#CRDRNote', invoiceDetails.crDrNote)
                    .replace('#Freight', invoiceDetails.freight && invoiceDetails.freight > 0 ? invoiceDetails.freight : 0)
                    .replace('#OtherCharges', invoiceDetails.other && invoiceDetails.other > 0 ? invoiceDetails.other : 0)
                    .replace('#RoundOffAmount', invoiceDetails.roundOff)
                    .replace('#GrandTotal', invoiceDetails.grandTotal)
                    .replace('#HSNCodeTableRows', hsnCodeTableRows)
                    .replace('#TotalSalesAmount', itemListingTotalCalculation.amount)
                    .replace('#TotalDisAmount', itemListingTotalCalculation.discAmount)
                    .replace('#TotalTaxableAmount', itemListingTotalCalculation.taxableAmount)
                    .replace('#TaxableAmountTotal', hsnCodeTotalCalculation.taxableAmount)
                    .replace('#SGSTTotalAmount', hsnCodeTotalCalculation.sgstAmount)
                    .replace('#CGSTTotalAmount', hsnCodeTotalCalculation.cgstAmount)
                    .replace('#IGSTTotalAmount', hsnCodeTotalCalculation.igstAmount)
                    .replace('#TotalGSTCalculation', hsnCodeTotalCalculation.totalAmount)
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
        `;

            const browser = await puppeteer.launch({
                headless: "new",
                args: ["--no-sandbox", "--disable-setuid-sandbox"]
            });
            const page = await browser.newPage();

            await page.setContent(htmlTemplate, { waitUntil: "load" });

            const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

            await browser.close();

            let etModel = await emailTemplateModel()
            const EmailTemplate = await etModel.findOne({ emailTemplateId: 3 });

            let html = EmailTemplate.description.replace('#CompanyName', invoiceDetails.partyId.partyName);

            let emaildata = {
                toMail: invoiceDetails.partyId.email,
                subject: EmailTemplate.emailSubject,
                fromMail: FromMail,
                html: html,
                filename: 'GSTInvoicePM',
                pdfBuffer: pdfBuffer,
                contentType: "application/pdf"
            };

            mailsender(emaildata)

            let encryptData = encryptionAPI(invoiceDetails, 1);

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Mail Sent Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });

        } else {
            let encryptData = encryptionAPI(invoiceDetails, 1);
            res.status(200).json({
                data: {
                    statusCode: 404,
                    Message: "Email is not available for this company",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }
    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

// Sales Order Entry
const addEditSalesOrderEntry = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let responseData = {}
        if (data.orderDetails.salesOrderId && data.orderDetails.salesOrderId.trim() !== '') {
            let odsoEntryModel = await orderDetailsSalesOrderEntryModel()
            const response = await odsoEntryModel.findByIdAndUpdate(data.orderDetails.salesOrderId, data.orderDetails, { new: true });
            if (response) {
                responseData.orderDetails = response;
            } else {
                responseData.orderDetails = 'Party details not found';
            }
        } else {

            let nextOrderNo = '0001';

            let odsoEntryModel = await orderDetailsSalesOrderEntryModel()
            const lastRecord = await odsoEntryModel
                .findOne()
                .sort({ orderNo: -1 })
                .select('orderNo')
                .exec();

            if (lastRecord && lastRecord.orderNo) {
                const lastNumber = parseInt(lastRecord.orderNo, 10);
                nextOrderNo = String(lastNumber + 1).padStart(4, '0');
            }

            data.orderDetails.orderNo = nextOrderNo;

            let odsoEntryModel1 = await orderDetailsSalesOrderEntryModel()
            const response = new odsoEntryModel1(data.orderDetails);
            await response.save();
            responseData.orderDetails = response;
        }

        if (data.itemDetails.itemMappingId && data.itemDetails.itemMappingId.trim() !== '') {
            data.itemDetails.salesOrderId = responseData.orderDetails._id
            let odsoimModel = await orderDetailsSalesOrderItemMappingModel()
            const response = await odsoimModel.findByIdAndUpdate(data.itemDetails.itemMappingId, data.itemDetails, { new: true });
            if (response) {
                responseData.salesOrderItemMapping = response;
            } else {
                responseData.salesOrderItemMapping = 'Material details not found';
            }
        } else {
            data.itemDetails.salesOrderId = responseData.orderDetails._id
            let odsoimModel = await orderDetailsSalesOrderItemMappingModel()
            const response = new odsoimModel(data.itemDetails);
            await response.save();
            responseData.salesOrderItemMapping = response;
        }

        let encryptData = encryptionAPI(responseData, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Sales Order Entry added/updated successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const getAllOrderDetailsItemMappingById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        console.log(reqId)
        let response = []
        if (reqId) {
            let odsoimModel = await orderDetailsSalesOrderItemMappingModel()
            response = await odsoimModel
                .find({ salesOrderId: reqId, isDeleted: false })
                .populate({
                    path: 'itemId',
                    select: 'ItemName',
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

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const getAllSalesOrderEntry = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }

        let arrangedBy = 'orderNo'

        if (data.arrangedBy && data.arrangedBy.trim() !== '') {
            arrangedBy = data.arrangedBy
        }

        let odsoEntryModel = await orderDetailsSalesOrderEntryModel()
        let response = await odsoEntryModel
            .find(queryObject)
            .sort(arrangedBy)
            .populate({
                path: 'partyId',
                select: 'partyName _id'
            });

        if (data.arrangedBy === 'partyName') {
            response = response.sort((a, b) => {
                return a.partyId?.partyName.localeCompare(b.partyId?.partyName);
            });
        }

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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const deleteSalesOrderById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let odsoEntryModel = await orderDetailsSalesOrderEntryModel()
            response = await odsoEntryModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Sales Order Detail deleted successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const deleteSalesOrderItemByItemId = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let odsoimModel = await orderDetailsSalesOrderItemMappingModel()
            response = await odsoimModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Item Detail deleted successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};


// Sales Goods Return Entry
const getSalesGoodsReturnEntryInvoiceNo = async (req, res) => {
    try {
        let response = {}
        let sgrEntryModel = await salesGoodsReturnEntryModel()
        let gstNoRecord = await sgrEntryModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select('serialNo');

        if (gstNoRecord && gstNoRecord.serialNo) {
            let lastNumber = parseInt(gstNoRecord.serialNo, 10);
            let newNumber = lastNumber + 1;

            response.serialNo = newNumber.toString().padStart(4, '0');
        } else {
            response.serialNo = '0001';
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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const getAllBatchesForItemByItemId = async (req, res) => {
    try {
        const { id } = req.query;

        let reqId = getRequestData(id)

        let queryObject = {
            isDeleted: false,
            packingItemId: reqId
        };

        let batchClrModel = await batchClearingEntryModel()
        let batchClearingData = await batchClrModel
            .find(queryObject)
            .populate({
                path: "productDetialsId",
                select: "productionNo productId batchNo packing batchSize mfgDate expDate",
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            })
            .populate({
                path: "packingItemId",
                select: "HSNCode",
            });

        const totalStock = batchClearingData.map(item => ({
            productionNo: item.productDetialsId.productionNo,
            batchClearingEntryId: item._id,
            productId: item.packingItemId._id,
            batchNo: item.productDetialsId.batchNo,
            expDate: item.productDetialsId.expDate,
            mfgDate: item.productDetialsId.mfgDate,
            quantity: item.quantity,
            mrp: item.mrp,
            hsnCode: item.packingItemId.HSNCode,
        }));

        for (let stockItem of totalStock) {
            let batchwiseProdStkModel = await batchWiseProductStockModel()
            const existingStock = await batchwiseProdStkModel.findOne({
                batchNo: stockItem.batchNo,
                batchClearingEntryId: stockItem.batchClearingEntryId,
                productId: stockItem.productId,
            });

            if (!existingStock) {
                let batchwiseProdStkModel = await batchWiseProductStockModel()
                await batchwiseProdStkModel.create(stockItem);
            }
        }

        let batchwiseProdStkModel = await batchWiseProductStockModel()
        let response = await batchwiseProdStkModel.find({
            productId: reqId,
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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const addEditSalesGoodsReturnEntry = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let responseData = {}
        if (data.salesReturnDetails.salesGoodsReturnId && data.salesReturnDetails.salesGoodsReturnId.trim() !== '') {
            // Add Edit For Invoice Details
            let sgrEntryModel = await salesGoodsReturnEntryModel()
            const response = await sgrEntryModel.findByIdAndUpdate(data.salesReturnDetails.salesGoodsReturnId, data.salesReturnDetails, { new: true });
            if (!response) {
                responseData.salesReturnDetails = 'Party details not found';
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Invoice Details Not found",
                        responseData: encryptData,
                        isEnType: true,
                    },
                });
            }


            // Stock Updating
            try {
                await Promise.all(data.itemListing.map(async (item) => {
                    if (item.stockUpgrade === 'yes' || item.stockUpgrade === 'Yes') {
                        const totalReduceQty = (Number(item.qty) || 0) + (Number(item.free) || 0);
                        let sgrItemsModel = await salesGoodsReturnItemsModel()
                        const existingItemDetails = await sgrItemsModel.findOne({ _id: item._id, isDeleted: false });

                        if (existingItemDetails) {
                            const existingQty = (Number(existingItemDetails.qty) || 0) + (Number(existingItemDetails.free) || 0);
                            const updatedQty = existingQty - totalReduceQty;

                            let batchwiseProdStkModel = await batchWiseProductStockModel()
                            await batchwiseProdStkModel.findByIdAndUpdate(
                                item.stockId,
                                { $inc: { quantity: -updatedQty } },
                                { new: true }
                            );
                        } else {
                            let batchwiseProdStkModel = await batchWiseProductStockModel()
                            await batchwiseProdStkModel.findByIdAndUpdate(
                                item.stockId,
                                { $inc: { quantity: totalReduceQty } },
                                { new: true }
                            );
                        }
                    }
                }));

                // After Stock Updating, proceed with Invoice Item Details
                let sgrItemsModel = await salesGoodsReturnItemsModel()
                await sgrItemsModel.deleteMany({ salesGoodsReturnId: response._id });

                const items = data.itemListing.map(item => ({
                    ...item,
                    salesGoodsReturnId: response._id
                }));

                let sgrItemsModel1 = await salesGoodsReturnItemsModel()
                await sgrItemsModel1.insertMany(items);

                responseData.salesReturnDetails = response;
                let encryptData = encryptionAPI(responseData, 1);

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Invoice Details Updated Successfully",
                        responseData: encryptData,
                        isEnType: true,
                    },
                });

            } catch (error) {
                console.log("Error in Despatch controller", error);
                errorHandler(error, req, res, "Error in Despatch controller")
            }

        } else {
            // Add Edit For Invoice Details
            let sgrEntryModel = await salesGoodsReturnEntryModel()
            const response = new sgrEntryModel(data.salesReturnDetails);
            await response.save();

            responseData.salesReturnDetails = response;

            const items = data.itemListing.map(item => ({
                ...item,
                salesGoodsReturnId: response._id
            }));

            // Add Edit For Invoice Item Details
            let sgrItemsModel = await salesGoodsReturnItemsModel()
            await sgrItemsModel.insertMany(items);

            let encryptData = encryptionAPI(responseData, 1);

            res.status(200).json({
                data: {

                    statusCode: 200,
                    Message: "Invoice Details Inserted Successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });

            // Stock Updating
            for (let item of data.itemListing) {
                if (item.stockUpgrade === 'yes' || item.stockUpgrade === 'Yes') {
                    let totalReduceQty = (Number(item.qty) || 0) + (Number(item.free) || 0)
                    let batchwiseProdStkModel = await batchWiseProductStockModel()
                    await batchwiseProdStkModel.findByIdAndUpdate(
                        item.stockId,
                        { $inc: { quantity: totalReduceQty } },
                        { new: true });
                }
            }
        }

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const getAllSalesGoodsReturnEntry = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }

        let sortBy = 'serialNo'

        if (data.invoiceNo && data.invoiceNo.trim() !== "") {
            queryObject.invoiceNo = { $regex: `^${data.invoiceNo}`, $options: "i" };
        }

        if (data.arrangedBy && data.arrangedBy.trim() !== "") {
            sortBy = data.arrangedBy;
        }

        let response = []
        let sgrEntryModel = await salesGoodsReturnEntryModel()
        response = await sgrEntryModel
            .find(queryObject)
            .sort(sortBy)
            .populate({
                path: 'partyId',
                select: 'partyName',
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });

        if (data.arrangedBy === 'partyName') {
            response = response.sort((a, b) => {
                return a.partyId?.partyName.localeCompare(b.partyId?.partyName);
            });
        }

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
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

const getSalesGoodsReturnDetailsById = async (req, res) => {
    try {
        const { id } = req.query;

        let reqId = getRequestData(id)

        let sgrEntryModel = await salesGoodsReturnEntryModel()
        let salesReturnDetails = await sgrEntryModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: "partyId",
                select: "partyName",
            })
            .populate({
                path: "transportId",
                select: "transportName",
            });

        let sgrItemsModel = await salesGoodsReturnItemsModel()
        let itemListing = await sgrItemsModel
            .find({ salesGoodsReturnId: reqId, isDeleted: false });

        let response = {
            salesReturnDetails: salesReturnDetails,
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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const deleteSalesGoodsReturnItemById = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        // Stock Updating
        if (item.stockUpgrade === 'yes' || item.stockUpgrade === 'Yes') {
            let totalReduceQty = (Number(data.qty) || 0) + (Number(data.free) || 0)
            let batchwiseProdStkModel = await batchWiseProductStockModel()
            await batchwiseProdStkModel.findByIdAndUpdate(
                data.stockId,
                { $inc: { quantity: -totalReduceQty } },
                { new: true });
        }
        // Removing Particualr Item From GST Invoice
        let sgrItemsModel = await salesGoodsReturnItemsModel()
        let response = await sgrItemsModel.findByIdAndUpdate(data.gstInvoiceBatchId, { isDeleted: true })


        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Item Deleted successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const deleteSalesGoodsReturnById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)

        let sgrItemsModel = await salesGoodsReturnItemsModel()
        let itemList = await sgrItemsModel.find({ salesGoodsReturnId: reqId })

        itemList.map(async item => {
            // Stock Updating
            if (item.stockUpgrade === 'yes' || item.stockUpgrade === 'Yes') {
                let totalReduceQty = (Number(item.qty) || 0) + (Number(item.free) || 0)
                let batchwiseProdStkModel = await batchWiseProductStockModel()
                await batchwiseProdStkModel.findByIdAndUpdate(
                    item.stockId,
                    { $inc: { quantity: -totalReduceQty } },
                    { new: true });
            }
            // Removing Particualr Item From GST Invoice
            let sgrItemsModel = await salesGoodsReturnItemsModel()
            await sgrItemsModel.findByIdAndUpdate(item._id, { isDeleted: true })
        })

        // Removing GST Invoice Finish Goods Record
        let sgrEntryModel = await salesGoodsReturnEntryModel()
        let response = await sgrEntryModel.findByIdAndUpdate(reqId, { isDeleted: true })

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Sales Goods Return Details Deleted Successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const getCompanyAddressByCompanyId = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)

        let pModel = await partyModel()
        let response = await pModel.findOne({ _id: reqId });

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Sales Goods Return Details Deleted Successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

// Reports - Party Wise Despatch Report
const getAllPartyWiseDespatchItem = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }
        console.log(data.partyName)
        if (data.startDate && data.endDate) {
            queryObject.invoiceDate = {
                $gte: new Date(data.startDate),
                $lte: new Date(data.endDate),
            };
        }

        let gifgModel = await gstInvoiceFinishGoodsModel();
        let gstInvoiceFinishGoodsResponse = await gifgModel
            .find(queryObject)
            .select('partyId grandTotal invoiceNo invoiceDate transportId lRNo lRDate')
            .populate({
                path: 'partyId',
                select: 'partyName',
                match: data.partyName ? { partyName: { $regex: data.partyName, $options: 'i' } } : {},
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });

        gstInvoiceFinishGoodsResponse = gstInvoiceFinishGoodsResponse.filter(
            (invoice) => invoice.partyId
        );

        let invoiceNoMap = gstInvoiceFinishGoodsResponse.reduce((acc, record) => {
            acc[record._id] = {
                invoiceNo: record.invoiceNo,
                invoiceDate: record.invoiceDate,
                transportName: record.transportId?.transportName || null,
                lRNo: record.lRNo,
                lRDate: record.lRDate,
            };
            return acc;
        }, {});

        let reqIds = gstInvoiceFinishGoodsResponse.map(record => record._id);

        let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
        let itemListing = await gifinishGoodsITemModel
            .find({ gstInvoiceFinishGoodsId: { $in: reqIds }, isDeleted: false })
            .lean();

        itemListing.forEach(item => {
            let invoiceData = invoiceNoMap[item.gstInvoiceFinishGoodsId] || {};
            item.invoiceNo = invoiceData.invoiceNo || null;
            item.invoiceDate = invoiceData.invoiceDate || null;
            item.transportName = invoiceData.transportName || null;
            item.lRNo = invoiceData.lRNo || null;
            item.lRDate = invoiceData.lRDate || null;
        });

        let response = {
            gstInvoiceFinishGoodsResponse: gstInvoiceFinishGoodsResponse,
            itemListing: itemListing
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
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

const getAllPartyWiseDespatchItemById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)

        let gifgModel = await gstInvoiceFinishGoodsModel();
        let invoiceDetails = await gifgModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: "partyId",
                select: "partyName",
            })
            .populate({
                path: "transportId",
                select: "transportName",
            });

        let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
        let itemListing = await gifinishGoodsITemModel
            .find({ gstInvoiceFinishGoodsId: reqId, isDeleted: false });

        let updatedItemListing = itemListing.map(item => ({
            ...item.toObject(),
            invoiceNo: invoiceDetails?.invoiceNo || null,
            invoiceDate: invoiceDetails?.invoiceDate || null,
            transportName: invoiceDetails?.transportId?.transportName || null,
            lRDate: invoiceDetails?.lRDate || null,
            lRNo: invoiceDetails?.lRNo || null,
            grandTotal: invoiceDetails?.grandTotal || null
        }));

        let response = updatedItemListing;

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
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

// Reports - Item Wise Despatch Report
const getAllItemWiseDesptach = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }

        if (data.startDate && data.endDate) {
            queryObject.invoiceDate = {
                $gte: new Date(data.startDate),
                $lte: new Date(data.endDate),
            };
        }

        let gifgModel = await gstInvoiceFinishGoodsModel();
        let gstInvoiceFinishGoodsResponse = await gifgModel
            .find(queryObject)
            .select('partyId grandTotal invoiceNo invoiceDate transportId lRNo lRDate')
            .populate({
                path: 'partyId',
                select: 'partyName',
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });

        gstInvoiceFinishGoodsResponse = gstInvoiceFinishGoodsResponse.filter(
            (invoice) => invoice.partyId
        );

        let reqIds = gstInvoiceFinishGoodsResponse?.map(record => record._id) || [];

        let queryObjectForItem = { isDeleted: false }

        if (reqIds.length > 0) {
            queryObjectForItem = {
                ...queryObjectForItem,
                gstInvoiceFinishGoodsId: { $in: reqIds }
            };
        }

        let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
        let gstInvoiceFinishGoodsItemListing = await gifinishGoodsITemModel.aggregate([
            {
                $match: {
                    ...queryObjectForItem,
                    itemName: data.itemName ? { $regex: data.itemName, $options: 'i' } : { $exists: true }
                }
            },
            {
                $lookup: {
                    from: "gstinvoicefinishgoods", // Collection name of gstInvoiceFinishGoodsModel
                    localField: "gstInvoiceFinishGoodsId",
                    foreignField: "_id",
                    as: "invoice"
                }
            },
            {
                $unwind: "$invoice"
            },
            {
                $group: {
                    _id: "$itemName",
                    totalQty: { $sum: "$qty" },
                    totalFree: { $sum: "$free" },
                    totalAmount: { $sum: "$amount" },
                    grandTotal: { $sum: "$invoice.grandTotal" },
                    gstInvoiceFinishGoodsId: { $first: "$gstInvoiceFinishGoodsId" },
                    originalId: { $first: "$_id" },
                    itemId: { $first: "$itemId" }
                }
            },
            {
                $project: {
                    _id: 0,
                    itemName: "$_id",
                    totalQty: 1,
                    totalFree: 1,
                    totalAmount: 1,
                    grandTotal: 1,
                    gstInvoiceFinishGoodsId: 1,
                    originalId: 1,
                    itemId: 1,
                }
            }
        ]);

        // let invoicePromises = gstInvoiceFinishGoodsItemListing.map(async (item) => {
        //     if (item.gstInvoiceFinishGoodsId) {
        //         let invoice = await gifgModel.findById(item.gstInvoiceFinishGoodsId).select("grandTotal");
        //         console.log(invoice)
        //         item.grandTotal = invoice ? invoice.grandTotal : 0;
        //     } else {
        //         item.grandTotal = 0;
        //     }
        //     return item;
        // });
        // gstInvoiceFinishGoodsItemListing = await Promise.all(invoicePromises);

        let ids = gstInvoiceFinishGoodsItemListing.map(record => record.itemId);
        let gifinishGoodsITemModel1 = await gstInvoiceFinishGoodsItemsModel()
        let itemListing = await gifinishGoodsITemModel1
            .find({ itemId: { $in: ids }, isDeleted: false })
            .populate({
                path: 'gstInvoiceFinishGoodsId',
                select: 'partyId grandTotal invoiceNo invoiceDate transportId lRNo lRDate',
                populate: [
                    {
                        path: 'transportId',
                        select: 'transportName',
                    },
                    {
                        path: 'partyId',
                        select: 'partyName',
                    }
                ],
            });


        let response = {
            gstInvoiceFinishGoodsItemListing: gstInvoiceFinishGoodsItemListing,
            itemListing: itemListing
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
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

// Reports - Item Wise Monthly Sales
const getALLItemWiseMonthlySales = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }

        let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
        let gstInvoiceFinishGoodsItemListing = await gifinishGoodsITemModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "gstinvoicefinishgoods",
                    localField: "gstInvoiceFinishGoodsId",
                    foreignField: "_id",
                    as: "invoice"
                }
            },
            { $unwind: "$invoice" },
            {
                $group: {
                    _id: {
                        itemId: "$itemId",
                        itemName: "$itemName",
                        month: { $dateToString: { format: "%m", date: "$invoice.invoiceDate" } }
                    },
                    totalSold: { $sum: "$qty" },
                    totalFree: { $sum: "$free" },
                    totalAmount: { $sum: "$invoice.grandTotal" }
                }
            },
            {
                $group: {
                    _id: { itemId: "$_id.itemId", itemName: "$_id.itemName" },
                    sales: { $push: { month: "$_id.month", sold: "$totalSold", free: "$totalFree", amount: "$totalAmount" } }
                }
            },
            {
                $project: {
                    _id: 0,
                    Id: "$_id.itemId",
                    itemName: "$_id.itemName",
                    salesData: {
                        $arrayToObject: {
                            $map: {
                                input: "$sales",
                                as: "sale",
                                in: [
                                    { $concat: ["$$sale.month"] },
                                    { sold: "$$sale.sold", free: "$$sale.free", amount: "$$sale.amount" }
                                ]
                            }
                        }
                    }
                }
            }
        ]);

        if (data.itemName && data.itemName.trim() !== "") {
            gstInvoiceFinishGoodsItemListing = gstInvoiceFinishGoodsItemListing.filter((item) =>
                item?.itemName
                    ?.toLowerCase()
                    .startsWith(data.itemName.toLowerCase())
            );
        }

        let encryptData = encryptionAPI(gstInvoiceFinishGoodsItemListing, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

// Reports - Party Wise Monthly Sales
const getAllPartyWiseMonthlySalesByPartyId = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)
        let queryObject = { isDeleted: false }
        let reqIdObjectId = new mongoose.Types.ObjectId(reqId);

        let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
        let gstInvoiceFinishGoodsItemListing = await gifinishGoodsITemModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "gstinvoicefinishgoods",
                    localField: "gstInvoiceFinishGoodsId",
                    foreignField: "_id",
                    as: "invoice"
                }
            },
            { $unwind: "$invoice" },
            {
                $match: {
                    "invoice.partyId": reqIdObjectId
                }
            },
            {
                $group: {
                    _id: {
                        itemId: "$itemId",
                        itemName: "$itemName",
                        month: { $dateToString: { format: "%m", date: "$invoice.invoiceDate" } }
                    },
                    totalSold: { $sum: "$qty" },
                    totalFree: { $sum: "$free" },
                    totalAmount: { $sum: "$amount" },
                    partyId: { $first: "$invoice.partyId" }
                }
            },
            {
                $group: {
                    _id: { itemId: "$_id.itemId", itemName: "$_id.itemName" },
                    sales: { $push: { month: "$_id.month", sold: "$totalSold", free: "$totalFree", amount: "$totalAmount", partyId: "$partyId" } }
                }
            },
            {
                $project: {
                    _id: 0,
                    Id: "$_id.itemId",
                    itemName: "$_id.itemName",
                    salesData: {
                        $arrayToObject: {
                            $map: {
                                input: "$sales",
                                as: "sale",
                                in: [
                                    { $concat: ["$$sale.month"] },
                                    { sold: "$$sale.sold", free: "$$sale.free", amount: "$$sale.amount", partyId: "$$sale.partyId" }
                                ]
                            }
                        }
                    }
                }
            }
        ]);
        let encryptData = encryptionAPI(gstInvoiceFinishGoodsItemListing, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

// Reports - Stock Statement Report
const getAllStockStatementReport = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }

        let batchwiseProdStkModel = await batchWiseProductStockModel()
        const response = await batchwiseProdStkModel.find(queryObject)
            .populate({
                path: 'productId',
                select: 'ItemName',
            });

        const groupedResponse = Object.values(
            response.reduce((acc, item) => {
                const productId = item.productId._id.toString();
                if (!acc[productId]) {
                    acc[productId] = {
                        productId: item.productId._id,
                        itemName: item.productId.ItemName,
                        batchClearingEntryId: item.batchClearingEntryId,
                        mrp: item.mrp,
                        batchNo: item.batchNo,
                        totalQty: 0,
                        items: []
                    };
                }
                acc[productId].totalQty += item.quantity;
                acc[productId].items.push(item);
                return acc;
            }, {})
        );

        // let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
        // for (const details of groupedResponse) {
        //     let issuedItemStock = await gifinishGoodsITemModel.find({ batchClearingEntryId: details.batchClearingEntryId, isDeleted: false }).select('qty free');
        //     console.log("issuedItemStock", issuedItemStock)

        //     let totalReduceQty = issuedItemStock.reduce((sum, item) => {
        //         return sum + Number(item.qty || 0) + Number(item.free || 0);
        //     }, 0);

        //     details.totalQty = (Number(details.totalQty) || 0) - totalReduceQty;
        // }

        let encryptData = encryptionAPI(groupedResponse, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

const getALLStockStatementByProductId = async (req, res) => {
    try {
        const { id, id2 } = req.query;

        let itemId = getRequestData(id)
        let batchClearingEntryId = getRequestData(id2)

        // Batch Cleared Products
        let batchClrModel = await batchClearingEntryModel()
        let productionStock = await batchClrModel
            .find({ packingItemId: itemId, isDeleted: false })
            .select('quantity productDetialsId createdAt isFromOpeningStock')
            .populate({
                path: "productDetialsId",
                select: "productionNo productId partyId batchNo despDate",
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });

        // Invoice Generated Products
        let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
        let issuedItemStock = await gifinishGoodsITemModel
            .find({ itemId: itemId, isDeleted: false })
            .select('qty batchNo gstInvoiceFinishGoodsId free createdAt')
            .populate({
                path: "gstInvoiceFinishGoodsId",
                select: "partyId invoiceNo invoiceDate",
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });

        // Sales Goods Return Products
        let sgrItemsModel = await salesGoodsReturnItemsModel()
        let salesGoodsReturnEntry = await sgrItemsModel
            .find({ itemId: itemId, isDeleted: false })
            .select('qty batchNo salesGoodsReturnId free createdAt invoiceNo invoiceDate')
            .populate({
                path: "salesGoodsReturnId",
                select: "partyId serialNo returnDate",
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });;

        const newArray = [
            ...productionStock.map(item => ({
                productionStockId: item._id,
                issuedStockId: null,
                salesGoodsReturnEntryId: null,
                partyName: item?.productDetialsId?.partyId.partyName,
                refNo: item?.productDetialsId?.productionNo,
                batchNo: item?.productDetialsId?.batchNo,
                refDate: item?.productDetialsId?.despDate,
                produceedQty: item.quantity,
                issuedQty: null,
                createdAt: item.createdAt,
                from: (item?.isFromOpeningStock && item?.isFromOpeningStock === true) ? 'Opening Stock' : 'Cleared Batches'
            })),
            ...issuedItemStock.map(item => ({
                productionStockId: null,
                issuedStockId: item._id,
                salesGoodsReturnEntryId: null,
                partyName: item?.gstInvoiceFinishGoodsId?.partyId?.partyName,
                refNo: item?.gstInvoiceFinishGoodsId?.invoiceNo,
                batchNo: item.batchNo,
                refDate: item?.gstInvoiceFinishGoodsId?.invoiceDate,
                issuedQty: item.qty + item.free,
                produceedQty: null,
                createdAt: item.createdAt,
                from: 'GST Invoice'
            })),
            ...salesGoodsReturnEntry.map(item => ({
                productionStockId: null,
                issuedStockId: null,
                salesGoodsReturnEntryId: item._id,
                partyName: item?.salesGoodsReturnId?.partyId?.partyName,
                refNo: item?.salesGoodsReturnId?.serialNo,
                batchNo: item.batchNo,
                refDate: item?.salesGoodsReturnId?.returnDate,
                issuedQty: null,
                produceedQty: item.qty + item.free,
                createdAt: item.createdAt,
                from: 'Sales Return'
            }))
        ];
        console.log(salesGoodsReturnEntry)
        const sortedArray = newArray.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        let encryptData = encryptionAPI(sortedArray, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

const getAllBatchWiseStockStatementReport = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }

        let batchwiseProdStkModel = await batchWiseProductStockModel()
        const response = await batchwiseProdStkModel.find(queryObject)
            .populate({
                path: 'productId',
                select: 'ItemName',
            });

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
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

// Reports - Stock Ledger Report
const getAllStockLedgerReport = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let batchClrModel = await batchClearingEntryModel()
        let productionStock = await batchClrModel
            .find({ packingItemId: data.itemId, isDeleted: false })
            .select('quantity productDetialsId updatedAt')
            .populate({
                path: "productDetialsId",
                select: "productionNo productId partyId batchNo despDate",
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });

        let gifinishGoodsITemModel = await gstInvoiceFinishGoodsItemsModel()
        let issuedItemStock = await gifinishGoodsITemModel
            .find({ itemId: data.itemId, isDeleted: false })
            .select('qty batchNo gstInvoiceFinishGoodsId free updatedAt')
            .populate({
                path: "gstInvoiceFinishGoodsId",
                select: "partyId invoiceNo invoiceDate",
                populate: {
                    path: 'partyId',
                    select: 'partyName _id',
                },
            });

        const newArray = [
            ...productionStock.map(item => ({
                productionStockId: item._id,
                issuedStockId: null,
                partyName: 'SELF PRODUCTION',
                partyId: '1',
                refNo: item.productDetialsId.productionNo,
                batchNo: item.productDetialsId.batchNo,
                refDate: item.productDetialsId.despDate,
                updatedAt: item.updatedAt,
                produceedQty: item.quantity,
                issuedQty: null,
                isFreeQty: null
            })),
            ...issuedItemStock.map(item => ({
                productionStockId: null,
                issuedStockId: item._id,
                partyName: item.gstInvoiceFinishGoodsId.partyId.partyName,
                partyId: item.gstInvoiceFinishGoodsId.partyId._id,
                refNo: item.gstInvoiceFinishGoodsId.invoiceNo,
                batchNo: item.batchNo,
                refDate: item.gstInvoiceFinishGoodsId.invoiceDate,
                updatedAt: item.updatedAt,
                issuedQty: item.qty,
                produceedQty: null,
                isFreeQty: item.free
            }))
        ];
        const sortedArray = newArray.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));

        let encryptData = encryptionAPI(sortedArray, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

const getAllStockLedgerReportBatchStock = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
            productId: data.itemId
        }

        let batchwiseProdStkModel = await batchWiseProductStockModel()
        const response = await batchwiseProdStkModel.find(queryObject)
            .populate({
                path: 'productId',
                select: 'ItemName',
            })
            .sort({ updatedAt: -1 });;


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
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};

// Near Expiry Stock Report
const getAllNearExpiryStockReport = async (req, res) => {
    try {
        let data = req.body.data
        let reqData = getRequestData(data, 'PostApi')
        let queryObject = {
            isDeleted: false,
        };

        let batchwiseProdStkModel = await batchWiseProductStockModel()
        const response = await batchwiseProdStkModel.find(queryObject)
            .populate({
                path: 'productId',
                select: 'ItemName',
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
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const addEditInwardPost = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let iwpModel = await inwardPostModel()
            const response = await iwpModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Inward Post updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

            } else {
                res.status(404).json({ Message: "Inward Post not found" });
            }
        } else {
            let iwpModel = await inwardPostModel()
            const response = new iwpModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Inward Post added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const getAllInwardPost = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
        };
        let sortOption = { date: 1 };
        if (data.arrangedBy && data.arrangedBy.trim() !== '') {

            sortOption = { [data.arrangedBy]: 1 };

        }

        let iwpModel = await inwardPostModel()
        let response = await iwpModel.aggregate([
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
                    date: 1,
                    courier: 1,
                    podNo: 1,
                    narration: 1,
                    partyName: "$partyDetails.partyName",
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
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
    } catch (error) {
        console.log("Error in despatch controller", error);
        errorHandler(error, req, res, "Error in despatch controller")
    }
};
const getInwardPostById = async (req, res) => {
    try {

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let iwpModel = await inwardPostModel()
            response = await iwpModel.findOne({ _id: reqId });
        }
        console.log(response)

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Inward Post fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("Error in despatch controller", error);
        errorHandler(error, req, res, "Error in dispatch controller")
    }
};
const deleteInwardPostById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)

        // Removing GST Invoice Finish Goods Record
        let iwpModel = await inwardPostModel()
        let response = await iwpModel.findByIdAndUpdate(reqId, { isDeleted: true })

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Inward Post Details Deleted Successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};
const addEditOutwardPost = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        if (data._id && data._id.trim() !== '') {
            let owpModel = await outwardPostModel()
            const response = await owpModel.findByIdAndUpdate(data._id, data, { new: true });
            if (response) {

                let encryptData = encryptionAPI(response, 1)

                res.status(200).json({
                    data: {
                        statusCode: 200,
                        Message: "Outward Post updated successfully",
                        responseData: encryptData,
                        isEnType: true
                    },
                });

            } else {
                res.status(404).json({ Message: "Outward Post not found" });
            }
        } else {
            let owpModel = await outwardPostModel()
            const response = new owpModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1)

            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Outward Post added successfully",
                    responseData: encryptData,
                    isEnType: true
                },
            });
        }

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};
const getAllOutwardPost = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = {
            isDeleted: false,
        };
        let sortOption = { date: 1 };
        if (data.arrangedBy && data.arrangedBy.trim() !== '') {

            sortOption = { [data.arrangedBy]: 1 };

        }

        let owpModel = await outwardPostModel()
        let response = await owpModel.aggregate([
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
                    date: 1,
                    courier: 1,
                    podNo: 1,
                    narration: 1,
                    partyName: "$partyDetails.partyName",
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
                Message: "Data fetch successfully",
                responseData: encryptData,
                isEnType: true
            },
        });
    } catch (error) {
        console.log("Error in despatch controller", error);
        errorHandler(error, req, res, "Error in dispatch controller")
    }
};
const getOutwardPostById = async (req, res) => {
    try {

        const { id } = req.query;
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            let owpModel = await outwardPostModel()
            response = await owpModel.findOne({ _id: reqId });
        }


        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Outward Post fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

        // res.status(201).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("Error in despatch controller", error);
        errorHandler(error, req, res, "Error in dispatch controller")
    }
};
const deleteOutwardPostById = async (req, res) => {
    try {
        const { id } = req.query;
        let reqId = getRequestData(id)

        // Removing GST Invoice Finish Goods Record
        let owpModel = await outwardPostModel()
        let response = await owpModel.findByIdAndUpdate(reqId, { isDeleted: true })

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Inward Post Details Deleted Successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in Despatch controller", error);
        errorHandler(error, req, res, "Error in Despatch controller")
    }
};

const getAllInwardOutwardRegister = async (req, res) => {
    try {
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        let queryObject = { isDeleted: false }

        if (data.startDate && data.endDate) {
            queryObject.date = {
                $gte: new Date(data.startDate),
                $lte: new Date(data.endDate),
            };
        }
        if (data.partyId && data.partyId !== null && data.partyId !== "") {
            queryObject.partyId = data.partyId
        }
        let Response = []
        let iwpModel = await inwardPostModel()
        let inwardData = await iwpModel
            .find(queryObject)
            .populate({
                path: 'partyId',
                select: 'partyName',
            })
            .lean();
        const updatedInwardData = inwardData.map((x) => ({
            ...x,
            category: "Inward"
        }));

        let owpModel = await outwardPostModel()
        let outwardData = await owpModel
            .find(queryObject)
            .populate({
                path: 'partyId',
                select: 'partyName',
            })
            .lean();
        const updatedOutwardData = outwardData.map((x) => ({
            ...x,
            category: "Outward"
        }));

        if (data.category === "inward") {
            Response = updatedInwardData
        } else if (data.category === "outward") {
            Response = updatedOutwardData
        } else {
            Response = [...updatedInwardData, ...updatedOutwardData]
        }


        let encryptData = encryptionAPI(Response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Items fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Despatch Controller", error);
        errorHandler(error, req, res, "Error in Despatch Controller")
    }
};


export {
    getProductionStockByProductId,
    getGSTInvoiceFinishGoodsInvoiceNo,
    addEditGSTInvoiceFinishGoods,
    getAllGSTInvoiceFinishGoodsRecords,
    getGSTInvoiceFinishGoodsById,
    deleteItemFromDBById,
    deleteInvoiceById,
    generateGSTInvoiceForFinishGoodsById,
    sendGSTInvoiceFinishGoodsToClient,
    getGSTInvoiceRMInvoice,
    getrawMaterialStockByRMId,
    addEditInvoiceRM,
    getAllGSTInvoiceRMRecords,
    getGSTInvoiceRMById,
    deleteRMItemFromDBById,
    deleteRMInvoiceById,
    generateGSTInvoiceForRMById,
    getPakcingMaterialStockByPMID,
    getGSTInvoicePMInvoiceNo,
    addEditInvoicePM,
    getAllGSTInvoicePMRecords,
    getGSTInvoicePMById,
    deletePMItemFromDBById,
    deletePMInvoiceById,
    generateGSTInvoiceForPMById,
    sendGSTInvoicePMToClient,
    addEditSalesOrderEntry,
    getAllOrderDetailsItemMappingById,
    getAllSalesOrderEntry,
    deleteSalesOrderById,
    deleteSalesOrderItemByItemId,
    getAllBatchesForItemByItemId,
    getSalesGoodsReturnEntryInvoiceNo,
    addEditSalesGoodsReturnEntry,
    getAllSalesGoodsReturnEntry,
    getSalesGoodsReturnDetailsById,
    deleteSalesGoodsReturnItemById,
    deleteSalesGoodsReturnById,
    getCompanyAddressByCompanyId,
    getAllPartyWiseDespatchItem,
    getAllPartyWiseDespatchItemById,
    getAllItemWiseDesptach,
    getALLItemWiseMonthlySales,
    getAllPartyWiseMonthlySalesByPartyId,
    getAllStockStatementReport,
    getALLStockStatementByProductId,
    getAllBatchWiseStockStatementReport,
    getAllStockLedgerReport,
    getAllStockLedgerReportBatchStock,
    getAllNearExpiryStockReport,
    addEditInwardPost,
    getAllInwardPost,
    getInwardPostById,
    deleteInwardPostById,
    addEditOutwardPost,
    getAllOutwardPost,
    getOutwardPostById,
    deleteOutwardPostById,
    getAllInwardOutwardRegister,
    sendGSTInvoiceRMToClient
};
