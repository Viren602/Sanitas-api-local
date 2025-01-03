import express from "express";
import { addEditItems, deleteItemById, getAllItems, getItemById } from "../controller/itemMaster.js";
import checkAuth from "../middleware/checkAuth.js";

const itemMaster = express.Router();

itemMaster.post("/itemMaster/AddEditItems", checkAuth, addEditItems);
itemMaster.get("/itemMaster/GetAllItems", checkAuth, getAllItems);
itemMaster.get("/itemMaster/GetItemById", checkAuth, getItemById);
itemMaster.get("/itemMaster/DeleteItemById", checkAuth, deleteItemById);

export default itemMaster;
