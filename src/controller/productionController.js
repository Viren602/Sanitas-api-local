import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import grnEntryMaterialDetailsModel from "../model/InventoryModels/grnEntryMaterialDetailsModel.js";
import PackingRequisitionPMFormulaModel from "../model/InventoryModels/packingRequisitionPMFormulaModel.js";
import ProductionRequisitionRMFormulaModel from "../model/InventoryModels/productionRequisitionRMFormulaModel.js";
import pmFormulaModel from "../model/pmFormulaModel.js";
import batchClearingEntryModel from "../model/ProductionModels/batchClearingEntryModel.js";
import productionPlanningEntryModel from "../model/ProductionModels/productionPlanningEntryModel.js";
import ProductionStagesModel from "../model/ProductionModels/productionStagesModel.js";
import rmFormulaModel from "../model/rmFormulaModel.js";
import mongoose from "mongoose";
import errorHandler from "../server/errorHandle.js";
import additionalEntryMaterialDetailsModel from "../model/InventoryModels/additionalEntryMaterialDetailsModel.js";
import gstinvoiceRMItemModel from "../model/Despatch/gstInvoiceRMItemsModel.js";
import gstInvoicePMItemModel from "../model/Despatch/gstInvoicePMItemsModel.js";
import rawMaterialSchema from "../model/rawMaterialModel.js";
import batchWiseProductStockModel from "../model/Despatch/batchWiseProductStockModel.js";

