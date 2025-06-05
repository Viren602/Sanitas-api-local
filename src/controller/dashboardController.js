import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import gstPurchaseWithoutInventoryEntryModel from "../model/Account/gstPurcaseWithoutInventoryEntryModel.js";
import gstPurchaseEntryRMPMModel from "../model/Account/gstPurchaseEntryRMPMModel.js";
import gstInvoiceFinishGoodsModel from "../model/Despatch/gstInvoiceFinishGoods.js";
import gstInvoiceFinishGoodsItemsModel from "../model/Despatch/gstInvoiceFinishGoodsItems.js";
import gstInvoicePMModel from "../model/Despatch/gstInvoicePMModel.js";
import gstInvoiceRMModel from "../model/Despatch/gstInvoiceRMModel.js";
import productionPlanningEntryModel from "../model/ProductionModels/productionPlanningEntryModel.js";
import ProductionStagesModel from "../model/ProductionModels/productionStagesModel.js";
import errorHandler from "../server/errorHandle.js";
import mongoose from "mongoose";




const getAllProductionPlanningNumber = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;

        let prodStageModel = await ProductionStagesModel(dbYear);
        let productionPlanningStatusId = await prodStageModel.findOne({ productionStageId: 1 });
        let productionRequisitionStatusId = await prodStageModel.findOne({ productionStageId: 2 });
        let productionPackingStatusId = await prodStageModel.findOne({ productionStageId: 3 });
        let productionPendingBatchesStatusId = await prodStageModel.findOne({ productionStageId: 4 });

        let ppeModel = await productionPlanningEntryModel(dbYear)

        let response = {
            productionPlanningEntries: await ppeModel.countDocuments({ productionStageStatusId: productionPlanningStatusId._id, isDeleted: false }),
            productionRequisitionEntries: await ppeModel.countDocuments({ productionStageStatusId: productionRequisitionStatusId._id, isDeleted: false }),
            productionPackingRequisitionEntries: await ppeModel.countDocuments({ productionStageStatusId: productionPackingStatusId._id, isDeleted: false }),
            productionPendingBatchesEntries: await ppeModel.countDocuments({ productionStageStatusId: productionPendingBatchesStatusId._id, isDeleted: false }),
        }

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Production Planning Details fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });
    } catch (error) {
        console.log("Error in Dashboard controller", error);
        errorHandler(error, req, res, "Error in Dashboard controller")
    }
};
const getTopSellingProducts = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let InvoiceItemsModel = await gstInvoiceFinishGoodsItemsModel(dbYear);

        let response = await InvoiceItemsModel.aggregate([
            {
                $match: {
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: "$itemId",
                    itemName: { $first: "$itemName" },
                    totalQty: { $sum: "$qty" }
                }
            },
            {
                $sort: { totalQty: -1 }
            },
            {
                $limit: 5
            }
        ]);

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Top 5 selling products fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Top Selling Dashboard controller", error);
        errorHandler(error, req, res, "Error in Top Selling Dashboard controller");
    }
};

const getTopActiveClients = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let InvoiceModel = await gstInvoiceFinishGoodsModel(dbYear);

        let response = await InvoiceModel.aggregate([
            {
                $match: {
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: "$partyId",

                    grandTotal: { $sum: "$grandTotal" }
                }
            },
            {
                $sort: { grandTotal: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "_id",
                    foreignField: "_id",
                    as: "partyInfo"
                }
            },

            {
                $unwind: {
                    path: "$partyInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    grandTotal: 1,
                    partyName: "$partyInfo.partyName"
                }
            }

        ]);

        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Top 5 active clients fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in Dashboard controller", error);
        errorHandler(error, req, res, "Error in Dashboard controller");
    }
};

const getMonthlySalesAndPurchase = async (req, res) => {
    try {
        const dbYear = req.cookies["dbyear"] || req.headers.dbyear;

        // Load Sales Models
        const finishGoodsModel = await gstInvoiceFinishGoodsModel(dbYear);
        const RMModel = await gstInvoiceRMModel(dbYear);
        const PMModel = await gstInvoicePMModel(dbYear);

        // Load Purchase Models
        const GstPurchaseRMPMModel = await gstPurchaseEntryRMPMModel(dbYear);
        const GstPurchaseWOModel = await gstPurchaseWithoutInventoryEntryModel(dbYear);

        // Get financial year range
        const getQueryObjectForFinancialYear = () => {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;

            const fyStartYear = currentMonth < 4 ? currentYear - 1 : currentYear;

            const startDate = new Date(`${fyStartYear}-04-01T00:00:00.000Z`);
            const endDate = new Date(`${fyStartYear + 1}-03-31T23:59:59.999Z`);

            return [
                {
                    $match: {
                        isDeleted: false,
                        invoiceDate: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: { month: { $month: "$invoiceDate" } },
                        total: { $sum: "$grandTotal" }
                    }
                }
            ];
        };

        const queryObject = getQueryObjectForFinancialYear();

        // Aggregate Sales
        const fgData = await finishGoodsModel.aggregate(queryObject);
        const rmData = await RMModel.aggregate(queryObject);
        const pmData = await PMModel.aggregate(queryObject);
        const allSalesData = [...fgData, ...rmData, ...pmData];

        const salesMap = {};
        allSalesData.forEach(({ _id, total }) => {
            const month = _id.month;
            salesMap[month] = (salesMap[month] || 0) + total;
        });

        // Aggregate Purchase
        const rmPmPurchaseData = await GstPurchaseRMPMModel.aggregate(queryObject);
        const woPurchaseData = await GstPurchaseWOModel.aggregate(queryObject);
        const allPurchaseData = [...rmPmPurchaseData, ...woPurchaseData];

        const purchaseMap = {};
        allPurchaseData.forEach(({ _id, total }) => {
            const month = _id.month;
            purchaseMap[month] = (purchaseMap[month] || 0) + total;
        });

        // Define month order (April to March)
        const monthOrder = [
            "April", "May", "June", "July", "August", "September",
            "October", "November", "December", "January", "February", "March"
        ];

        const monthNameToNumber = {
            January: 1, February: 2, March: 3,
            April: 4, May: 5, June: 6, July: 7,
            August: 8, September: 9, October: 10,
            November: 11, December: 12
        };

        const response = monthOrder.map(monthName => {
            const monthNum = monthNameToNumber[monthName];
            return {
                month: monthName,
                sales: salesMap[monthNum] || 0,
                purchase: purchaseMap[monthNum] || 0
            };
        });

        const encryptedData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Monthly sales and purchase summary fetched successfully",
                responseData: encryptedData,
                isEnType: true
            }
        });

    } catch (error) {
        console.log("Error in getMonthlySalesAndPurchase", error);
        errorHandler(error, req, res, "Error in monthly sales and purchase summary");
    }
};


export {
    getAllProductionPlanningNumber,
    getTopSellingProducts,
    getTopActiveClients,
    // getMonthlySalesByName,
    // getMonthlyPurchase,
    getMonthlySalesAndPurchase
};