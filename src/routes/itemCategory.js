import express from "express";
import { addEditHSNCode, addEditItemGategory, deleteCategoryById, deleteHSNCodeById } from "../controller/itemGategory.js";
import checkAuth from "../middleware/checkAuth.js";

const itemCategoryRoute = express.Router();

itemCategoryRoute.post("/itemCategory/AddEditItemGategory", checkAuth, addEditItemGategory);
itemCategoryRoute.get("/itemCategory/DeleteCategoryById", checkAuth, deleteCategoryById);
itemCategoryRoute.post("/itemCategory/AddEditHSNCode", checkAuth, addEditHSNCode);
itemCategoryRoute.get("/itemCategory/DeleteHSNCodeById", checkAuth, deleteHSNCodeById);

export default itemCategoryRoute;
