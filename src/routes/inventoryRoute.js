import express from "express";
import { addEditAdditionalEntryMaterialMapping, addEditGRNEntryMaterialMapping, addEditPurchaseOrderDetails, addEditPurchaserOrderMaterialDetails, deleteAdditionalEntryDetailsById, deleteAdditionalEntryMaterialDetailsById, deleteGRNEntryMaterialDetailsById, deleteItemforGRNEntryMaterialById, deletePurchaseOrderDetailsById, deletepurchaseOrderMaterialDetialsById, getAllAdditionalEntryList, getAllAdditionalEntryMaterialDetailsById, getAllgrnEntryMaterialDetailsById, getAllPartyListForGRNEntry, getAllPurchaseOrders, getPurchaseOrderMaterialDetailsByPurchaseOrderId } from "../controller/inventoryController.js";

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

// Inventory - Purchase Order
inventoryRoute.post("/Inventory/AddEditPurchaseOrderDetails", addEditPurchaseOrderDetails);
inventoryRoute.post("/Inventory/getAllPurchaseOrders", getAllPurchaseOrders);
inventoryRoute.post("/Inventory/AddEditPurchaserOrderMaterialDetails", addEditPurchaserOrderMaterialDetails);
inventoryRoute.get("/Inventory/GetPurchaseOrderMaterialDetailsByPurchaseOrderId", getPurchaseOrderMaterialDetailsByPurchaseOrderId);
inventoryRoute.get("/Inventory/DeletePurchaseOrderDetailsById", deletePurchaseOrderDetailsById);
inventoryRoute.get("/Inventory/DeletepurchaseOrderMaterialDetialsById", deletepurchaseOrderMaterialDetialsById);

export default inventoryRoute;
