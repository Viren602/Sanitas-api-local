import express from "express";
import { getAllAccountGroups, getAllColors, getAllDaybooks, getAllHSNCode, getAllItem, getAllItemCategory, getAllLabelClaims, getAllMfgLicMaster, getAllPackingMaterialDropdown, getAllPackingMaterialSize, getAllPartyDropdown, getAllPMCategory, getAllProductDropdown, getAllProductionStageMaster, getAllPunchSizes, getAllRMCategory, getAllRMDropdown, getAllStates, getAllStereoData, getAllStorageConditions, getAllTransportCourier } from "../controller/commonController.js";

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
commonServices.get("/common/GetAllAccountGroups", getAllAccountGroups);
commonServices.get("/common/GetAllTransportCourier", getAllTransportCourier);
commonServices.get("/common/GetAllDaybooks", getAllDaybooks);
commonServices.get("/common/GetAllPartyDropdown", getAllPartyDropdown);
commonServices.get("/common/GetAllItem", getAllItem);
commonServices.get("/common/GetAllProductDropdown", getAllProductDropdown);
commonServices.get("/common/GetAllRMDropdown", getAllRMDropdown);
commonServices.get("/common/GetAllPackingMaterialDropdown", getAllPackingMaterialDropdown);

export default commonServices;