const addEditProductionPlanningEntry = async (req, res) => {
  try {
    let apiData = req.body.data;
    let reqData = getRequestData(apiData, "PostApi");
    let responseData = {};

    let psModel = await ProductionStagesModel()
    const stage = await psModel.findOne({
      productionStageId: reqData.productionStageId,
      isDeleted: false,
    });

    reqData.productionStageStatusId = stage._id;

    if (reqData.productDetialsId && reqData.productDetialsId.trim() !== "") {
      let ppeModel = await productionPlanningEntryModel()
      const response = await ppeModel.findByIdAndUpdate(
        reqData.productDetialsId,
        reqData,
        { new: true }
      );
      if (response) {
        responseData = encryptionAPI(response, 1);
        res.status(200).json({
          data: {
            statusCode: 200,
            Message: "Production Planning Entry Updated Successully",
            responseData: responseData,
            isEnType: true,
          },
        });
      }
    } else {
      let nextProductionNo = "P0001";

      let ppeModel = await productionPlanningEntryModel()
      const lastRecord = await ppeModel
        .findOne()
        .sort({ productionNo: -1 })
        .select("productionNo")
        .exec();

      if (lastRecord && lastRecord.productionNo) {
        const lastNumber = parseInt(lastRecord.productionNo.slice(1), 10);
        nextProductionNo = `P${String(lastNumber + 1).padStart(4, "0")}`;
      }

      reqData.productionNo = nextProductionNo;

      reqData.productionPlanningDate = new Date();

      let ppeModel1 = await productionPlanningEntryModel()
      const response = new ppeModel1(reqData);
      await response.save();

      responseData = encryptionAPI(response, 1);

      res.status(200).json({
        data: {
          statusCode: 200,
          Message: "Production Planning Entry Added Successully",
          responseData: responseData,
          isEnType: true,
        },
      });
    }
  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getAllProductionPlanningEntry = async (req, res) => {
  try {
    let apiData = req.body.data;
    let data = getRequestData(apiData, "PostApi");
    let queryObject = {
      isDeleted: false,
    };

    let filterBy = "updatedAt";

    if (data.filterBy && data.filterBy.trim() !== "") {
      filterBy = data.filterBy;
    }

    if (Array.isArray(data.productionStageId) && data.productionStageId.length > 0) {
      let psModel = await ProductionStagesModel()
      const stages = await psModel.find({
        productionStageId: { $in: data.productionStageId },
        isDeleted: false,
      });
      const requiredStatusIDs = stages.map(stage => new mongoose.Types.ObjectId(stage._id));

      if (stages && stages.length > 0) {
        queryObject.productionStageStatusId = { $in: requiredStatusIDs };
      } else {
        queryObject.productionStageStatusId = { $in: [] };
      }
    } else {
      queryObject.productionStageStatusId = { $in: [] };
    }

    let ppeModel = await productionPlanningEntryModel()
    let response = await ppeModel
      .find(queryObject)
      .sort(filterBy)
      .populate({
        path: "partyId",
        select: "partyName _id",
      })
      .populate({
        path: "productId",
        select: "productName color weight sizeName _id",
      })
      .populate({
        path: "productionStageStatusId",
        select: "productionStageName productionStageId _id",
      });

    if (data.partyName && data.partyName.trim() !== "") {
      response = response.filter((item) =>
        item.partyId?.partyName
          ?.toLowerCase()
          .startsWith(data.partyName.toLowerCase())
      );
    }

    if (data.productName && data.productName.trim() !== "") {
      response = response.filter((item) =>
        item.productId?.productName
          ?.toLowerCase()
          .startsWith(data.productName.toLowerCase())
      );
    }

    if (data.orderNumber && data.orderNumber.trim() !== "") {
      response = response.filter((item) =>
        item.productionNo
          ?.toLowerCase()
          .startsWith(data.orderNumber.toLowerCase())
      );
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
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getProductionPlanningEntryById = async (req, res) => {
  try {
    const { id } = req.query;
    let reqId = getRequestData(id);
    let response = [];
    if (reqId) {
      let ppeModel = await productionPlanningEntryModel()
      response = await ppeModel
        .findOne({
          _id: reqId,
          isDeleted: false,
        })
        .populate({
          path: "productId",
          select: "productName color sizeName _id",
        })
        .populate({
          path: "productionStageStatusId",
          select: "productionStageName productionStageId _id",
        });
    }
    let encryptData = encryptionAPI(response, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Items fetched successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });
  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const deleteProductionPlanningEntryById = async (req, res) => {
  try {
    const { id } = req.query;
    let reqId = getRequestData(id);
    let response = {};
    if (reqId) {
      let ppeModel = await productionPlanningEntryModel()
      response = await ppeModel.findByIdAndUpdate(
        reqId,
        { isDeleted: true },
        { new: true, useFindAndModify: false }
      );
    }

    let prPMFormualModel = await PackingRequisitionPMFormulaModel()
    await prPMFormualModel.deleteMany({
      _id: reqId,
    });

    let prRMFormulaModel = await ProductionRequisitionRMFormulaModel();
    await prRMFormulaModel.deleteMany({
      _id: reqId,
    });

    let encryptData = encryptionAPI(response, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Production Planning Entry Deleted Successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });
  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getRMFormulaForProductionById = async (req, res) => {
  try {

    const { id } = req.query;
    let reqId = getRequestData(id)

    let queryObject = {
      isDeleted: false,
      rawMaterialId: { $ne: null },
    };

    let rmFModel = await rmFormulaModel()
    let formulaResponse = await rmFModel
      .find({ productId: reqId, isDeleted: false })
      .select('qty netQty rmName uom stageName batchSize rmId')
      .populate({
        path: 'stageId',
        select: 'seqNo',
      });

    formulaResponse.sort((a, b) => (a.stageId?.seqNo || 0) - (b.stageId?.seqNo || 0));

    let gemDetailsModel = await grnEntryMaterialDetailsModel();
    const grnEntryForStock = await gemDetailsModel
      .find(queryObject)
      .populate({
        path: 'rawMaterialId',
        select: 'rmName rmUOM minQty rmCategory _id',
      });

    const stockData = grnEntryForStock.reduce((acc, entry) => {
      const rmName = entry.rawMaterialId.rmName;
      const rmUOM = entry.rawMaterialId.rmUOM;
      const quantity = entry.qty || 0;

      if (!acc[rmName]) {
        acc[rmName] = {
          rmName,
          totalQuantity: 0,
          rmUOM,
        };
      }

      acc[rmName].totalQuantity += quantity;
      return acc;
    }, {});

    let prRMFormulaModel = await ProductionRequisitionRMFormulaModel();
    let giRMItemModel = await gstinvoiceRMItemModel();
    let addEntryModel = await additionalEntryMaterialDetailsModel();
    let rmModel = await rawMaterialSchema()

    const enrichedFormulaResponse = await Promise.all(
      formulaResponse.map(async (item) => {
        const stock = stockData[item.rmName] || { totalQuantity: 0, rmUOM: null };

        // GST Invoice Qty Remove
        let gstInvoiceUsedQty = await giRMItemModel.find({ itemId: item.rmId, isDeleted: false }).select('qty');
        let totalGSTInvoiceUsed = gstInvoiceUsedQty.reduce((sum, gItem) => sum + (gItem.qty || 0), 0);

        // Production Qty Remove
        let productionUsedQty = await prRMFormulaModel.find({ isDeleted: false, rmName: item.rmName }).select('netQty');
        let totalUsedQty = productionUsedQty.reduce((sum, pItem) => sum + (pItem.netQty || 0), 0);

        // Additional Qty Remove
        let additionalEntry = await addEntryModel.find({ rawMaterialId: item.rmId, isDeleted: false }).select('qty');
        let additionalEntryUsed = additionalEntry.reduce((sum, aItem) => sum + (aItem.qty || 0), 0);

        let finalQty = stock.totalQuantity - totalUsedQty - totalGSTInvoiceUsed - additionalEntryUsed;

        let rawMaterialUOM = await rmModel.findOne({ _id: item.rmId, isDeleted: false }).select('rmUOM');
        let itemUOM = stock.rmUOM ? stock.rmUOM : rawMaterialUOM.rmUOM

        const convertedNetQty = convertNetQty(item.netQty, item.uom, itemUOM);
        return {
          ...item.toObject(),
          rmUOM: itemUOM,
          netQty: convertedNetQty,
          totalStock: finalQty,
        };
      })
    );


    function convertNetQty(netQty, uom, rmUOM) {
      if (uom === rmUOM) {
        return netQty;
      }

      if (uom === 'MCG') {
        if (rmUOM === 'KGS') { return netQty / 1000000000; }
        if (rmUOM === 'GM') { return netQty / 1000000; }
        if (rmUOM === 'MG') { return netQty / 1000; }
      }

      if (uom === 'GM') {
        if (rmUOM === 'KGS') { return netQty / 1000; }
        if (rmUOM === 'MG') { return netQty * 1000; }
      }

      if (uom === 'MG') {
        if (rmUOM === 'KGS') { return netQty / 1000000; }
        if (rmUOM === 'GM') { return netQty / 1000; }
      }

      if (uom === 'KGS') {
        if (rmUOM === 'MG') { return netQty * 1000000; }
        if (rmUOM === 'GM') { return netQty * 1000; }
      }

      if (uom === 'LTR') { return netQty * 1000 }

      if (uom === 'ML') { return netQty / 1000 }

      return netQty;
    }

    let encryptData = encryptionAPI(enrichedFormulaResponse, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Stock Wise Raw material formula fetched successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });

  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const productionRequisitionRMFormulaListing = async (req, res) => {
  try {
    let apiData = req.body.data;
    let reqData = getRequestData(apiData, "PostApi");
    let responseData = {};

    let prRMFormulaModel = await ProductionRequisitionRMFormulaModel();
    const existingRecords = await prRMFormulaModel.find({
      productDetialsId: reqData.productDetialsId,
    });
    if (existingRecords && existingRecords.length > 0) {
      await prRMFormulaModel.updateMany(
        { productDetialsId: reqData.productDetialsId },
        { $set: { isDeleted: true } }
      );
      console.log(`Deleted existing records for productDetialsId: ${reqData.productDetialsId}`);
    }

    const newRecords = reqData.rmFormulaArray.map(({ _id, ...item }) => ({
      ...item,
      productId: reqData.productId,
    }));

    const result = await prRMFormulaModel.insertMany(newRecords);

    responseData = encryptionAPI(result, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Formula Updated Successfully",
        responseData: responseData,
        isEnType: true,
      },
    });

  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getProductionRMFOrmulaByProductionDetailsId = async (req, res) => {
  try {

    const { id } = req.query;
    let reqId = getRequestData(id)

    let prRMFormulaModel = await ProductionRequisitionRMFormulaModel();
    const response = await prRMFormulaModel
      .find({ productDetialsId: reqId, isDeleted: false });

    let encryptData = encryptionAPI(response, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Stock Wise Raw material formula fetched successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });

  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const removeProductionPlanningEntryFromProductionRequisition = async (req, res) => {
  try {
    const { id } = req.query;
    let reqId = getRequestData(id);
    let productionResponse = {};
    if (reqId) {

      // Change Stage Id from 5 to 4
      let prodPlaningModel = await productionPlanningEntryModel()
      let psModel = await ProductionStagesModel()

      const stage = await psModel.findOne({
        productionStageId: 1,
        isDeleted: false,
      });

      if (stage) {
        productionResponse = await prodPlaningModel.findByIdAndUpdate(
          reqId,
          { productionStageStatusId: stage._id, isRMFormulaCreated: false },
          { new: true, useFindAndModify: false })
      }

      // Delete Used Qty from Production Requisition
      let prPMFormualModel = await ProductionRequisitionRMFormulaModel()
      await prPMFormualModel.updateMany({ productDetialsId: reqId }, { isDeleted: true });

      // Delete Used Qty from Packing Requisition
      // let prPMFormualModel = await PackingRequisitionPMFormulaModel()
      // await prPMFormualModel.updateMany({ productDetialsId: reqId }, { isDeleted: true });

      // Delete From BatchClearing & Stock
      // let batchwiseProdStkModel = await batchWiseProductStockModel()
      // let batchClrModel = await batchClearingEntryModel()
      // let batchClearRecords = await batchClrModel.find({
      //   productDetialsId: reqId,
      //   isDeleted: false,
      // })

      // if (batchClearRecords.length > 0) {
      //   for (const item of batchClearRecords) {
      //     await batchwiseProdStkModel.findOneAndUpdate(
      //       { batchNo: productionResponse.batchNo, productId: item?.packingItemId, },
      //       { $inc: { quantity: -item.quantity }, },
      //       { new: true, }
      //     );
      //   }
      // }

      // await batchClrModel.updateMany({ productDetialsId: reqId }, { isDeleted: true });
    }
    let encryptData = encryptionAPI(productionResponse, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Items deleted successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });
  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};


const getPMFormulaByPackingItemId = async (req, res) => {
  try {

    const { id } = req.query;
    let reqId = getRequestData(id)

    let queryObject = {
      isDeleted: false,
      packageMaterialId: { $ne: null },
    };

    let pmfModel = await pmFormulaModel()
    const formulaResponse = await pmfModel
      .find({ itemId: reqId, isDeleted: false })
      .select('qty netQty pmName uom stageName batchSize packageMaterialId');

    let gemDetailsModel = await grnEntryMaterialDetailsModel();
    const grnEntryForStock = await gemDetailsModel
      .find(queryObject)
      .populate({
        path: 'packageMaterialId',
        select: 'pmName pmUOM pmMinQty pmCategory _id',
      });

    const stockData = grnEntryForStock.reduce((acc, entry) => {
      const pmName = entry.packageMaterialId.pmName;
      const pmUOM = entry.packageMaterialId.pmUOM;
      const quantity = entry.qty || 0;

      if (!acc[pmName]) {
        acc[pmName] = {
          pmName,
          totalQuantity: 0,
          pmUOM,
        };
      }

      acc[pmName].totalQuantity += quantity;
      return acc;
    }, {});

    // const enrichedFormulaResponse = formulaResponse.map((item) => {
    //   const stock = stockData[item.pmName] || { totalQuantity: 0, pmUOM: null };
    //   return {
    //     ...item.toObject(),
    //     pmUOM: stock.pmUOM,
    //     totalStock: stock.totalQuantity,
    //   };
    // });

    let addEntryModel = await additionalEntryMaterialDetailsModel()
    let giPMItemModel = await gstInvoicePMItemModel()
    let prPMFormulaModel = await PackingRequisitionPMFormulaModel();

    const enrichedFormulaResponse = await Promise.all(
      formulaResponse.map(async (item) => {
        const stock = stockData[item.pmName] || { totalQuantity: 0, pmUOM: null };

        // GST Invoice Qty Remove
        let gstInvoiceUsedQty = await giPMItemModel.find({ itemId: item.packageMaterialId, isDeleted: false }).select('qty');
        let totalGSTInvoiceUsed = gstInvoiceUsedQty.reduce((sum, gItem) => sum + (gItem.qty || 0), 0);

        // Production Qty Remove
        let productionUsedQty = await prPMFormulaModel.find({ isDeleted: false, pmName: item.pmName }).select('netQty');
        let totalUsedQty = productionUsedQty.reduce((sum, pItem) => sum + (pItem.netQty || 0), 0);

        // Additional Qty Remove
        let additionalEntry = [];
        if (!item.packageMaterialId) {
          additionalEntry = [];
        } else {
          additionalEntry = await addEntryModel.find({ packageMaterialId: item.packageMaterialId, isDeleted: false }).select('qty');
        }
        let additionalEntryUsed = additionalEntry.reduce((sum, aItem) => sum + (aItem.qty || 0), 0);

        let finalQty = stock.totalQuantity - totalUsedQty - totalGSTInvoiceUsed - additionalEntryUsed;

        return {
          ...item.toObject(),
          pmUOM: stock.pmUOM,
          totalStock: finalQty,
        };
      }));



    let encryptData = encryptionAPI(enrichedFormulaResponse, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Stock Wise Raw material formula fetched successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });

  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const packingRequisitionPMFormulaListing = async (req, res) => {
  try {
    let apiData = req.body.data;
    let reqData = getRequestData(apiData, "PostApi");
    let responseData = {};

    let prPMFormualModel = await PackingRequisitionPMFormulaModel()
    const existingRecords = await prPMFormualModel.find({
      productDetialsId: reqData.productDetialsId,
    });

    if (existingRecords && existingRecords.length > 0) {
      // let prPMFormualModel = await PackingRequisitionPMFormulaModel()
      // await prPMFormualModel.deleteMany({
      //   productDetialsId: reqData.productDetialsId,
      // });
      await prPMFormualModel.updateMany(
        { productDetialsId: reqData.productDetialsId },
        { $set: { isDeleted: true } }
      );
      console.log(`Deleted existing records for productDetialsId: ${reqData.productDetialsId}`);
    }

    const newRecords = reqData.pmFormulaArray.map(({ _id, ...item }) => ({
      ...item,
      packingItemId: reqData.packingItemId,
    }));

    let prPMFormualModel1 = await PackingRequisitionPMFormulaModel()
    const result = await prPMFormualModel1.insertMany(newRecords);

    responseData = encryptionAPI(result, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Formula Updated Successfully",
        responseData: responseData,
        isEnType: true,
      },
    });

  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getProductionPMFOrmulaByProductionDetailsId = async (req, res) => {
  try {

    const { id } = req.query;
    let reqId = getRequestData(id)

    let prPMFormualModel = await PackingRequisitionPMFormulaModel()
    const response = await prPMFormualModel
      .find({ productDetialsId: reqId, isDeleted: false });

    let encryptData = encryptionAPI(response, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Stock Wise Raw material formula fetched successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });

  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const removeProductionPlanningEntryFromPackingRequisition = async (req, res) => {
  try {
    const { id } = req.query;
    let reqId = getRequestData(id);
    let productionResponse = {};
    if (reqId) {

      // Change Stage Id from 5 to 4
      let prodPlaningModel = await productionPlanningEntryModel()
      let psModel = await ProductionStagesModel()

      const stage = await psModel.findOne({
        productionStageId: 2,
        isDeleted: false,
      });

      if (stage) {
        productionResponse = await prodPlaningModel.findByIdAndUpdate(
          reqId,
          { productionStageStatusId: stage._id, isPMFormulaCreated: false },
          { new: true, useFindAndModify: false })
      }

      // Delete Used Qty from Packing Requisition
      let prPMFormualModel = await PackingRequisitionPMFormulaModel()
      await prPMFormualModel.updateMany({ productDetialsId: reqId }, { isDeleted: true });

      // Delete From BatchClearing & Stock
      // let batchwiseProdStkModel = await batchWiseProductStockModel()
      // let batchClrModel = await batchClearingEntryModel()
      // let batchClearRecords = await batchClrModel.find({
      //   productDetialsId: reqId,
      //   isDeleted: false,
      // })

      // if (batchClearRecords.length > 0) {
      //   for (const item of batchClearRecords) {
      //     await batchwiseProdStkModel.findOneAndUpdate(
      //       { batchNo: productionResponse.batchNo, productId: item?.packingItemId, },
      //       { $inc: { quantity: -item.quantity }, },
      //       { new: true, }
      //     );
      //   }
      // }

      // await batchClrModel.updateMany({ productDetialsId: reqId }, { isDeleted: true });
    }
    let encryptData = encryptionAPI(productionResponse, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Items deleted successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });
  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const addEditBatchClearingEntry = async (req, res) => {
  try {
    let apiData = req.body.data;
    let reqData = getRequestData(apiData, "PostApi");
    let responseData = {};

    if (reqData.batchClearingId && reqData.batchClearingId.trim() !== "") {

      let batchClrModel = await batchClearingEntryModel()
      let batchwiseProdStkModel = await batchWiseProductStockModel()
      let oldRecord = await batchClrModel.findOne({ _id: reqData.batchClearingId })
      if (oldRecord) {
        const oldQty = oldRecord.quantity
        const updatedQty = reqData.quantity
        const finalQty = oldQty - updatedQty
        await batchwiseProdStkModel.findOneAndUpdate(
          { batchNo: reqData?.batchNo, productId: reqData?.packingItemId, },
          { $inc: { quantity: -finalQty } },
          { new: true }
        );
      }

      const response = await batchClrModel.findByIdAndUpdate(
        reqData.batchClearingId,
        reqData,
        { new: true }
      );
      if (response) {
        responseData = encryptionAPI(response, 1);
        res.status(200).json({
          data: {
            statusCode: 200,
            Message: "Batch Clearing Entry Updated Successfully",
            responseData: responseData,
            isEnType: true,
          },
        });
      }
    } else {

      let batchClrModel = await batchClearingEntryModel()
      const response = new batchClrModel(reqData);
      await response.save();

      // Check Existing Stock And Add
      let batchwiseProdStkModel = await batchWiseProductStockModel()
      const existingStock = await batchwiseProdStkModel.findOne({
        batchNo: reqData?.batchNo,
        productId: reqData?.packingItemId,
      });

      const stockItem = {
        productionNo: reqData?.productionNo,
        batchClearingEntryId: response._id,
        productId: reqData?.packingItemId,
        batchNo: reqData?.batchNo,
        expDate: reqData?.expDate,
        mfgDate: reqData?.mfgDate,
        quantity: reqData?.quantity,
        mrp: reqData?.mrp,
        hsnCode: '',
      }

      if (!existingStock) {
        let batchwiseProdStkModel = await batchWiseProductStockModel()
        await batchwiseProdStkModel.create(stockItem);
      } else {
        await batchwiseProdStkModel.findByIdAndUpdate(
          existingStock._id,
          { $inc: { quantity: reqData?.quantity } },
          { new: true }
        );
      }

      responseData = encryptionAPI(response, 1);

      res.status(200).json({
        data: {
          statusCode: 200,
          Message: "Batch Clearing Entry Added Successfully",
          responseData: responseData,
          isEnType: true,
        },
      });
    }
  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getBatchClearingEntryByProductId = async (req, res) => {
  try {
    const { id } = req.query;
    let reqId = getRequestData(id);
    let response = [];
    if (reqId) {
      let batchClrModel = await batchClearingEntryModel()
      response = await batchClrModel
        .find({
          productDetialsId: reqId,
          isDeleted: false,
        })
        .populate({
          path: "productDetialsId",
          select: "productionNo productionPlanningDate despDate",
        });
    }
    let encryptData = encryptionAPI(response, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Items fetched successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });
  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const removeProductionPlanningEntryFromBatchCLearingEntryById = async (req, res) => {
  try {
    const { id } = req.query;
    let reqId = getRequestData(id);
    let productionResponse = {};
    if (reqId) {

      let prodPlaningModel = await productionPlanningEntryModel()
      let batchwiseProdStkModel = await batchWiseProductStockModel()
      let psModel = await ProductionStagesModel()
      let batchClrModel = await batchClearingEntryModel()

      const stage = await psModel.findOne({
        productionStageId: 3,
        isDeleted: false,
      });


      // Change Stage Id from 5 to 4
      if (stage) {
        productionResponse = await prodPlaningModel.findByIdAndUpdate(
          reqId,
          { productionStageStatusId: stage._id },
          { new: true, useFindAndModify: false })
      }

      // Get Batch Clear Records and Reduce Stock
      let batchClearRecords = await batchClrModel.find({
        productDetialsId: reqId,
        isDeleted: false,
      })

      for (const item of batchClearRecords) {
        await batchwiseProdStkModel.findOneAndUpdate(
          { batchNo: productionResponse.batchNo, productId: item?.packingItemId, },
          { $inc: { quantity: -item.quantity }, },
          { new: true, }
        );
      }

      await batchClrModel.updateMany({ productDetialsId: reqId }, { isDeleted: true });
    }
    let encryptData = encryptionAPI(productionResponse, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Items deleted successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });
  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getAllBatchClearedRecords = async (req, res) => {
  try {
    let apiData = req.body.data;
    let data = getRequestData(apiData, "PostApi");
    let queryObject = {
      isDeleted: false,
      // clearBatch: true
    };

    // let response = await batchClrModel
    //   .find(queryObject)
    //   .populate({
    //     path: "productDetialsId",
    //     select: "productionNo productionPlanningDate despDate partyId productId batchNo packing batchSize mfgDate",
    //     populate: {
    //       path: 'partyId',
    //       select: 'partyName _id',
    //     },
    //     populate: {
    //       path: 'productId',
    //       select: 'productName _id',
    //     },
    //   })
    //   .populate({
    //     path: "packingItemId",
    //     select: "JobCharge ItemName UnitQuantity",
    //   });

    let batchClrModel = await batchClearingEntryModel()
    let response = await batchClrModel.aggregate([
      {
        $match: queryObject,
      },
      {
        $lookup: {
          from: "productionentries",
          localField: "productDetialsId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $lookup: {
          from: "accountmasters",
          localField: "productDetails.partyId",
          foreignField: "_id",
          as: "partyDetails",
        },
      },
      {
        $unwind: "$partyDetails",
      },
      {
        $lookup: {
          from: "productmasters",
          localField: "productDetails.productId",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $lookup: {
          from: "companyitems",
          localField: "packingItemId",
          foreignField: "_id",
          as: "packingItems",
        },
      },
      {
        $group: {
          _id: "$productDetails.productionNo",
          despDate: { $first: "$productDetails.despDate" },
          batchNo: { $first: "$productDetails.batchNo" },
          productName: { $first: "$productData.productName" },
          totalQuantity: { $sum: "$quantity" },
          mrp: { $last: "$mrp" },
          netQuantity: { $last: "$netQuantity" },
          productDetialsId: { $last: "$productDetails._id" },
          batchClearId: { $last: "$_id" },
          batchSize: { $first: "$productDetails.batchSize" },
          mfgDate: { $first: "$productDetails.mfgDate" },
          productionPlanningDate: { $first: "$productDetails.productionPlanningDate" },
          packing: { $first: "$productDetails.packing" },
          partyId: { $first: "$partyDetails._id" },
          partyName: { $first: "$partyDetails.partyName" },
          productId: { $first: "$productData._id" },
          packingItems: { $push: "$packingItems" },
          updatedAt: { $first: "$productDetails.updatedAt" }
        },
      },
      {
        $sort: { updatedAt: 1 },
      },
      {
        $project: {
          _id: 0,
          productionNo: "$_id",
          despDate: 1,
          batchNo: 1,
          productName: 1,
          totalQuantity: 1,
          mrp: 1,
          netQuantity: 1,
          productDetialsId: 1,
          batchClearId: 1,
          batchSize: 1,
          mfgDate: 1,
          productionPlanningDate: 1,
          packing: 1,
          partyId: 1,
          partyName: 1,
          productId: 1,
          packingItems: 1,
        },
      },
    ]);

    if (data.productName && data.productName.trim() !== "") {
      response = response.filter((item) =>
        item?.productName
          ?.toLowerCase()
          .startsWith(data.productName.toLowerCase()),
      );
    }

    if (data.filterBy === "batchNo") {
      response.sort((a, b) => a.batchNo.localeCompare(b.batchNo));
    } else if (data.filterBy === "slipNo") {
      response.sort((a, b) => a.productionNo.localeCompare(b.productionNo));
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
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const deleteBatchCLearingEntryById = async (req, res) => {
  try {
    let apiData = req.body.data;
    let data = getRequestData(apiData, "PostApi");
    let response = [];
    if (data.batchClearingId) {
      let batchClrModel = await batchClearingEntryModel()
      let batchwiseProdStkModel = await batchWiseProductStockModel()
      let oldRecord = await batchClrModel.findOne({ _id: data.batchClearingId })


      // Update Stock
      if (oldRecord) {
        console.log(oldRecord)
        const oldQty = oldRecord.quantity

        await batchwiseProdStkModel.findOneAndUpdate(
          { batchNo: data.batchNo, productId: oldRecord?.packingItemId, },
          { $inc: { quantity: -oldQty } },
          { new: true }
        );

        // Remove Record from Batch
        await batchClrModel.findByIdAndUpdate(
          data.batchClearingId,
          { isDeleted: true },
          { new: true, useFindAndModify: false })
      }

    }
    let encryptData = encryptionAPI(response, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Items deleted successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });
  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getAllPendingProductionPlanningReport = async (req, res) => {
  try {
    let apiData = req.body.data;
    let data = getRequestData(apiData, "PostApi");
    let queryObject = {
      isDeleted: false,
    };

    if (Array.isArray(data.productionStageId) && data.productionStageId.length > 0) {
      let psModel = await ProductionStagesModel()
      const stages = await psModel.find({
        productionStageId: { $in: data.productionStageId },
        isDeleted: false,
      });
      const requiredStatusIDs = stages.map(stage => new mongoose.Types.ObjectId(stage._id));

      if (stages && stages.length > 0) {
        queryObject.productionStageStatusId = { $in: requiredStatusIDs };
      } else {
        queryObject.productionStageStatusId = { $in: [] };
      }
    } else {
      queryObject.productionStageStatusId = { $in: [] };
    }

    let ppeModel = await productionPlanningEntryModel()
    let response = await ppeModel
      .find(queryObject)
      .populate({
        path: "partyId",
        select: "partyName _id",
      })
      .populate({
        path: "productId",
        select: "productName color weight sizeName productCategory _id",
      })
      .populate({
        path: "productionStageStatusId",
        select: "productionStageName productionStageId _id",
      });

    if (data.searchBy && data.searchBy !== 'Select' && data.searchBy.trim() !== "") {
      response = response.filter((item) =>
        item.productId?.productCategory === data.searchBy
      );
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
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getAllProductionBatchRegister = async (req, res) => {
  try {
    let apiData = req.body.data;
    let data = getRequestData(apiData, "PostApi");
    let queryObject = {
      isDeleted: false,
      mfgDate: {
        $gte: new Date(data.startDate),
        $lte: new Date(data.endDate),
      }
    };

    let filterBy = "productionNo";

    if (data.filterBy && data.filterBy.trim() !== "") {
      filterBy = data.filterBy;
    }

    if (Array.isArray(data.productionStageId) && data.productionStageId.length > 0) {
      let psModel = await ProductionStagesModel()
      const stages = await psModel.find({
        productionStageId: { $in: data.productionStageId },
        isDeleted: false,
      });

      const requiredStatusIDs = stages.map(stage => new mongoose.Types.ObjectId(stage._id));

      if (stages && stages.length > 0) {
        queryObject.productionStageStatusId = { $in: requiredStatusIDs };
      } else {
        queryObject.productionStageStatusId = { $in: [] };
      }
    } else {
      queryObject.productionStageStatusId = { $in: [] };
    }

    let ppeModel = await productionPlanningEntryModel()
    let response = await ppeModel
      .find(queryObject)
      .sort(filterBy)
      .populate({
        path: "partyId",
        select: "partyName _id",
      })
      .populate({
        path: "productId",
        select: "productName productCategory color weight sizeName _id",
      })
      .populate({
        path: "productionStageStatusId",
        select: "productionStageName productionStageId _id",
      });

    response = await Promise.all(
      response.map(async (item) => {
        let itemObject = item.toObject();
        let batchClrModel = await batchClearingEntryModel()
        let batchClearDetails = await batchClrModel
          .find({ productDetialsId: itemObject._id })
          .populate({ path: "packingItemId", select: "UnitQuantity" });

        if (batchClearDetails && batchClearDetails.length > 0) {
          const totalYield = batchClearDetails.reduce((total, detail) => {
            const unitQuantity = detail.packingItemId?.UnitQuantity || 0;
            return total + (detail.quantity + detail.retainSample) * unitQuantity;
          }, 0);

          const batchSize = itemObject.batchSize || 1;

          itemObject.yieldValue = (totalYield / batchSize) * 100;
        } else {
          itemObject.yieldValue = 0;
        }
        return itemObject;
      })
    );

    if (data.productName && data.productName.trim() !== "") {
      response = response.filter((item) =>
        item.productId?.productName
          ?.toLowerCase()
          .startsWith(data.productName.toLowerCase())
      );
    }

    if (data.orderNumber && data.orderNumber.trim() !== "") {
      response = response.filter((item) =>
        item.productionNo
          ?.toLowerCase()
          .startsWith(data.orderNumber.toLowerCase())
      );
    }
    if (data.itemCategory && data.itemCategory !== 'Select' && data.itemCategory.trim() !== "") {
      response = response.filter((item) =>
        item.productId?.productCategory === data.itemCategory
      );
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
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getAllJobChargeRecords = async (req, res) => {
  try {
    let apiData = req.body.data;
    let data = getRequestData(apiData, "PostApi");
    let queryObject = {
      isDeleted: false,
    };

    let endDate = new Date(data.endDate);
    endDate.setHours(23, 59, 59, 999);

    let batchClrModel = await batchClearingEntryModel()
    let response = await batchClrModel
      .find(queryObject)
      // .sort(filterBy)
      .populate({
        path: "productDetialsId",
        select: "productionNo productionPlanningDate despDate partyId productId batchNo packing createdAt",
        match: {
          createdAt: {
            $gte: new Date(data.startDate),
            $lte: new Date(endDate),
          },
        },
        populate: [
          {
            path: "partyId",
            select: "partyName _id",
          },
          {
            path: "productId",
            select: "productName _id",
          },
        ],
      })
      .populate({
        path: "packingItemId",
        select: "JobCharge ItemCategory ItemName _id",
      });

    if (data.itemCategory && data.itemCategory !== 'Select' && data.itemCategory.trim() !== "") {
      response = response.filter((item) =>
        item.packingItemId?.ItemCategory === data.itemCategory
      );
    }

    if (data.itemId && data.itemId.trim() !== "") {
      response = response.filter((item) =>
        item.packingItemId?._id?.toString() === data.itemId?.toString())
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
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getProductCostingReport = async (req, res) => {
  try {
    let apiData = req.body.data;
    let data = getRequestData(apiData, "PostApi");

    let response = {}

    let rmFormulaList = []
    if (data.productId) {
      let rmFModel = await rmFormulaModel()
      rmFormulaList = await rmFModel
        .find({ productId: data.productId, isDeleted: false })
        .select("netQty rmName uom")
        .populate({
          path: "rmId",
          select: "rmName rmUOM testingCharge rmPurchaseRate _id",
        });

      rmFormulaList = await Promise.all(
        rmFormulaList.map(async (item) => {
          let itemObject = item.toObject();
          let gemDetailsModel = await grnEntryMaterialDetailsModel();
          const grnEntryForMaterial = await gemDetailsModel.find({ rawMaterialId: itemObject.rmId });
          const lastRecord = grnEntryForMaterial.at(-1);
          if (lastRecord) {
            itemObject.grnRate = lastRecord.rate;
            itemObject.lastPurchaseDate = lastRecord.createdAt;
            itemObject.isGrnRecord = true;
          } else {
            itemObject.grnRate = 0;
            itemObject.lastPurchaseDate = '';
            itemObject.isGrnRecord = false;
          }
          return itemObject;
        })
      );
    }

    let pmFormulaList = []
    if (data.packingId) {
      let pmfModel = await pmFormulaModel()
      pmFormulaList = await pmfModel
        .find({ itemId: data.packingId, isDeleted: false })
        .select("netQty pmName uom batchSize")
        .populate({
          path: "packageMaterialId",
          select: "pmName pmUOM pmTestingCharge pmPurchaseRate _id",
        });

      pmFormulaList = await Promise.all(
        pmFormulaList.map(async (item) => {
          let itemObject = item.toObject();
          let gemDetailsModel = await grnEntryMaterialDetailsModel();
          const grnEntryForMaterial = await gemDetailsModel.find({ packageMaterialId: itemObject.packageMaterialId });
          const lastRecord = grnEntryForMaterial.at(-1);
          if (lastRecord) {
            itemObject.grnRate = lastRecord.rate;
            itemObject.lastPurchaseDate = lastRecord.createdAt;
            itemObject.isGrnRecord = true;
          } else {
            itemObject.grnRate = 0;
            itemObject.lastPurchaseDate = '';
            itemObject.isGrnRecord = false;
          }
          return itemObject;
        })
      );
    }

    response.rmFormulaList = rmFormulaList;
    response.pmFormulaList = pmFormulaList;

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
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getProductDetailsForBatchClearedByProductId = async (req, res) => {
  try {
    const { id } = req.query;
    let reqId = getRequestData(id);
    let response = [];
    if (reqId) {
      let batchClrModel = await batchClearingEntryModel()
      response = await batchClrModel
        .find({
          productDetialsId: reqId,
          isDeleted: false,
        })
        .populate({
          path: "productDetialsId",
          select: "productionNo productionPlanningDate despDate",
        })
        .populate({
          path: "packingItemId",
          select: "UnitQuantity Packing JobCharge",
        });
    }
    let encryptData = encryptionAPI(response, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Items fetched successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });
  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getBatchCostingReportRMFormulaId = async (req, res) => {
  try {

    const { id } = req.query;
    let reqId = getRequestData(id)

    let prRMFormulaModel = await ProductionRequisitionRMFormulaModel();
    let response = await prRMFormulaModel.find({ productDetialsId: reqId, isDeleted: false });

    response = await Promise.all(
      response.map(async (item) => {
        let itemObject = item.toObject();

        let rmFModel = await rawMaterialSchema()
        const rmId = await rmFModel.findOne({ rmName: item.rmName, isDeleted: false }).select('_id')

        let gemDetailsModel = await grnEntryMaterialDetailsModel();
        const grnEntryForMaterial = await gemDetailsModel
          .find({ rawMaterialId: rmId._id })
          .populate({
            path: "grnEntryPartyDetailId",
            select: "grnNo _id",
          });

        const lastRecord = grnEntryForMaterial.at(-1);
        if (lastRecord) {
          itemObject.grnRate = lastRecord.rate;
          itemObject.lastPurchaseDate = lastRecord.createdAt;
          itemObject.grnNo = lastRecord.grnEntryPartyDetailId.grnNo;
          itemObject.isGrnRecord = true;
        } else {
          itemObject.grnRate = 0;
          itemObject.lastPurchaseDate = '';
          itemObject.grnNo = '-';
          itemObject.isGrnRecord = false;
        }
        return itemObject;
      })
    );

    let encryptData = encryptionAPI(response, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Stock Wise Raw material formula fetched successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });

  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getBatchCostingReportPMFormulaById = async (req, res) => {
  try {

    const { id } = req.query;
    let reqId = getRequestData(id)

    let prPMFormualModel = await PackingRequisitionPMFormulaModel()
    let response = await prPMFormualModel.find({ productDetialsId: reqId, isDeleted: false });

    response = await Promise.all(
      response.map(async (item) => {
        let itemObject = item.toObject();

        let pmfModel = await pmFormulaModel()
        const pmId = await pmfModel.findOne({ pmName: item.pmName, isDeleted: false })

        let gemDetailsModel = await grnEntryMaterialDetailsModel();
        const grnEntryForMaterial = await gemDetailsModel
          .find({ packageMaterialId: pmId.packageMaterialId })
          .populate({
            path: "grnEntryPartyDetailId",
            select: "grnNo _id",
          });

        const lastRecord = grnEntryForMaterial.at(-1);
        if (lastRecord) {
          itemObject.grnRate = lastRecord.rate;
          itemObject.lastPurchaseDate = lastRecord.createdAt;
          itemObject.grnNo = lastRecord.grnEntryPartyDetailId.grnNo;
          itemObject.isGrnRecord = true;
        } else {
          itemObject.grnRate = 0;
          itemObject.lastPurchaseDate = '';
          itemObject.grnNo = '-';
          itemObject.isGrnRecord = false;
        }
        return itemObject;
      })
    );

    let encryptData = encryptionAPI(response, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Stock Wise Raw material formula fetched successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });

  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getAllMaterialRequirementReportForRM = async (req, res) => {
  try {
    let apiData = req.body.data;
    let data = getRequestData(apiData, "PostApi");

    let queryObject = {
      isDeleted: false,
      rawMaterialId: { $ne: null },
    };

    let responseData = await Promise.all(
      data.map(async (item) => {
        let rmFModel = await rmFormulaModel();
        const formulas = await rmFModel
          .find({ productId: item.productId, isDeleted: false })
          .select('qty netQty rmName uom stageName rmId');

        return formulas.map((formula) => ({
          ...formula._doc,
          netQty: formula.netQty * Number(item.batchSize),
        }));
      })
    );


    responseData = responseData.flat();
    // Aggregate data based on rmName and uom
    const aggregatedData = responseData.reduce((acc, curr) => {
      const existingItem = acc.find(
        (item) => item.rmName === curr.rmName && item.uom === curr.uom
      );
      if (existingItem) {
        existingItem.qty += curr.qty;
        existingItem.netQty += curr.netQty;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, []);

    let gemDetailsModel = await grnEntryMaterialDetailsModel();
    const grnEntryForStock = await gemDetailsModel
      .find(queryObject)
      .populate({
        path: 'rawMaterialId',
        select: 'rmName rmUOM minQty rmCategory _id',
      });

    const stockData = grnEntryForStock.reduce((acc, entry) => {
      const { rmName, rmUOM } = entry.rawMaterialId;
      const quantity = entry.qty || 0;

      if (!acc[rmName]) {
        acc[rmName] = {
          rmName,
          totalQuantity: 0,
          rmUOM,
        };
      }

      acc[rmName].totalQuantity += quantity;
      return acc;
    }, {});

    let prRMFormulaModel = await ProductionRequisitionRMFormulaModel();
    let giRMItemModel = await gstinvoiceRMItemModel();
    let addEntryModel = await additionalEntryMaterialDetailsModel();
    let rmModel = await rawMaterialSchema()

    const enrichedFormulaResponse = await Promise.all(
      aggregatedData.map(async (item) => {
        const stock = stockData[item.rmName] || { totalQuantity: 0, rmUOM: null };

        // GST Invoice Qty Remove
        let gstInvoiceUsedQty = await giRMItemModel.find({ itemId: item.rmId, isDeleted: false }).select('qty');
        let totalGSTInvoiceUsed = gstInvoiceUsedQty.reduce((sum, gItem) => sum + (gItem.qty || 0), 0);

        // Production Qty Remove
        let productionUsedQty = await prRMFormulaModel.find({ isDeleted: false, rmName: item.rmName }).select('netQty');
        let totalUsedQty = productionUsedQty.reduce((sum, pItem) => sum + (pItem.netQty || 0), 0);

        // Additional Qty Remove
        let additionalEntry = await addEntryModel.find({ rawMaterialId: item.rmId, isDeleted: false }).select('qty');
        let additionalEntryUsed = additionalEntry.reduce((sum, aItem) => sum + (aItem.qty || 0), 0);

        let finalQty = stock.totalQuantity - totalUsedQty - totalGSTInvoiceUsed - additionalEntryUsed;

        let rawMaterialUOM = await rmModel.findOne({ _id: item.rmId, isDeleted: false }).select('rmUOM');
        let itemUOM = stock.rmUOM ? stock.rmUOM : rawMaterialUOM.rmUOM
        const convertedNetQty = convertNetQty(item.netQty, item.uom, itemUOM);

        return {
          ...item,
          rmUOM: itemUOM,
          netQty: convertedNetQty,
          totalStock: finalQty,
        };
      })
    );

    function convertNetQty(netQty, uom, rmUOM) {
      if (uom === rmUOM) {
        return netQty;
      }

      if (uom === 'MCG') {
        if (rmUOM === 'KGS') {
          return netQty / 1000000000;
        }
        if (rmUOM === 'GM') {
          return netQty / 1000000;
        }
        if (rmUOM === 'MG') {
          return netQty / 1000;
        }
      }

      if (uom === 'GM') {
        if (rmUOM === 'KGS') {
          return netQty / 1000;
        }
        if (rmUOM === 'MG') {
          return netQty * 1000;
        }
      }

      if (uom === 'MG') {
        if (rmUOM === 'KGS') {
          return netQty / 1000000;
        }
        if (rmUOM === 'GM') {
          return netQty / 1000;
        }
      }

      if (uom === 'KGS') {
        if (rmUOM === 'MG') {
          return netQty * 1000000;
        }
        if (rmUOM === 'GM') {
          return netQty * 1000;
        }
      }
      if (uom === 'LTR') {
        return netQty * 1000
      }

      if (uom === 'ML') {
        return netQty / 1000
      }
      return netQty;
    }

    let encryptData = encryptionAPI(enrichedFormulaResponse, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Production Planning Details fetched successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });

  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};

const getAllMaterialRequirementReportForPM = async (req, res) => {
  try {
    let apiData = req.body.data;
    let data = getRequestData(apiData, "PostApi");

    let queryObject = {
      isDeleted: false,
      packageMaterialId: { $ne: null },
    };

    let responseData = await Promise.all(
      data.map(async (item) => {

        let pmfModel = await pmFormulaModel()
        const formulas = await pmfModel
          .find({ itemId: item.packingId, isDeleted: false })
          .select('qty netQty pmName uom stageName batchSize packageMaterialId');

        return formulas.map((formula) => ({
          ...formula._doc,
          netQty: (formula.netQty / formula.batchSize) * Number(item.batchSize),
        }));
      })
    );

    responseData = responseData.flat();

    const aggregatedData = responseData.reduce((acc, curr) => {
      const existingItem = acc.find(
        (item) => item.pmName === curr.pmName && item.uom === curr.uom
      );
      if (existingItem) {
        existingItem.qty += curr.qty;
        existingItem.netQty += curr.netQty;
      } else {
        acc.push({ ...curr });
      }

      return acc;
    }, []);

    let gemDetailsModel = await grnEntryMaterialDetailsModel();
    const grnEntryForStock = await gemDetailsModel
      .find(queryObject)
      .populate({
        path: 'packageMaterialId',
        select: 'pmName pmUOM pmMinQty pmCategory _id',
      });

    const stockData = grnEntryForStock.reduce((acc, entry) => {
      const pmName = entry.packageMaterialId.pmName;
      const pmUOM = entry.packageMaterialId.pmUOM;
      const quantity = entry.qty || 0;

      if (!acc[pmName]) {
        acc[pmName] = {
          pmName,
          totalQuantity: 0,
          pmUOM,
        };
      }

      acc[pmName].totalQuantity += quantity;
      return acc;
    }, {});

    let addEntryModel = await additionalEntryMaterialDetailsModel()
    let giPMItemModel = await gstInvoicePMItemModel()
    let prPMFormulaModel = await PackingRequisitionPMFormulaModel();

    const enrichedFormulaResponse = await Promise.all(
      aggregatedData.map(async (item) => {
        const stock = stockData[item.pmName] || { totalQuantity: 0, pmUOM: null };

        // GST Invoice Qty Remove
        let gstInvoiceUsedQty = await giPMItemModel.find({ itemId: item.packageMaterialId, isDeleted: false }).select('qty');
        let totalGSTInvoiceUsed = gstInvoiceUsedQty.reduce((sum, gItem) => sum + (gItem.qty || 0), 0);

        // Production Qty Remove
        let productionUsedQty = await prPMFormulaModel.find({ isDeleted: false, pmName: item.pmName }).select('netQty');
        let totalUsedQty = productionUsedQty.reduce((sum, pItem) => sum + (pItem.netQty || 0), 0);

        // Additional Qty Remove
        let additionalEntry = await addEntryModel.find({ packageMaterialId: item.packageMaterialId, isDeleted: false }).select('qty');
        let additionalEntryUsed = additionalEntry.reduce((sum, aItem) => sum + (aItem.qty || 0), 0);

        // console.log(item.pmName, stadditionalEntryock.totalQuantity, totalUsedQty, totalGSTInvoiceUsed, additionalEntryUsed)
        let finalQty = stock.totalQuantity - totalUsedQty - totalGSTInvoiceUsed - additionalEntryUsed;

        return {
          ...item,
          pmUOM: stock.pmUOM,
          totalStock: finalQty,
        };
      }));

    let encryptData = encryptionAPI(enrichedFormulaResponse, 1);

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Production Planning Details fetched successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });

  } catch (error) {
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
  }
};


export {
  addEditProductionPlanningEntry,
  getAllProductionPlanningEntry,
  getProductionPlanningEntryById,
  deleteProductionPlanningEntryById,
  getRMFormulaForProductionById,
  productionRequisitionRMFormulaListing,
  getProductionRMFOrmulaByProductionDetailsId,
  removeProductionPlanningEntryFromProductionRequisition,
  getPMFormulaByPackingItemId,
  packingRequisitionPMFormulaListing,
  getProductionPMFOrmulaByProductionDetailsId,
  removeProductionPlanningEntryFromPackingRequisition,
  addEditBatchClearingEntry,
  getBatchClearingEntryByProductId,
  removeProductionPlanningEntryFromBatchCLearingEntryById,
  getAllBatchClearedRecords,
  deleteBatchCLearingEntryById,
  getAllPendingProductionPlanningReport,
  getAllProductionBatchRegister,
  getAllJobChargeRecords,
  getProductCostingReport,
  getProductDetailsForBatchClearedByProductId,
  getBatchCostingReportRMFormulaId,
  getBatchCostingReportPMFormulaById,
  getAllMaterialRequirementReportForRM,
  getAllMaterialRequirementReportForPM
};
