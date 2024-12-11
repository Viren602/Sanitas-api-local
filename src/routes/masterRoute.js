import express from "express";
import { addEditAccountGroup, addEditColors, addEditDaybook, addEditLabelClaims, addEditPackingMaterial, addEditPackingMaterialSize, addEditPartyDetails, addEditpartyWiseNetRateDetails, addEditPMCategory, addEditPMFormulaDetails, addeditProductDetails, addEditPunchSizeMaster, addEditRMCategory, addEditRMFormulaDetails, addEditStates, addEditStereo, addEditStorageConditions, addEditTransportCourier, addMfgLic, addProductionStages, deleteAccountGroupById, deleteColorById, deleteDaybookById, deleteLabelClaimById, deleteMfgLicById, deletePackingMaterialById, deletePackingMaterialSizeById, deletePartyDetailsById, deletePartyWiseNetRateById, deletePMCategoryById, deletePMFurmulaById, deleteProductDetailsById, deleteProductionStageById, deletePunchSizeById, deleteRMCategoryById, deleteRMFurmulaById, deleteStateById, deleteStereoById, deleteStorageConditionById, deleteTransportCourierById, getAllPackingMaterials, getAllParties, getAllProductDetails, getPackingMaterialById, getPartyDetailsById, getPartyWiseNetRateDetailsByPartyId, getPMFormulaByItemId, getProductDetailById, getRMFormulaByProductId } from "../controller/masterController.js";

const masterRoute = express.Router();

// Packing Material Master
masterRoute.post("/packingMaterialMaster/AddEditPackingMaterial", addEditPackingMaterial);
masterRoute.get("/packingMaterialMaster/GetAllPackingMaterials", getAllPackingMaterials);
masterRoute.get("/packingMaterialMaster/GetPackingMaterialById", getPackingMaterialById);
masterRoute.get("/packingMaterialMaster/DeletePackingMaterialById", deletePackingMaterialById);

// R.M. Category Master
masterRoute.post("/rmCategory/AddEditRMCategory", addEditRMCategory);
masterRoute.get("/rmCategory/DeleteRMCategoryById", deleteRMCategoryById);

// P.M. Category Master
masterRoute.post("/pmCategory/AddEditPMCategory", addEditPMCategory);
masterRoute.get("/pmCategory/DeletePMCategoryById", deletePMCategoryById);

// Packing Material Size
masterRoute.post("/packingMaterial/AddEditPackingMaterialSize", addEditPackingMaterialSize);
masterRoute.get("/packingMaterial/DeletePackingMaterialSizeById", deletePackingMaterialSizeById);

// State Master
masterRoute.post("/packingMaterial/AddEditStates", addEditStates);
masterRoute.get("/packingMaterial/DeleteStateById", deleteStateById);

// Stereo Master
masterRoute.post("/packingMaterial/AddEditStereo", addEditStereo);
masterRoute.get("/packingMaterial/DeleteStereoById", deleteStereoById);

// Label Claim Master
masterRoute.post("/packingMaterial/AddEditLabelClaims", addEditLabelClaims);
masterRoute.get("/packingMaterial/DeleteLabelClaimById", deleteLabelClaimById);

// Storage Condition Master
masterRoute.post("/packingMaterial/AddEditStorageConditions", addEditStorageConditions);
masterRoute.get("/packingMaterial/DeleteStorageConditionById", deleteStorageConditionById);

// Color Master
masterRoute.post("/packingMaterial/AddEditColors", addEditColors);
masterRoute.get("/packingMaterial/DeleteColorById", deleteColorById);

// MFG LIC Master
masterRoute.post("/packingMaterial/AddEditMfgLic", addMfgLic);
masterRoute.get("/packingMaterial/DeleteMfgLicById", deleteMfgLicById);

// Production Stage Master
masterRoute.post("/packingMaterial/AddEditProductionStages", addProductionStages);
masterRoute.get("/packingMaterial/DeleteProductionStageById", deleteProductionStageById);

// Punch Size Master
masterRoute.post("/packingMaterial/AddEditPunchSizeMaster", addEditPunchSizeMaster);
masterRoute.get("/packingMaterial/DeletePunchSizeById", deletePunchSizeById);

// Account Group Master
masterRoute.post("/packingMaterial/AddEditAccountGroup", addEditAccountGroup);
masterRoute.get("/packingMaterial/DeleteAccountGroupById", deleteAccountGroupById);

// Transport Courier Master
masterRoute.post("/packingMaterial/AddEditTransportCourier", addEditTransportCourier);
masterRoute.get("/packingMaterial/DeleteTransportCourierById", deleteTransportCourierById);

// Daybook Master
masterRoute.post("/packingMaterial/AddEditDaybook", addEditDaybook);
masterRoute.get("/packingMaterial/DeleteDaybookById", deleteDaybookById);

// Party Master
masterRoute.get("/itemMaster/GetAllParties", getAllParties);
masterRoute.get("/itemMaster/GetPartyDetailsById", getPartyDetailsById);
masterRoute.post("/packingMaterial/AddEditPartyDetails", addEditPartyDetails);
masterRoute.get("/packingMaterial/DeletePartyDetailsById", deletePartyDetailsById);

// Product Details Master
masterRoute.post("/itemMaster/AddEditProductDetails", addeditProductDetails);
masterRoute.get("/itemMaster/GetAllProductDetails", getAllProductDetails);
masterRoute.get("/itemMaster/GetProductDetailById", getProductDetailById);
masterRoute.get("/itemMaster/DeleteProductDetailsById", deleteProductDetailsById);

// Party Wise NetRate Master
masterRoute.post("/itemMaster/AddEditpartyWiseNetRateDetails", addEditpartyWiseNetRateDetails);
masterRoute.get("/itemMaster/GetPartyWiseNetRateDetailsByPartyId", getPartyWiseNetRateDetailsByPartyId);
masterRoute.get("/itemMaster/DeletePartyWiseNetRateById", deletePartyWiseNetRateById);

// RM Formula 
masterRoute.get("/itemMaster/GetRMFormulaByProductId", getRMFormulaByProductId);
masterRoute.post("/itemMaster/AddEditRMFormulaDetails", addEditRMFormulaDetails);
masterRoute.get("/itemMaster/DeleteRMFurmulaById", deleteRMFurmulaById);

// PM Formula 
masterRoute.get("/itemMaster/GetPMFormulaByItemId", getPMFormulaByItemId);
masterRoute.post("/itemMaster/AddEditPMFormulaDetails", addEditPMFormulaDetails);
masterRoute.get("/itemMaster/DeletePMFurmulaById", deletePMFurmulaById);

export default masterRoute;
