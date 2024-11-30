import mongoose from "mongoose";
import companyItems from "../model/companyItems.js";


const addEditItems = async (req, res) => {
  try {
    let data = req.body.data
    if (data._id && data._id.trim() !== '') {
      const response = await companyItems.findByIdAndUpdate(data._id, data, { new: true });
      if (response) {
        res.status(200).json({ Message: "Item updated successfully", data: response });
      } else {
        res.status(404).json({ Message: "Item not found" });
      }
    } else {
      const response = new companyItems(data);
      await response.save();
      res.status(200).json({ Message: "Item added successfully", data: response });
    }

  } catch (error) {
    console.log("error in admin addEmployee controller", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllItems = async (req, res) => {
  try {
    const { id } = req.query;
    let queryObject = { IsDeleted: false }
    if (id && id.trim() !== "") {
      queryObject.ItemName = { $regex: `^${id}`, $options: "i" };
    }

    let response = await companyItems.find(queryObject).sort("ItemName");

    res.status(201).json({ Message: "Items fetched successfully", responseContent: response });
  } catch (error) {
    console.log("error in item master controller", error);
    res.status(500).json({ error: error.message });
  }
};

const getItemById = async (req, res) => {
  try {

    const { id } = req.query;
    let response = {}
    if (id) {
      response = await companyItems.findOne({ _id: id });
    }

    res.status(201).json({ Message: "Items fetched successfully", responseContent: response });
  } catch (error) {
    console.log("error in item master controller", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteItemById = async (req, res) => {
  try {

    const { id } = req.query;
    let response = {}
    if (id) {
      response = await companyItems.findByIdAndUpdate(id, { IsDeleted: true }, { new: true, useFindAndModify: false });
    }
    res.status(201).json({ Message: "Item has been deleted", responseContent: response });
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
