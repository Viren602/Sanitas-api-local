import express from "express";
import { getAllHSNCode, getAllItemCategory, getAllPackingMaterialSize, getAllPMCategory, getAllRMCategory, getAllStorageConditions } from "../controller/commonController.js";

const commonServices = express.Router();

commonServices.get("/common/GetAllItemCategory", getAllItemCategory);
commonServices.get("/common/GetAllHSNCode", getAllHSNCode);
commonServices.get("/common/GetAllStorageConditions", getAllStorageConditions);
commonServices.get("/common/GetAllRMCategory", getAllRMCategory);
commonServices.get("/common/GetAllPMCategory", getAllPMCategory);
commonServices.get("/common/GetAllPackingMaterialSize", getAllPackingMaterialSize);

export default commonServices;
