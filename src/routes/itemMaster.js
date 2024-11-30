import express from "express";
import { addEditItems, deleteItemById, getAllItems, getItemById } from "../controller/itemMaster.js";

const itemMaster = express.Router();

itemMaster.post("/itemMaster/AddEditItems", addEditItems);
itemMaster.get("/itemMaster/GetAllItems", getAllItems);
itemMaster.get("/itemMaster/GetItemById", getItemById);
itemMaster.get("/itemMaster/DeleteItemById", deleteItemById);

export default itemMaster;
