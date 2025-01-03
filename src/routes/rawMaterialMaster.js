import express from "express";
import { addEditRawMaterial, deleteRawMaterialById, getAllRawMaterials, getRawMaterialById } from "../controller/rawMaterialMasterController.js";
import checkAuth from "../middleware/checkAuth.js";

const rawMaterialMasterRoutes = express.Router();

rawMaterialMasterRoutes.post("/rawMaterialMaster/AddEditRawMaterial", checkAuth, addEditRawMaterial);
rawMaterialMasterRoutes.get("/rawMaterialMaster/GetAllRawMaterials", checkAuth, getAllRawMaterials);
rawMaterialMasterRoutes.get("/rawMaterialMaster/GetRawMaterialById", checkAuth, getRawMaterialById);
rawMaterialMasterRoutes.get("/rawMaterialMaster/DeleteRawMaterialById", checkAuth, deleteRawMaterialById);

export default rawMaterialMasterRoutes;
