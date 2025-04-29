import mongoose from "mongoose";
import companyItems from "../model/companyItems.js";
import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import errorHandler from "../server/errorHandle.js";


const addEditItems = async (req, res) => {
  try {
    let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
    let data = req.body.data
    let reqData = getRequestData(data, 'PostApi')
    if (reqData._id && reqData._id.trim() !== '') {
      let cIModel = await companyItems(dbYear)
      const response = await cIModel.findByIdAndUpdate(reqData._id, reqData, { new: true });
      if (response) {

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
          data: {
            statusCode: 200,
            Message: "Item updated successfully",
            responseData: encryptData,
            isEnType: true
          },
        });
      } else {
        res.status(404).json({ Message: "Item not found" });
      }
    } else {
      let cIModel = await companyItems(dbYear)
      const existingItemByName = await cIModel.findOne({ ItemName: reqData.ItemName.trim(), IsDeleted: false });
      if (existingItemByName) {
        let encryptData = encryptionAPI(existingItemByName, 1)
        res.status(200).json({
          data: {
            statusCode: 409,
            Message: "Item with the same name already exists",
            responseData: encryptData,
            isEnType: true
          },
        });
      } else {
        let cIModel = await companyItems(dbYear)
        const response = new cIModel(reqData);
        await response.save();

        let encryptData = encryptionAPI(response, 1)
        res.status(200).json({
          data: {
            statusCode: 200,
            Message: "Item added successfully",
            responseData: encryptData,
            isEnType: true
          },
        });
      }
    }

  } catch (error) {
    console.log("Error in Item Master controller", error);
    errorHandler(error, req, res, "Error in Item Master controller")
  }
};

const getAllItems = async (req, res) => {
  try {
    let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
    const { id } = req.query;
    let reqId = getRequestData(id)
    let queryObject = { IsDeleted: false }
    if (reqId && reqId.trim() !== "") {
      queryObject.ItemName = { $regex: `^${reqId}`, $options: "i" };
    }

    let cIModel = await companyItems(dbYear)
    let response = await cIModel.find(queryObject).select('ItemName ItemCategory BasicRate DiscountRate MinimumQty MaximumQty MrpRs HSNCode').sort("ItemName");

    let encryptData = encryptionAPI(response, 1)
    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Order details deleted successfully",
        responseData: encryptData,
        isEnType: true
      },
    });

    // res.status(201).json({ Message: "Items fetched successfully", responseContent: response });
  } catch (error) {
    console.log("Error in Item Master controller", error);
    errorHandler(error, req, res, "Error in Item Master controller")
  }
};

const getItemById = async (req, res) => {
  try {
    let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
    const { id } = req.query;
    let reqId = getRequestData(id)
    let response = {}
    if (reqId) {
      let cIModel = await companyItems(dbYear)
      response = await cIModel.findOne({ _id: reqId });
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

    // res.status(201).json({ Message: "Items fetched successfully", responseContent: response });
  } catch (error) {
    console.log("Error in Item Master controller", error);
    errorHandler(error, req, res, "Error in Item Master controller")
  }
};

const deleteItemById = async (req, res) => {
  try {
    let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
    const { id } = req.query;
    let reqId = getRequestData(id)
    let response = {}
    if (reqId) {
      let cIModel = await companyItems(dbYear)
      response = await cIModel.findByIdAndUpdate(reqId, { IsDeleted: true }, { new: true, useFindAndModify: false });
    }

    let encryptData = encryptionAPI(response, 1)
    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "Item has been deleted",
        responseData: encryptData,
        isEnType: true
      },
    });


    // res.status(201).json({ Message: "Item has been deleted", responseContent: response });
  } catch (error) {
    console.log("Error in Item Master controller", error);
    errorHandler(error, req, res, "Error in Item Master controller")
  }
};

export {
  addEditItems,
  getAllItems,
  getItemById,
  deleteItemById
};
