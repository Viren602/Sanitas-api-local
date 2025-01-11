import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import grnEntryMaterialDetailsModel from "../model/InventoryModels/grnEntryMaterialDetailsModel.js";
import PackingRequisitionPMFormulaModel from "../model/InventoryModels/packingRequisitionPMFormulaModel.js";
import ProductionRequisitionRMFormulaModel from "../model/InventoryModels/productionRequisitionRMFormulaModel.js";
import pmFormulaModel from "../model/pmFormulaModel.js";
import productionPlanningEntryModel from "../model/ProductionModels/productionPlanningEntryModel.js";
import rmFormulaModel from "../model/rmFormulaModel.js";

const addEditProductionPlanningEntry = async (req, res) => {
  try {
    let apiData = req.body.data;
    let reqData = getRequestData(apiData, "PostApi");
    let responseData = {};

    reqData.productionStageStatusId = reqData.productionStageId;

    if (reqData.productDetialsId && reqData.productDetialsId.trim() !== "") {
      const response = await productionPlanningEntryModel.findByIdAndUpdate(
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

      const lastRecord = await productionPlanningEntryModel
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

      const response = new productionPlanningEntryModel(reqData);
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
    console.log("error in production controller", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllProductionPlanningEntry = async (req, res) => {
  try {
    let apiData = req.body.data;
    let data = getRequestData(apiData, "PostApi");
    let queryObject = {
      isDeleted: false,
    };

    if (data.productionStageId > 0) {
      queryObject.productionStageStatusId = data.productionStageId
    }

    let filterBy = "productionNo";

    if (data.filterBy && data.filterBy.trim() !== "") {
      filterBy = data.filterBy;
    }

    let response = await productionPlanningEntryModel
      .find(queryObject)
      .sort(filterBy)
      .populate({
        path: "partyId",
        select: "partyName _id",
      })
      .populate({
        path: "productId",
        select: "productName _id",
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
    console.log("error in inventory controller", error);
    res.status(500).json({ error: error.message });
  }
};

const getProductionPlanningEntryById = async (req, res) => {
  try {
    const { id } = req.query;
    let reqId = getRequestData(id);
    let response = [];
    if (reqId) {
      response = await productionPlanningEntryModel
        .findOne({
          _id: reqId,
          isDeleted: false,
        })
        .populate({
          path: "productId",
          select: "productName color sizeName _id",
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
    console.log("error in Inventory controller", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteProductionPlanningEntryById = async (req, res) => {
  try {
    const { id } = req.query;
    let reqId = getRequestData(id);
    let response = {};
    if (reqId) {
      response = await productionPlanningEntryModel.findByIdAndUpdate(
        reqId,
        { isDeleted: true },
        { new: true, useFindAndModify: false }
      );
    }

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
    console.log("error in inventory controller", error);
    res.status(500).json({ error: error.message });
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

    const formulaResponse = await rmFormulaModel
      .find({ productId: reqId, isDeleted: false })
      .select('qty netQty rmName uom stageName');

    const grnEntryForStock = await grnEntryMaterialDetailsModel
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

    const enrichedFormulaResponse = formulaResponse.map((item) => {
      const stock = stockData[item.rmName] || { totalQuantity: 0, rmUOM: null };
      const convertedNetQty = convertNetQty(item.netQty, item.uom, stock.rmUOM);
      return {
        ...item.toObject(),
        rmUOM: stock.rmUOM,
        netQty: convertedNetQty,
        totalStock: stock.totalQuantity,
      };
    });


    function convertNetQty(netQty, uom, rmUOM) {
      if (uom === rmUOM) {
        return netQty;
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
        Message: "Stock Wise Raw material formula fetched successfully",
        responseData: encryptData,
        isEnType: true,
      },
    });

  } catch (error) {
    console.log("error in item master controller", error);
    res.status(500).json({ error: error.message });
  }
};

const productionRequisitionRMFormulaListing = async (req, res) => {
  try {
    let apiData = req.body.data;
    let reqData = getRequestData(apiData, "PostApi");
    let responseData = {};

    const existingRecords = await ProductionRequisitionRMFormulaModel.find({
      productId: reqData.productId,
    });

    if (existingRecords && existingRecords.length > 0) {
      await ProductionRequisitionRMFormulaModel.deleteMany({
        productId: reqData.productId,
      });
      console.log(`Deleted existing records for productId: ${reqData.productId}`);
    }

    const newRecords = reqData.rmFormulaArray.map((item) => ({
      ...item,
      productId: reqData.productId,
    }));
    const result = await ProductionRequisitionRMFormulaModel.insertMany(newRecords);

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
    console.log("error in production controller", error);
    res.status(500).json({ error: error.message });
  }
};

const getProductionRMFOrmulaByProductionDetailsId = async (req, res) => {
  try {

    const { id } = req.query;
    let reqId = getRequestData(id)

    const response = await ProductionRequisitionRMFormulaModel
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
    console.log("error in item master controller", error);
    res.status(500).json({ error: error.message });
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

    const formulaResponse = await pmFormulaModel
      .find({ itemId: reqId, isDeleted: false })
      .select('qty netQty pmName uom stageName');

    const grnEntryForStock = await grnEntryMaterialDetailsModel
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

    const enrichedFormulaResponse = formulaResponse.map((item) => {
      const stock = stockData[item.pmName] || { totalQuantity: 0, pmUOM: null };
      return {
        ...item.toObject(),
        pmUOM: stock.pmUOM,
        totalStock: stock.totalQuantity,
      };
    });



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
    console.log("error in item master controller", error);
    res.status(500).json({ error: error.message });
  }
};

const packingRequisitionPMFormulaListing = async (req, res) => {
  try {
    let apiData = req.body.data;
    let reqData = getRequestData(apiData, "PostApi");
    let responseData = {};

    const existingRecords = await PackingRequisitionPMFormulaModel.find({
      packingItemId: reqData.packingItemId,
    });

    if (existingRecords && existingRecords.length > 0) {
      await PackingRequisitionPMFormulaModel.deleteMany({
        packingItemId: reqData.packingItemId,
      });
      console.log(`Deleted existing records for packingItemId: ${reqData.packingItemId}`);
    }

    const newRecords = reqData.pmFormulaArray.map((item) => ({
      ...item,
      packingItemId: reqData.packingItemId,
    }));

    const result = await PackingRequisitionPMFormulaModel.insertMany(newRecords);

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
    console.log("error in production controller", error);
    res.status(500).json({ error: error.message });
  }
};

const getProductionPMFOrmulaByProductionDetailsId = async (req, res) => {
  try {

    const { id } = req.query;
    let reqId = getRequestData(id)

    const response = await PackingRequisitionPMFormulaModel
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
    console.log("error in item master controller", error);
    res.status(500).json({ error: error.message });
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
  getPMFormulaByPackingItemId,
  packingRequisitionPMFormulaListing,
  getProductionPMFOrmulaByProductionDetailsId
};
