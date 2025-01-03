import express from "express";
import { addEditAccountGroup, addEditColors, addEditDaybook, addEditLabelClaims, addEditPackingMaterial, addEditPackingMaterialSize, addEditPartyDetails, addEditpartyWiseNetRateDetails, addEditPMCategory, addEditPMFormulaDetails, addeditProductDetails, addEditPunchSizeMaster, addEditRMCategory, addEditRMFormulaDetails, addEditStates, addEditStereo, addEditStorageConditions, addEditTransportCourier, addMfgLic, addProductionStages, deleteAccountGroupById, deleteColorById, deleteDaybookById, deleteLabelClaimById, deleteMfgLicById, deletePackingMaterialById, deletePackingMaterialSizeById, deletePartyDetailsById, deletePartyWiseNetRateById, deletePMCategoryById, deletePMFurmulaById, deleteProductDetailsById, deleteProductionStageById, deletePunchSizeById, deleteRMCategoryById, deleteRMFurmulaById, deleteStateById, deleteStereoById, deleteStorageConditionById, deleteTransportCourierById, getAllPackingMaterials, getAllParties, getAllProductDetails, getPackingMaterialById, getPartyDetailsById, getPartyWiseNetRateDetailsByPartyId, getPMFormulaByItemId, getProductDetailById, getRMFormulaByProductId } from "../controller/masterController.js";
import checkAuth from "../middleware/checkAuth.js";

const masterRoute = express.Router();

// Packing Material Master
masterRoute.post("/packingMaterialMaster/AddEditPackingMaterial", checkAuth, addEditPackingMaterial);
masterRoute.get("/packingMaterialMaster/GetAllPackingMaterials", getAllPackingMaterials);
masterRoute.get("/packingMaterialMaster/GetPackingMaterialById", checkAuth, getPackingMaterialById);
masterRoute.get("/packingMaterialMaster/DeletePackingMaterialById", checkAuth, deletePackingMaterialById);

// R.M. Category Master
masterRoute.post("/rmCategory/AddEditRMCategory", checkAuth, addEditRMCategory);
masterRoute.get("/rmCategory/DeleteRMCategoryById", checkAuth, deleteRMCategoryById);

// P.M. Category Master
masterRoute.post("/pmCategory/AddEditPMCategory", checkAuth, addEditPMCategory);
masterRoute.get("/pmCategory/DeletePMCategoryById", checkAuth, deletePMCategoryById);

// Packing Material Size
masterRoute.post("/packingMaterial/AddEditPackingMaterialSize", checkAuth, addEditPackingMaterialSize);
masterRoute.get("/packingMaterial/DeletePackingMaterialSizeById", checkAuth, deletePackingMaterialSizeById);

// State Master
masterRoute.post("/packingMaterial/AddEditStates", checkAuth, addEditStates);
masterRoute.get("/packingMaterial/DeleteStateById", checkAuth, deleteStateById);

// Stereo Master
masterRoute.post("/packingMaterial/AddEditStereo", checkAuth, addEditStereo);
masterRoute.get("/packingMaterial/DeleteStereoById", checkAuth, deleteStereoById);

// Label Claim Master
masterRoute.post("/packingMaterial/AddEditLabelClaims", checkAuth, addEditLabelClaims);
masterRoute.get("/packingMaterial/DeleteLabelClaimById", checkAuth, deleteLabelClaimById);

// Storage Condition Master
masterRoute.post("/packingMaterial/AddEditStorageConditions", checkAuth, addEditStorageConditions);
masterRoute.get("/packingMaterial/DeleteStorageConditionById", checkAuth, deleteStorageConditionById);

// Color Master
masterRoute.post("/packingMaterial/AddEditColors", checkAuth, addEditColors);
masterRoute.get("/packingMaterial/DeleteColorById", checkAuth, deleteColorById);

// MFG LIC Master
masterRoute.post("/packingMaterial/AddEditMfgLic", checkAuth, addMfgLic);
masterRoute.get("/packingMaterial/DeleteMfgLicById", checkAuth, deleteMfgLicById);

// Production Stage Master
masterRoute.post("/packingMaterial/AddEditProductionStages", checkAuth, addProductionStages);
masterRoute.get("/packingMaterial/DeleteProductionStageById", checkAuth, deleteProductionStageById);

// Punch Size Master
masterRoute.post("/packingMaterial/AddEditPunchSizeMaster", checkAuth, addEditPunchSizeMaster);
masterRoute.get("/packingMaterial/DeletePunchSizeById", checkAuth, deletePunchSizeById);

// Account Group Master
masterRoute.post("/packingMaterial/AddEditAccountGroup", checkAuth, addEditAccountGroup);
masterRoute.get("/packingMaterial/DeleteAccountGroupById", checkAuth, deleteAccountGroupById);

// Transport Courier Master
masterRoute.post("/packingMaterial/AddEditTransportCourier", checkAuth, addEditTransportCourier);
masterRoute.get("/packingMaterial/DeleteTransportCourierById", checkAuth, deleteTransportCourierById);

// Daybook Master
masterRoute.post("/packingMaterial/AddEditDaybook", checkAuth, addEditDaybook);
masterRoute.get("/packingMaterial/DeleteDaybookById", checkAuth, deleteDaybookById);

// Party Master
masterRoute.get("/itemMaster/GetAllParties", getAllParties);
masterRoute.get("/itemMaster/GetPartyDetailsById", checkAuth, getPartyDetailsById);
masterRoute.post("/packingMaterial/AddEditPartyDetails", checkAuth, addEditPartyDetails);
masterRoute.get("/packingMaterial/DeletePartyDetailsById", checkAuth, deletePartyDetailsById);

// Product Details Master
masterRoute.post("/itemMaster/AddEditProductDetails", checkAuth, addeditProductDetails);
masterRoute.get("/itemMaster/GetAllProductDetails", getAllProductDetails);
masterRoute.get("/itemMaster/GetProductDetailById", checkAuth, getProductDetailById);
masterRoute.get("/itemMaster/DeleteProductDetailsById", checkAuth, deleteProductDetailsById);

// Party Wise NetRate Master
masterRoute.post("/itemMaster/AddEditpartyWiseNetRateDetails", checkAuth, addEditpartyWiseNetRateDetails);
masterRoute.get("/itemMaster/GetPartyWiseNetRateDetailsByPartyId", checkAuth, getPartyWiseNetRateDetailsByPartyId);
masterRoute.get("/itemMaster/DeletePartyWiseNetRateById", checkAuth, deletePartyWiseNetRateById);

// RM Formula 
masterRoute.get("/itemMaster/GetRMFormulaByProductId", checkAuth, getRMFormulaByProductId);
masterRoute.post("/itemMaster/AddEditRMFormulaDetails", checkAuth, addEditRMFormulaDetails);
masterRoute.get("/itemMaster/DeleteRMFurmulaById", checkAuth, deleteRMFurmulaById);

// PM Formula 
masterRoute.get("/itemMaster/GetPMFormulaByItemId", checkAuth, getPMFormulaByItemId);
masterRoute.post("/itemMaster/AddEditPMFormulaDetails", checkAuth, addEditPMFormulaDetails);
masterRoute.get("/itemMaster/DeletePMFurmulaById", checkAuth, deletePMFurmulaById);

export default masterRoute;
