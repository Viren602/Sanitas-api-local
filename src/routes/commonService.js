import express from "express";
import { getAllAccountGroups, getAllColors, getAllDaybooks, getAllHSNCode, getAllItem, getAllItemCategory, getAllLabelClaims, getAllMfgLicMaster, getAllPackingMaterialDropdown, getAllPackingMaterialSize, getAllPartyDropdown, getAllPMCategory, getAllProductDropdown, getAllProductionStageMaster, getAllPunchSizes, getAllRMCategory, getAllRMDropdown, getAllStates, getAllStereoData, getAllStorageConditions, getAllTransportCourier, getCompanyDetails } from "../controller/commonController.js";
import checkAuth from "../middleware/checkAuth.js";

const commonServices = express.Router();

commonServices.get("/common/GetAllItemCategory", checkAuth, getAllItemCategory);
commonServices.get("/common/GetAllHSNCode", checkAuth, getAllHSNCode);
commonServices.get("/common/GetAllRMCategory", checkAuth, getAllRMCategory);
commonServices.get("/common/GetAllPMCategory", checkAuth, getAllPMCategory);
commonServices.get("/common/GetAllPackingMaterialSize", checkAuth, getAllPackingMaterialSize);
commonServices.get("/common/GetAllStates", checkAuth, getAllStates);
commonServices.get("/common/GetAllStereoData", checkAuth, getAllStereoData);
commonServices.get("/common/GetAllLabelClaims", checkAuth, getAllLabelClaims);
commonServices.get("/common/GetAllStorageConditions", checkAuth, getAllStorageConditions);
commonServices.get("/common/GetAllColors", checkAuth, getAllColors);
commonServices.get("/common/GetAllMfgLicMaster", checkAuth, getAllMfgLicMaster);
commonServices.get("/common/GetAllProductionStageMaster", checkAuth, getAllProductionStageMaster);
commonServices.get("/common/GetAllPunchSizes", checkAuth, getAllPunchSizes);
commonServices.get("/common/GetAllAccountGroups", checkAuth, getAllAccountGroups);
commonServices.get("/common/GetAllTransportCourier", checkAuth, getAllTransportCourier);
commonServices.get("/common/GetAllDaybooks", checkAuth, getAllDaybooks);
commonServices.get("/common/GetAllPartyDropdown", checkAuth, getAllPartyDropdown);
commonServices.get("/common/GetAllItem", checkAuth, getAllItem);
commonServices.get("/common/GetAllProductDropdown", checkAuth, getAllProductDropdown);
commonServices.get("/common/GetAllRMDropdown", checkAuth, getAllRMDropdown);
commonServices.get("/common/GetAllPackingMaterialDropdown", checkAuth, getAllPackingMaterialDropdown);
commonServices.get("/common/GetCompanyDetails", checkAuth, getCompanyDetails);

export default commonServices;
