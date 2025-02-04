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

        let batchClearingData = await batchClearingEntryModel
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
            const existingStock = await batchWiseProductStockModel.findOne({
                batchNo: stockItem.batchNo,
                batchClearingEntryId: stockItem.batchClearingEntryId,
                productId: stockItem.productId,
            });

            if (!existingStock) {
                await batchWiseProductStockModel.create(stockItem);
            }
        }

        let response = await batchWiseProductStockModel.find({
            productId: reqId,
            quantity: { $gt: 0 }
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

const getGSTInvoiceFinishGoodsInvoiceNo = async (req, res) => {
    try {
        let response = {}
        let gstNoRecord = await gstInvoiceFinishGoodsModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select('invoiceNo');

        if (gstNoRecord && gstNoRecord.invoiceNo) {
            let lastNumber = parseInt(gstNoRecord.invoiceNo.replace('SI', ''), 10);
            let newNumber = lastNumber + 1;

            response.invoiceNo = `SI${newNumber.toString().padStart(4, '0')}`;
        } else {
            response.invoiceNo = 'SI0001';
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
            const response = await gstInvoiceFinishGoodsModel.findByIdAndUpdate(data.invoiceDetails.gstInvoiceFinishGoodsId, data.invoiceDetails, { new: true });
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

                    const existingItemDetails = await gstInvoiceFinishGoodsItemsModel.findOne({ _id: item._id, isDeleted: false });

                    if (existingItemDetails) {
                        const existingQty = (Number(existingItemDetails.qty) || 0) + (Number(existingItemDetails.free) || 0);
                        const updatedQty = existingQty - totalReduceQty;

                        await batchWiseProductStockModel.findByIdAndUpdate(
                            item.stockId,
                            { $inc: { quantity: updatedQty } },
                            { new: true }
                        );
                    } else {
                        await batchWiseProductStockModel.findByIdAndUpdate(
                            item.stockId,
                            { $inc: { quantity: -totalReduceQty } },
                            { new: true }
                        );
                    }
                }));

                // After Stock Updating, proceed with Invoice Item Details
                await gstInvoiceFinishGoodsItemsModel.deleteMany({ gstInvoiceFinishGoodsId: response._id });

                const items = data.itemListing.map(item => ({
                    ...item,
                    gstInvoiceFinishGoodsId: response._id
                }));

                await gstInvoiceFinishGoodsItemsModel.insertMany(items);

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
            const response = new gstInvoiceFinishGoodsModel(data.invoiceDetails);
            await response.save();

            responseData.invoiceDetails = response;

            const items = data.itemListing.map(item => ({
                ...item,
                gstInvoiceFinishGoodsId: response._id
            }));

            // Add Edit For Invoice Item Details
            await gstInvoiceFinishGoodsItemsModel.insertMany(items);

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
                let totalReduceQty = (Number(item.qty) || 0) + (Number(item.free) || 0)
                await batchWiseProductStockModel.findByIdAndUpdate(
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
        response = await gstInvoiceFinishGoodsModel
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
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getGSTInvoiceFinishGoodsById = async (req, res) => {
    try {
        const { id } = req.query;

        let reqId = getRequestData(id)

        let invoiceDetails = await gstInvoiceFinishGoodsModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: "partyId",
                select: "partyName",
            })
            .populate({
                path: "transportId",
                select: "transportName",
            });

        let itemListing = await gstInvoiceFinishGoodsItemsModel
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
        await batchWiseProductStockModel.findByIdAndUpdate(
            data.stockId,
            { $inc: { quantity: +totalReduceQty } },
            { new: true });

        // Removing Particualr Item From GST Invoice
        let response = await gstInvoiceFinishGoodsItemsModel.findByIdAndUpdate(data.gstInvoiceBatchId, { isDeleted: true })


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

        let itemList = await gstInvoiceFinishGoodsItemsModel.find({ gstInvoiceFinishGoodsId: reqId })

        itemList.map(async item => {
            // Stock Updating
            let totalReduceQty = (Number(item.qty) || 0) + (Number(item.free) || 0)
            await batchWiseProductStockModel.findByIdAndUpdate(
                item.stockId,
                { $inc: { quantity: +totalReduceQty } },
                { new: true });

            // Removing Particualr Item From GST Invoice
            await gstInvoiceFinishGoodsItemsModel.findByIdAndUpdate(item._id, { isDeleted: true })
        })

        // Removing GST Invoice Finish Goods Record
        let response = await gstInvoiceFinishGoodsModel.findByIdAndUpdate(reqId, { isDeleted: true })

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

        const { id } = req.query;
        let reqId = getRequestData(id)

        let invoiceDetails = await gstInvoiceFinishGoodsModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: 'partyId',
                select: 'partyName address1 address2 address3 address4 corrspAddress1 corrspAddress2 corrspAddress3 corrspAddress4 state pinCode gstnNo mobileNo1 mobileNo2 crdays person dlNo1 dlNo2 fssaiNo bankName city',
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });

        let itemListing = await gstInvoiceFinishGoodsItemsModel
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
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${item.itemName}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${item.packing}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${item.hsnCodeName}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${item.batchNo}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${dayjs(item.expDate).format('MM-YYYY')}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${dayjs(item.expDate).format('MM-YYYY')}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${Number(item.mrp).toFixed(2)}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${item.qty}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${item.free}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${Number(item.rate).toFixed(2)}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${Number(item.amount).toFixed(2)}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${Number(item.discAmount).toFixed(2)}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-right">${Number(item.taxableAmount).toFixed(2)}</td>
                </tr>
            `).join('')
            : '';

        let hsnCodeList = await HNSCodesScHema.find({});

        let hsnCodeListForTable = showHSNCodes(itemListing, hsnCodeList)

        const hsnCodeTotalCalculation = hsnCodeListForTable.reduce(
            (acc, item) => {
                acc.taxableAmount += Number(item.taxableAmount);
                acc.sgstAmount += Number(item.sgstAmount);
                acc.cgstAmount += Number(item.cgstAmount);
                acc.totalAmount += Number(item.totalAmount);
                return acc;
            },
            { taxableAmount: 0, sgstAmount: 0, cgstAmount: 0, totalAmount: 0 }
        );

        const hsnCodeTableRows = hsnCodeListForTable && hsnCodeListForTable.length > 0
            ? hsnCodeListForTable.map(item => `
                <tr>
                    <td class="px-[5px]">${item.HSNCode}</td>
                    <td class="px-[5px]">${item.taxableAmount}</td>
                    <td class="px-[5px]">${item.sgstAmount}</td>
                    <td class="px-[5px]">${item.cgstAmount}</td>
                    <td class="px-[5px]">${item.totalAmount}</td>
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
                .replace('#RDPermitNo', '-')
                .replace('#InvoiceNo', invoiceDetails.invoiceNo)
                .replace('#InvoiceDate', dayjs(invoiceDetails.invoiceDate).format("DD-MM-YYYY"))
                .replace('#DueDate', dayjs(dueDate).format("DD-MM-YYYY"))
                .replace('#ItemListingRows', itemListingRows)
                .replace('#SubTotalAmount', invoiceDetails.subTotal)
                .replace('#DisCountAmount', invoiceDetails.discount)
                .replace('#SGSTAmount', invoiceDetails.sgst)
                .replace('#CGSTAmount', invoiceDetails.cgst)
                .replace('#CRDRNote', invoiceDetails.crDrNote)
                .replace('#Freight', invoiceDetails.freight)
                .replace('#OtherCharges', invoiceDetails.other)
                .replace('#RoundOffAmount', invoiceDetails.roundOff)
                .replace('#GrandTotal', invoiceDetails.grandTotal)
                .replace('#HSNCodeTableRows', hsnCodeTableRows)
                .replace('#TotalSalesAmount', itemListingTotalCalculation.amount)
                .replace('#TotalDisAmount', itemListingTotalCalculation.discAmount)
                .replace('#TotalTaxableAmount', itemListingTotalCalculation.taxableAmount)
                .replace('#TaxableAmountTotal', hsnCodeTotalCalculation.taxableAmount)
                .replace('#SGSTTotalAmount', hsnCodeTotalCalculation.sgstAmount)
                .replace('#CGSTTotalAmount', hsnCodeTotalCalculation.cgstAmount)
                .replace('#TotalGSTCalculation', hsnCodeTotalCalculation.totalAmount)
        }

        htmlTemplate = `
            <div class="empty-page">${generatePage("Original for Recipient")}</div>
            <div class="page-break"></div>
            <div class="empty-page">${generatePage("Duplicate for Transporter")}</div>
            <div class="page-break"></div>
            <div class="empty-page">${generatePage("Triplicate for Supplier")}</div>
        `;

        const browser = await puppeteer.launch();
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

