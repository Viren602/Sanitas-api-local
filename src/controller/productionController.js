import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import productionPlanningEntryModel from "../model/ProductionModels/productionPlanningEntryModel.js";
import ProductionStagesModel from "../model/ProductionModels/productionStagesModel.js";

const addEditProductionPlanningEntry = async (req, res) => {
  try {
    let apiData = req.body.data;
    let reqData = getRequestData(apiData, "PostApi");
    let responseData = {};

    const productionStage = await ProductionStagesModel.findOne({
      productionStageId: 1,
    });

    reqData.productionStageStatusId = productionStage.productionStageId;

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
      let nextProdctionNo = "P001";

      const lastRecord = await productionPlanningEntryModel
        .findOne()
        .sort({ productionNo: -1 })
        .select("productionNo")
        .exec();

      if (lastRecord && lastRecord.productionNo) {
        const lastNumber = parseInt(lastRecord.productionNo.slice(1), 10);
        nextProdctionNo = `P${String(lastNumber + 1).padStart(3, "0")}`;
      }

      reqData.productionNo = nextProdctionNo;
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
    let queryObject = { isDeleted: false };

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
        .findOne({ _id: reqId, isDeleted: false });
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
        let reqId = getRequestData(id)
        let response = {}
        if (reqId) {
            response = await productionPlanningEntryModel.findByIdAndUpdate(reqId, { isDeleted: true }, { new: true, useFindAndModify: false });
        }

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Production Planning Entry Deleted Successfully",
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
  addEditProductionPlanningEntry,
  getAllProductionPlanningEntry,
  getProductionPlanningEntryById,
  deleteProductionPlanningEntryById
};
