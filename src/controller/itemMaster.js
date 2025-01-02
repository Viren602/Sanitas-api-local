import mongoose from "mongoose";
import companyItems from "../model/companyItems.js";
import { encryptionAPI, getRequestData } from "../middleware/encryption.js";


const addEditItems = async (req, res) => {
  try {
    let data = req.body.data
    let reqData = getRequestData(data, 'PostApi')
    if (reqData._id && reqData._id.trim() !== '') {
      const response = await companyItems.findByIdAndUpdate(reqData._id, reqData, { new: true });
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
      const response = new companyItems(reqData);
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

  } catch (error) {
    console.log("error in admin addEmployee controller", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllItems = async (req, res) => {
  try {
    const { id } = req.query;
    let reqId = getRequestData(id)
    let queryObject = { IsDeleted: false }
    if (reqId && reqId.trim() !== "") {
      queryObject.ItemName = { $regex: `^${reqId}`, $options: "i" };
    }

    let response = await companyItems.find(queryObject).select('ItemName ItemCategory BasicRate DiscountRate MinimumQty MaximumQty MrpRs HSNCode').sort("ItemName");

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
    console.log("error in item master controller", error);
    res.status(500).json({ error: error.message });
  }
};

const getItemById = async (req, res) => {
  try {

    const { id } = req.query;
    let reqId = getRequestData(id)
    let response = {}
    if (reqId) {
      response = await companyItems.findOne({ _id: reqId });
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
    console.log("error in item master controller", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteItemById = async (req, res) => {
  try {

    const { id } = req.query;
    let reqId = getRequestData(id)
    let response = {}
    if (reqId) {
      response = await companyItems.findByIdAndUpdate(reqId, { IsDeleted: true }, { new: true, useFindAndModify: false });
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
    console.log("error in item master controller", error);
    res.status(500).json({ error: error.message });
  }
};

export {
  addEditItems,
  getAllItems,
  getItemById,
  deleteItemById
};
