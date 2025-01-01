import express from "express";
import { addEditAdditionalEntryMaterialMapping, addEditGRNEntryMaterialMapping, addEditInquiryDetails, addEditPurchaseOrderDetails, addEditPurchaserOrderMaterialDetails, approvePurchaseOrderByPurchaseId, deleteAdditionalEntryDetailsById, deleteAdditionalEntryMaterialDetailsById, deleteGRNEntryMaterialDetailsById, deleteInquiryDetailsById, deleteInquiryMaterialDetailsById, deleteItemforGRNEntryMaterialById, deletePurchaseOrderDetailsById, deletepurchaseOrderMaterialDetialsById, getAllAdditionalEntryList, getAllAdditionalEntryMaterialDetailsById, getAllGoodsRegistered, getAllgrnEntryMaterialDetailsById, getallInquiryDetails, getAllInquiryMaterialDetailsByInquiryId, getAllItemsForStockLedgerReport, getAllMaterialWisePurchaseReport, getAllNearExpiryReport, getAllPartyListForGRNEntry, getAllPurchaseOrderRegister, getAllPurchaseOrders, getAllShourtageReport, getAllStatementForPurchaseItemByItemId, getPurchaseOrderMaterialDetailsByPurchaseOrderId, sendInquiryToCompany, sendPurchaseOrderMail } from "../controller/inventoryController.js";

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
inventoryRoute.post("/Inventory/SendPurchaseOrderMail", sendPurchaseOrderMail);
inventoryRoute.get("/Inventory/ApprovePurchaseOrderByPurchaseId", approvePurchaseOrderByPurchaseId);

// Inventory - G.R.N Entry
inventoryRoute.post("/Inventory/AddEditInquiryDetails", addEditInquiryDetails);
inventoryRoute.post("/Inventory/GetallInquiryDetails", getallInquiryDetails);
inventoryRoute.get("/Inventory/GetAllInquiryMaterialDetailsByInquiryId", getAllInquiryMaterialDetailsByInquiryId);
inventoryRoute.get("/Inventory/DeleteInquiryDetailsById", deleteInquiryDetailsById);
inventoryRoute.get("/Inventory/DeleteInquiryMaterialDetailsById", deleteInquiryMaterialDetailsById);
inventoryRoute.post("/Inventory/SendInquiryToCompany", sendInquiryToCompany);

// Reports
inventoryRoute.post("/Inventory/GetAllGoodsRegistered", getAllGoodsRegistered);
inventoryRoute.post("/Inventory/GetAllMaterialWisePurchaseReport", getAllMaterialWisePurchaseReport);
inventoryRoute.post("/Inventory/GetAllItemsForStockLedgerReport", getAllItemsForStockLedgerReport);
inventoryRoute.post("/Inventory/GetAllStatementForPurchaseItemByItemId", getAllStatementForPurchaseItemByItemId);
inventoryRoute.post("/Inventory/GetAllShourtageReport", getAllShourtageReport);
inventoryRoute.post("/Inventory/GetAllNearExpiryReport", getAllNearExpiryReport);
inventoryRoute.post("/Inventory/GetAllPurchaseOrderRegister", getAllPurchaseOrderRegister);

export default inventoryRoute;
