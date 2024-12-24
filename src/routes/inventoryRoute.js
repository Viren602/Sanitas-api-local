import express from "express";
import { addEditAdditionalEntryMaterialMapping, addEditGRNEntryMaterialMapping, deleteAdditionalEntryDetailsById, deleteAdditionalEntryMaterialDetailsById, deleteGRNEntryMaterialDetailsById, deleteItemforGRNEntryMaterialById, getAllAdditionalEntryList, getAllAdditionalEntryMaterialDetailsById, getAllgrnEntryMaterialDetailsById, getAllPartyListForGRNEntry } from "../controller/inventoryController.js";

const inventoryRoute = express.Router();

// Inventory - G.R.N Entry
inventoryRoute.post("/Inventory/AddEditGRNEntryMaterialMapping", addEditGRNEntryMaterialMapping);
inventoryRoute.post("/Inventory/GetAllPartyListForGRNEntry", getAllPartyListForGRNEntry);
inventoryRoute.get("/Inventory/GetAllgrnEntryMaterialDetailsById", getAllgrnEntryMaterialDetailsById);
inventoryRoute.get("/Inventory/DeleteGRNEntryMaterialDetailsById", deleteGRNEntryMaterialDetailsById);
inventoryRoute.get("/Inventory/DeleteItemforGRNEntryMaterialById", deleteItemforGRNEntryMaterialById);

// Inventory - Additional Entry
inventoryRoute.post("/Inventory/AddEditAdditionalEntryMaterialMapping", addEditAdditionalEntryMaterialMapping);
inventoryRoute.get("/Inventory/GetAllAdditionalEntryMaterialDetailsById", getAllAdditionalEntryMaterialDetailsById);
inventoryRoute.post("/Inventory/GetAllAdditionalEntryList", getAllAdditionalEntryList);
inventoryRoute.get("/Inventory/DeleteAdditionalEntryDetailsById", deleteAdditionalEntryDetailsById);
inventoryRoute.get("/Inventory/DeleteAdditionalEntryMaterialDetailsById", deleteAdditionalEntryMaterialDetailsById);


export default inventoryRoute;
