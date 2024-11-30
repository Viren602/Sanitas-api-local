import express from "express";
import { getAllHSNCode, getAllItemCategory } from "../controller/commonController.js";

const commonServices = express.Router();

commonServices.get("/common/GetAllItemCategory",getAllItemCategory);
commonServices.get("/common/GetAllHSNCode",getAllHSNCode);

export default commonServices;
