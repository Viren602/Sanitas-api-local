import HNSCodesScHema from "../model/hnsCode.js";
import ItemCategory from "../model/itemCategory.js";
import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import errorHandler from "../server/errorHandle.js";

const addEditItemGategory = async (req, res) => {
  try {
    let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
    let reqData = req.body.data
    let data = getRequestData(reqData, 'PostApi')
    if (data._id && data._id.trim() !== '') {
      let icModel = await ItemCategory(dbYear)
      const response = await icModel.findByIdAndUpdate(data._id, data, { new: true });
      if (response) {

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
          data: {
            statusCode: 200,
            Message: "Category updated successfully",
            responseData: encryptData,
            isEnType: true
          },
        });
      } else {
        res.status(404).json({ Message: "Category not found" });
      }
    } else {
      let icModel = await ItemCategory(dbYear)
      const response = new icModel(data);
      await response.save();

      let encryptData = encryptionAPI(response, 1)

      res.status(200).json({
        data: {
          statusCode: 200,
          Message: "Category added successfully",
          responseData: encryptData,
          isEnType: true
        },
      });
    }

  } catch (error) {
    console.log("Error in Item Category controller", error);
    errorHandler(error, req, res, "Error in Item Category controller")
  }
};

const deleteCategoryById = async (req, res) => {
  try {
    let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
    const { id } = req.query;
    let reqId = getRequestData(id)
    let response = {}
    if (reqId) {
      let icModel = await ItemCategory(dbYear)
      response = await icModel.findByIdAndDelete(reqId, { IsDeleted: true }, { new: true, useFindAndModify: false });
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

  } catch (error) {
    console.log("Error in Item Category controller", error);
    errorHandler(error, req, res, "Error in Item Category controller")
  }
};

const addEditHSNCode = async (req, res) => {
  try {
    let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
    let apiData = req.body.data
    let data = getRequestData(apiData, 'PostApi')
    if (data._id && data._id.trim() !== '') {
      let hcModel = await HNSCodesScHema(dbYear)
      const response = await hcModel.findByIdAndUpdate(data._id, data, { new: true });
      if (response) {

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
          data: {
            statusCode: 200,
            Message: "HNSCode updated successfully",
            responseData: encryptData,
            isEnType: true
          },
        });

      } else {
        res.status(404).json({ Message: "HNSCode not found" });
      }
    } else {
      let hcModel = await HNSCodesScHema(dbYear)
      const response = new hcModel(data);
      await response.save();

      let encryptData = encryptionAPI(response, 1)

      res.status(200).json({
        data: {
          statusCode: 200,
          Message: "HNSCode added successfully",
          responseData: encryptData,
          isEnType: true
        },
      });
    }

  } catch (error) {
    console.log("Error in Item Category controller", error);
    errorHandler(error, req, res, "Error in Item Category controller")
  }
};

const deleteHSNCodeById = async (req, res) => {
  try {
    let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
    const { id } = req.query;
    let reqId = getRequestData(id)
    let response = {}
    if (reqId) {
      let hcModel = await HNSCodesScHema(dbYear)
      response = await hcModel.findByIdAndDelete(reqId, { IsDeleted: true }, { new: true, useFindAndModify: false });
    }

    let encryptData = encryptionAPI(response, 1)

    res.status(200).json({
      data: {
        statusCode: 200,
        Message: "HNSCode has been deleted",
        responseData: encryptData,
        isEnType: true
      },
    });
  } catch (error) {
    console.log("Error in Item Category controller", error);
    errorHandler(error, req, res, "Error in Item Category controller")
  }
};

export {
  addEditItemGategory,
  deleteCategoryById,
  addEditHSNCode,
  deleteHSNCodeById
};
