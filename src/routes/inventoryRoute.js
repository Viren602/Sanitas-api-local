import express from "express";
import { addEditAdditionalEntryMaterialMapping, addEditGRNEntryMaterialMapping, addEditInquiryDetails, addEditPurchaseOrderDetails, addEditPurchaserOrderMaterialDetails, approvePurchaseOrderByPurchaseId, deleteAdditionalEntryDetailsById, deleteAdditionalEntryMaterialDetailsById, deleteGRNEntryMaterialDetailsById, deleteInquiryDetailsById, deleteInquiryMaterialDetailsById, deleteItemforGRNEntryMaterialById, deletePurchaseOrderDetailsById, deletepurchaseOrderMaterialDetialsById, getAllAdditionalEntryList, getAllAdditionalEntryMaterialDetailsById, getAllGoodsRegistered, getAllgrnEntryMaterialDetailsById, getallInquiryDetails, getAllInquiryMaterialDetailsByInquiryId, getAllItemsForStockLedgerReport, getAllMaterialWisePurchaseReport, getAllNearExpiryReport, getAllPartyListForGRNEntry, getAllPurchaseOrderRegister, getAllPurchaseOrders, getAllShourtageReport, getAllStatementForPurchaseItemByItemId, getPurchaseOrderMaterialByPartyId, getPurchaseOrderMaterialDetailsByPurchaseOrderId, sendInquiryToCompany, sendPurchaseOrderMail } from "../controller/inventoryController.js";
import checkAuth from "../middleware/checkAuth.js";

const inventoryRoute = express.Router();

// Inventory - G.R.N Entry
inventoryRoute.post("/Inventory/AddEditGRNEntryMaterialMapping", checkAuth, addEditGRNEntryMaterialMapping);
inventoryRoute.post("/Inventory/GetAllPartyListForGRNEntry", checkAuth, getAllPartyListForGRNEntry);
inventoryRoute.get("/Inventory/GetAllgrnEntryMaterialDetailsById", checkAuth, getAllgrnEntryMaterialDetailsById);
inventoryRoute.post("/Inventory/GetPurchaseOrderMaterialByPartyId", checkAuth, getPurchaseOrderMaterialByPartyId);
inventoryRoute.get("/Inventory/DeleteGRNEntryMaterialDetailsById", checkAuth, deleteGRNEntryMaterialDetailsById);
inventoryRoute.get("/Inventory/DeleteItemforGRNEntryMaterialById", checkAuth, deleteItemforGRNEntryMaterialById);

// Inventory - Additional Entry
inventoryRoute.post("/Inventory/AddEditAdditionalEntryMaterialMapping", checkAuth, addEditAdditionalEntryMaterialMapping);
inventoryRoute.get("/Inventory/GetAllAdditionalEntryMaterialDetailsById", checkAuth, getAllAdditionalEntryMaterialDetailsById);
inventoryRoute.post("/Inventory/GetAllAdditionalEntryList", checkAuth, getAllAdditionalEntryList);
inventoryRoute.get("/Inventory/DeleteAdditionalEntryDetailsById", checkAuth, deleteAdditionalEntryDetailsById);
inventoryRoute.get("/Inventory/DeleteAdditionalEntryMaterialDetailsById", checkAuth, deleteAdditionalEntryMaterialDetailsById);

// Inventory - Purchase Order
inventoryRoute.post("/Inventory/AddEditPurchaseOrderDetails", checkAuth, addEditPurchaseOrderDetails);
inventoryRoute.post("/Inventory/getAllPurchaseOrders", checkAuth, getAllPurchaseOrders);
inventoryRoute.post("/Inventory/AddEditPurchaserOrderMaterialDetails", checkAuth, addEditPurchaserOrderMaterialDetails);
inventoryRoute.get("/Inventory/GetPurchaseOrderMaterialDetailsByPurchaseOrderId", checkAuth, getPurchaseOrderMaterialDetailsByPurchaseOrderId);
inventoryRoute.get("/Inventory/DeletePurchaseOrderDetailsById", checkAuth, deletePurchaseOrderDetailsById);
inventoryRoute.get("/Inventory/DeletepurchaseOrderMaterialDetialsById", checkAuth, deletepurchaseOrderMaterialDetialsById);
inventoryRoute.post("/Inventory/SendPurchaseOrderMail", checkAuth, sendPurchaseOrderMail);
inventoryRoute.get("/Inventory/ApprovePurchaseOrderByPurchaseId", checkAuth, approvePurchaseOrderByPurchaseId);

// Inventory - G.R.N Entry
inventoryRoute.post("/Inventory/AddEditInquiryDetails", checkAuth, addEditInquiryDetails);
inventoryRoute.post("/Inventory/GetallInquiryDetails", checkAuth, getallInquiryDetails);
inventoryRoute.get("/Inventory/GetAllInquiryMaterialDetailsByInquiryId", checkAuth, getAllInquiryMaterialDetailsByInquiryId);
inventoryRoute.get("/Inventory/DeleteInquiryDetailsById", checkAuth, deleteInquiryDetailsById);
inventoryRoute.get("/Inventory/DeleteInquiryMaterialDetailsById", checkAuth, deleteInquiryMaterialDetailsById);
inventoryRoute.post("/Inventory/SendInquiryToCompany", checkAuth, sendInquiryToCompany);

// Reports
inventoryRoute.post("/Inventory/GetAllGoodsRegistered", checkAuth, getAllGoodsRegistered);
inventoryRoute.post("/Inventory/GetAllMaterialWisePurchaseReport", checkAuth, getAllMaterialWisePurchaseReport);
inventoryRoute.post("/Inventory/GetAllItemsForStockLedgerReport", checkAuth, getAllItemsForStockLedgerReport);
inventoryRoute.post("/Inventory/GetAllStatementForPurchaseItemByItemId", checkAuth, getAllStatementForPurchaseItemByItemId);
inventoryRoute.post("/Inventory/GetAllShourtageReport", checkAuth, getAllShourtageReport);
inventoryRoute.post("/Inventory/GetAllNearExpiryReport", checkAuth, getAllNearExpiryReport);
inventoryRoute.post("/Inventory/GetAllPurchaseOrderRegister", checkAuth, getAllPurchaseOrderRegister);

export default inventoryRoute;
