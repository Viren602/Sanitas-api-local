import express from "express";
import { addEditColors, addEditLabelClaims, addEditPackingMaterial, addEditPackingMaterialSize, addEditPMCategory, addEditPunchSizeMaster, addEditRMCategory, addEditStates, addEditStereo, addEditStorageConditions, addMfgLic, addProductionStages, deleteColorById, deleteLabelClaimById, deleteMfgLicById, deletePackingMaterialById, deletePackingMaterialSizeById, deletePMCategoryById, deleteProductionStageById, deletePunchSizeById, deleteRMCategoryById, deleteStateById, deleteStereoById, deleteStorageConditionById, getAllPackingMaterials, getPackingMaterialById } from "../controller/masterController.js";

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

export default masterRoute;
