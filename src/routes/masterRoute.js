import express from "express";
import { addEditPackingMaterial, deletePackingMaterialById, getAllPackingMaterials, getPackingMaterialById } from "../controller/masterController.js";

const masterRoute = express.Router();

masterRoute.post("/packingMaterialMaster/AddEditPackingMaterial", addEditPackingMaterial);
masterRoute.get("/packingMaterialMaster/GetAllPackingMaterials", getAllPackingMaterials);
masterRoute.get("/packingMaterialMaster/GetPackingMaterialById", getPackingMaterialById);
masterRoute.get("/packingMaterialMaster/DeletePackingMaterialById", deletePackingMaterialById);

export default masterRoute;
