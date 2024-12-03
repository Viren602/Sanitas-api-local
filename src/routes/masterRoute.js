import express from "express";
import { addEditPackingMaterial, addEditPMCategory, addEditRMCategory, deletePackingMaterialById, deletePMCategoryById, deleteRMCategoryById, getAllPackingMaterials, getPackingMaterialById } from "../controller/masterController.js";

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

export default masterRoute;
