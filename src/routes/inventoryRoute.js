import express from "express";
import { addEditGRNEntryMaterialMapping, deleteGRNEntryMaterialDetailsById, deleteItemforGRNEntryMaterialById, getAllgrnEntryMaterialDetailsById, getAllPartyListForGRNEntry } from "../controller/inventoryController.js";

const inventoryRoute = express.Router();

inventoryRoute.post("/Inventory/AddEditGRNEntryMaterialMapping", addEditGRNEntryMaterialMapping);
inventoryRoute.post("/Inventory/GetAllPartyListForGRNEntry", getAllPartyListForGRNEntry);
inventoryRoute.get("/Inventory/GetAllgrnEntryMaterialDetailsById", getAllgrnEntryMaterialDetailsById);
inventoryRoute.get("/Inventory/DeleteGRNEntryMaterialDetailsById", deleteGRNEntryMaterialDetailsById);
inventoryRoute.get("/Inventory/DeleteItemforGRNEntryMaterialById", deleteItemforGRNEntryMaterialById);

export default inventoryRoute;
