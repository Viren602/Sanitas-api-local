import express from "express";
import { addEditHSNCode, addEditItemGategory, deleteCategoryById, deleteHSNCodeById } from "../controller/itemGategory.js";

const itemCategoryRoute = express.Router();

itemCategoryRoute.post("/itemCategory/AddEditItemGategory", addEditItemGategory);
itemCategoryRoute.get("/itemCategory/DeleteCategoryById", deleteCategoryById);
itemCategoryRoute.post("/itemCategory/AddEditHSNCode", addEditHSNCode);
itemCategoryRoute.get("/itemCategory/DeleteHSNCodeById", deleteHSNCodeById);

export default itemCategoryRoute;
