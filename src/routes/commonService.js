import express from "express";
import { getAllColors, getAllHSNCode, getAllItemCategory, getAllLabelClaims, getAllMfgLicMaster, getAllPackingMaterialSize, getAllPMCategory, getAllProductionStageMaster, getAllPunchSizes, getAllRMCategory, getAllStates, getAllStereoData, getAllStorageConditions } from "../controller/commonController.js";

const commonServices = express.Router();

commonServices.get("/common/GetAllItemCategory", getAllItemCategory);
commonServices.get("/common/GetAllHSNCode", getAllHSNCode);
commonServices.get("/common/GetAllRMCategory", getAllRMCategory);
commonServices.get("/common/GetAllPMCategory", getAllPMCategory);
commonServices.get("/common/GetAllPackingMaterialSize", getAllPackingMaterialSize);
commonServices.get("/common/GetAllStates", getAllStates);
commonServices.get("/common/GetAllStereoData", getAllStereoData);
commonServices.get("/common/GetAllLabelClaims", getAllLabelClaims);
commonServices.get("/common/GetAllStorageConditions", getAllStorageConditions);
commonServices.get("/common/GetAllColors", getAllColors);
commonServices.get("/common/GetAllMfgLicMaster", getAllMfgLicMaster);
commonServices.get("/common/GetAllProductionStageMaster", getAllProductionStageMaster);
commonServices.get("/common/GetAllPunchSizes", getAllPunchSizes);

export default commonServices;
