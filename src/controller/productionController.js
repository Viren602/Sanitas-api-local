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

const addEditProductionPlanningEntry = async (req, res) => {
  try {
    let apiData = req.body.data;
    let reqData = getRequestData(apiData, "PostApi");
    let responseData = {};

    const stage = await ProductionStagesModel.findOne({
      productionStageId: reqData.productionStageId,
      isDeleted: false,
    });

    reqData.productionStageStatusId = stage._id;

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

    let filterBy = "productionNo";

    if (data.filterBy && data.filterBy.trim() !== "") {
      filterBy = data.filterBy;
    }

    if (Array.isArray(data.productionStageId) && data.productionStageId.length > 0) {
      const stages = await ProductionStagesModel.find({
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

    let response = await productionPlanningEntryModel
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
      response = await productionPlanningEntryModel
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
      response = await productionPlanningEntryModel.findByIdAndUpdate(
        reqId,
        { isDeleted: true },
        { new: true, useFindAndModify: false }
      );
    }

    await PackingRequisitionPMFormulaModel.deleteMany({
      _id: reqId,
    });

    await ProductionRequisitionRMFormulaModel.deleteMany({
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
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
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
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
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
    console.log("Error in Production controller", error);
    errorHandler(error, req, res, "Error in Production controller")
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
      const response = await batchClearingEntryModel.findByIdAndUpdate(
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

      const response = new batchClearingEntryModel(reqData);
      await response.save();

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
      response = await batchClearingEntryModel
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

const getAllBatchClearedRecords = async (req, res) => {
  try {
    let apiData = req.body.data;
    let data = getRequestData(apiData, "PostApi");
    let queryObject = {
      isDeleted: false,
    };

    let response = await batchClearingEntryModel
      .find(queryObject)
      // .sort(filterBy)
      .populate({
        path: "productDetialsId",
        select: "productionNo productionPlanningDate despDate partyId productId batchNo packing batchSize  mfgDate",
        populate: {
          path: 'partyId',
          select: 'partyName _id',
        },
        populate: {
          path: 'productId',
          select: 'productName _id',
        },
      })
      .populate({
        path: "packingItemId",
        select: "JobCharge ItemName UnitQuantity",
      });;

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
      const stages = await ProductionStagesModel.find({
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

    let response = await productionPlanningEntryModel
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
      const stages = await ProductionStagesModel.find({
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

    let response = await productionPlanningEntryModel
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
        let batchClearDetails = await batchClearingEntryModel
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

    let response = await batchClearingEntryModel
      .find(queryObject)
      // .sort(filterBy)
      .populate({
        path: "productDetialsId",
        select: "productionNo productionPlanningDate despDate partyId productId batchNo packing",
        match: {
          despDate: {
            $gte: new Date(data.startDate),
            $lte: new Date(data.endDate),
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
      rmFormulaList = await rmFormulaModel
        .find({ productId: data.productId, isDeleted: false })
        .select("netQty rmName uom")
        .populate({
          path: "rmId",
          select: "rmName rmUOM testingCharge rmPurchaseRate _id",
        });

      rmFormulaList = await Promise.all(
        rmFormulaList.map(async (item) => {
          let itemObject = item.toObject();
          const grnEntryForMaterial = await grnEntryMaterialDetailsModel.find({ rawMaterialId: itemObject.rmId });
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
      pmFormulaList = await pmFormulaModel
        .find({ itemId: data.packingId, isDeleted: false })
        .select("netQty pmName uom batchSize")
        .populate({
          path: "packageMaterialId",
          select: "pmName pmUOM pmTestingCharge pmPurchaseRate _id",
        });

      pmFormulaList = await Promise.all(
        pmFormulaList.map(async (item) => {
          let itemObject = item.toObject();
          const grnEntryForMaterial = await grnEntryMaterialDetailsModel.find({ packageMaterialId: itemObject.packageMaterialId });
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
      response = await batchClearingEntryModel
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

    let response = await ProductionRequisitionRMFormulaModel.find({ productDetialsId: reqId, isDeleted: false });

    response = await Promise.all(
      response.map(async (item) => {
        let itemObject = item.toObject();

        const rmId = await rmFormulaModel.findOne({ rmName: item.rmName, isDeleted: false })

        const grnEntryForMaterial = await grnEntryMaterialDetailsModel
          .find({ rawMaterialId: rmId.rmId })
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

    let response = await PackingRequisitionPMFormulaModel.find({ productDetialsId: reqId, isDeleted: false });

    response = await Promise.all(
      response.map(async (item) => {
        let itemObject = item.toObject();

        const pmId = await pmFormulaModel.findOne({ pmName: item.pmName, isDeleted: false })

        const grnEntryForMaterial = await grnEntryMaterialDetailsModel
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
        const formulas = await rmFormulaModel
          .find({ productId: item.productId, isDeleted: false })
          .select('qty netQty rmName uom stageName');

        // return formulas
        return formulas.map((formula) => ({
          ...formula._doc,
          netQty: formula.netQty * Number(item.batchSize),
        }));
      })
    );

    responseData = responseData.flat();

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


    const enrichedFormulaResponse = aggregatedData.map((item) => {
      const stock = stockData[item.rmName] || { totalQuantity: 0, rmUOM: null };
      const convertedNetQty = convertNetQty(item.netQty, item.uom, stock.rmUOM);
      return {
        ...item,
        rmUOM: stock.rmUOM,
        netQty: convertedNetQty,
        totalStock: stock.totalQuantity,
      };
    });

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
        const formulas = await pmFormulaModel
          .find({ itemId: item.packingId, isDeleted: false })
          .select('qty netQty pmName uom stageName batchSize');

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

    const enrichedFormulaResponse = aggregatedData.map((item) => {
      const stock = stockData[item.pmName] || { totalQuantity: 0, pmUOM: null };
      return {
        ...item,
        pmUOM: stock.pmUOM,
        totalStock: stock.totalQuantity,
      };
    });

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
  getPMFormulaByPackingItemId,
  packingRequisitionPMFormulaListing,
  getProductionPMFOrmulaByProductionDetailsId,
  addEditBatchClearingEntry,
  getBatchClearingEntryByProductId,
  getAllBatchClearedRecords,
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
