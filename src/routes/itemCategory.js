import express from "express";
import { addEditItemGategory, deleteCategoryById } from "../controller/itemGategory.js";

const itemCategoryRoute = express.Router();

itemCategoryRoute.post("/itemCategory/AddEditItemGategory", addEditItemGategory);
itemCategoryRoute.get("/itemCategory/DeleteCategoryById", deleteCategoryById);

export default itemCategoryRoute;