// GST Invoice RM

const getGSTInvoiceRMInvoice = async (req, res) => {
    try {
        let response = {}
        let gstNoRecord = await gstInvoiceRMModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select('invoiceNo');

        if (gstNoRecord && gstNoRecord.invoiceNo) {
            let lastNumber = parseInt(gstNoRecord.invoiceNo.replace('P', ''), 10);
            let newNumber = lastNumber + 1;

            response.invoiceNo = `P${newNumber.toString().padStart(4, '0')}`;
        } else {
            response.invoiceNo = 'P0001';
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
        const rawMaterialData = await grnEntryMaterialDetailsModel
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
        const responseFromUsedQty = await ProductionRequisitionRMFormulaModel
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
        const responseFromUsedQtyGSTInvoice = await InvoiceRMStockModel
            .find({ rmId: data.id, isDeleted: false });

        const totalUsedQtyInGSTInvoice = responseFromUsedQtyGSTInvoice.reduce((sum, item) => sum + item.qty, 0);

        let isFromGSTInvoiceRecord = false

        if (responseFromUsedQtyGSTInvoice.length > 0 && totalUsedQtyInGSTInvoice > 0) {
            isFromGSTInvoiceRecord = true
        }

        let totalStock = {
            productionNo: '',
            batchClearingEntryId: null,
            productId: data.id,
            batchNo: '',
            expDate: '',
            mfgDate: '',
            quantity: totalPurchaseQty - totalUsedQtyInProduction - (Number(totalUsedQtyInGSTInvoice) || 0),
            mrp: '',
            hsnCode: '',
            name: data.rmName,
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
            const response = await gstInvoiceRMModel.findByIdAndUpdate(data.invoiceDetails.gstInvoiceRMID, data.invoiceDetails, { new: true });
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
                    const existingItemDetails = await gstinvoiceRMItemModel.findOne({ _id: id, isDeleted: false });
                    console.log(existingItemDetails)
                    console.log(item.qty)
                    if (existingItemDetails) {
                        await InvoiceRMStockModel.findOneAndUpdate(
                            { rmId: item.itemId },
                            { $inc: { qty: totalReduceQty } },
                            { new: true }
                        );
                    } else {
                        await InvoiceRMStockModel.findOneAndUpdate(
                            { rmId: item.itemId },
                            { $inc: { qty: Number(item.qty) } },
                            { new: true }
                        );
                    }
                }));

                // After Stock Updating, proceed with Invoice Item Details
                await gstinvoiceRMItemModel.deleteMany({ gstInvoiceRMID: response._id });

                const items = data.itemListing.map(item => ({
                    ...item,
                    gstInvoiceRMID: response._id
                }));

                await gstinvoiceRMItemModel.insertMany(items);

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
            const response = new gstInvoiceRMModel(data.invoiceDetails);
            await response.save();

            responseData.invoiceDetails = response;

            const items = data.itemListing.map(item => ({
                ...item,
                gstInvoiceRMID: response._id
            }));

            // Add Edit For Invoice Item Details
            await gstinvoiceRMItemModel.insertMany(items);

            // Stock Data Inserting

            data.itemListing.map(async (item) => {
                const totalReduceQty = (Number(item.qty) || 0);
                const existingItemDetails = await InvoiceRMStockModel.findOne({ rmId: item.itemId, isDeleted: false });

                if (existingItemDetails) {
                    const existingQty = (Number(existingItemDetails.qty) || 0);
                    const updatedQty = existingQty - totalReduceQty;

                    await InvoiceRMStockModel.findOneAndUpdate(
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
                    await InvoiceRMStockModel.create(itemDetails);
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
        response = await gstInvoiceRMModel
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
        console.log("Error in Inventory controller", error);
        errorHandler(error, req, res, "Error in Inventory controller")
    }
};

const getGSTInvoiceRMById = async (req, res) => {
    try {
        const { id } = req.query;

        let reqId = getRequestData(id)

        let invoiceDetails = await gstInvoiceRMModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: "partyId",
                select: "partyName",
            })
            .populate({
                path: "transportId",
                select: "transportName",
            });

        let itemListing = await gstinvoiceRMItemModel
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
        await InvoiceRMStockModel.findOneAndUpdate(
            { rmId: data.itemId },
            { $inc: { qty: -totalReduceQty } },
            { new: true }
        );
        // Removing Particualr Item From GST Invoice
        let response = await gstinvoiceRMItemModel.findByIdAndUpdate(data.gstInvoiceItemId, { isDeleted: true })

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

        let itemList = await gstinvoiceRMItemModel.find({ gstInvoiceRMID: reqId })

        itemList.map(async item => {
            // Stock Updating
            let totalReduceQty = (Number(item.qty) || 0)

            await InvoiceRMStockModel.findOneAndUpdate(
                { rmId: item.itemId },
                { $inc: { qty: -totalReduceQty } },
                { new: true }
            );

            // Removing Particualr Item From GST Invoice
            await gstinvoiceRMItemModel.findByIdAndUpdate(item._id, { isDeleted: true })
        })

        // Removing GST Invoice Finish Goods Record
        let response = await gstInvoiceRMModel.findByIdAndUpdate(reqId, { isDeleted: true })

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

        let invoiceDetails = await gstInvoiceRMModel
            .findOne({ _id: reqId, isDeleted: false })
            .populate({
                path: 'partyId',
                select: 'partyName address1 address2 address3 address4 corrspAddress1 corrspAddress2 corrspAddress3 corrspAddress4 state pinCode gstnNo mobileNo1 mobileNo2 crdays person dlNo1 dlNo2 fssaiNo bankName city',
            })
            .populate({
                path: 'transportId',
                select: 'transportName',
            });

        let itemListing = await gstinvoiceRMItemModel
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
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${item.itemName}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${item.hsnCodeName}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${item.batchNo}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${dayjs(item.expDate).format('MM-YYYY')}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${dayjs(item.expDate).format('MM-YYYY')}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${item.qty}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${Number(item.rate).toFixed(2)}</td>
                    <td class="border border-x-[0px] border-t-[0px] px-[4px] text-start">${Number(item.amount).toFixed(2)}</td>
                </tr>
            `).join('')
            : '';

        let hsnCodeList = await HNSCodesScHema.find({});

        let hsnCodeListForTable = showHSNCodes(itemListing, hsnCodeList)

        const hsnCodeTotalCalculation = hsnCodeListForTable.reduce(
            (acc, item) => {
                acc.taxableAmount += Number(item.taxableAmount);
                acc.sgstAmount += Number(item.sgstAmount);
                acc.cgstAmount += Number(item.cgstAmount);
                acc.totalAmount += Number(item.totalAmount);
                return acc;
            },
            { taxableAmount: 0, sgstAmount: 0, cgstAmount: 0, totalAmount: 0 }
        );

        const hsnCodeTableRows = hsnCodeListForTable && hsnCodeListForTable.length > 0
            ? hsnCodeListForTable.map(item => `
                <tr>
                    <td class="px-[5px]">${item.HSNCode}</td>
                    <td class="px-[5px]">${item.taxableAmount}</td>
                    <td class="px-[5px]">${item.sgstAmount}</td>
                    <td class="px-[5px]">${item.cgstAmount}</td>
                    <td class="px-[5px]">${item.totalAmount}</td>
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
                .replace('#CRDRNote', invoiceDetails.crDrNote)
                .replace('#Freight', invoiceDetails.freight)
                .replace('#OtherCharges', invoiceDetails.other)
                .replace('#RoundOffAmount', invoiceDetails.roundOff)
                .replace('#GrandTotal', invoiceDetails.grandTotal)
                .replace('#HSNCodeTableRows', hsnCodeTableRows)
                .replace('#TotalSalesAmount', itemListingTotalCalculation.amount)
                .replace('#TotalDisAmount', itemListingTotalCalculation.discAmount)
                .replace('#TotalTaxableAmount', itemListingTotalCalculation.taxableAmount)
                .replace('#TaxableAmountTotal', hsnCodeTotalCalculation.taxableAmount)
                .replace('#SGSTTotalAmount', hsnCodeTotalCalculation.sgstAmount)
                .replace('#CGSTTotalAmount', hsnCodeTotalCalculation.cgstAmount)
                .replace('#TotalGSTCalculation', hsnCodeTotalCalculation.totalAmount)
        }

        htmlTemplate = `
            <div class="empty-page">${generatePage("Original for Recipient")}</div>
            <div class="page-break"></div>
            <div class="empty-page">${generatePage("Duplicate for Transporter")}</div>
            <div class="page-break"></div>
            <div class="empty-page">${generatePage("Triplicate for Supplier")}</div>
        `;

        const browser = await puppeteer.launch();
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

export {
    getProductionStockByProductId,
    getGSTInvoiceFinishGoodsInvoiceNo,
    addEditGSTInvoiceFinishGoods,
    getAllGSTInvoiceFinishGoodsRecords,
    getGSTInvoiceFinishGoodsById,
    deleteItemFromDBById,
    deleteInvoiceById,
    generateGSTInvoiceForFinishGoodsById,
    getGSTInvoiceRMInvoice,
    getrawMaterialStockByRMId,
    addEditInvoiceRM,
    getAllGSTInvoiceRMRecords,
    getGSTInvoiceRMById,
    deleteRMItemFromDBById,
    deleteRMInvoiceById,
    generateGSTInvoiceForRMById
};
