import express from "express";
import { addEditRawMaterial, deleteRawMaterialById, getAllRawMaterials, getRawMaterialById } from "../controller/rawMaterialMasterController.js";

const rawMaterialMasterRoutes = express.Router();

rawMaterialMasterRoutes.post("/rawMaterialMaster/AddEditRawMaterial", addEditRawMaterial);
rawMaterialMasterRoutes.get("/rawMaterialMaster/GetAllRawMaterials", getAllRawMaterials);
rawMaterialMasterRoutes.get("/rawMaterialMaster/GetRawMaterialById", getRawMaterialById);
rawMaterialMasterRoutes.get("/rawMaterialMaster/DeleteRawMaterialById", deleteRawMaterialById);

export default rawMaterialMasterRoutes;
