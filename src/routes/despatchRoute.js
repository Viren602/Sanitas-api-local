import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { addEditGSTInvoiceFinishGoods, addEditInvoicePM, addEditInvoiceRM, addEditInwardPost, addEditOutwardPost, addEditSalesGoodsReturnEntry, addEditSalesOrderEntry, deleteInvoiceById, deleteInwardPostById, deleteItemFromDBById, deleteOutwardPostById, deletePMInvoiceById, deletePMItemFromDBById, deleteRMInvoiceById, deleteRMItemFromDBById, deleteSalesGoodsReturnById, deleteSalesGoodsReturnItemById, deleteSalesOrderById, deleteSalesOrderItemByItemId, generateGSTInvoiceForFinishGoodsById, generateGSTInvoiceForPMById, generateGSTInvoiceForRMById, getAllBatchesForItemByItemId, getAllBatchWiseStockStatementReport, getAllGSTInvoiceFinishGoodsRecords, getAllGSTInvoicePMRecords, getAllGSTInvoiceRMRecords, getAllInwardPost, getAllItemWiseDesptach, getALLItemWiseMonthlySales, getAllNearExpiryStockReport, getAllOrderDetailsItemMappingById, getAllOutwardPost, getAllPartyWiseDespatchItem, getAllPartyWiseDespatchItemById, getAllPartyWiseMonthlySalesByPartyId, getAllSalesGoodsReturnEntry, getAllSalesOrderEntry, getAllStockLedgerReport, getAllStockLedgerReportBatchStock, getALLStockStatementByProductId, getAllStockStatementReport, getCompanyAddressByCompanyId, getGSTInvoiceFinishGoodsById, getGSTInvoiceFinishGoodsInvoiceNo, getGSTInvoicePMById, getGSTInvoicePMInvoiceNo, getGSTInvoiceRMById, getGSTInvoiceRMInvoice, getInwardPostById, getOutwardPostById, getPakcingMaterialStockByPMID, getProductionStockByProductId, getrawMaterialStockByRMId, getSalesGoodsReturnDetailsById, getSalesGoodsReturnEntryInvoiceNo } from "../controller/despatchController.js";

const despatchRoute = express.Router();

// Despatch - GST Invoice Finish Goods
despatchRoute.get("/Despatch/GetProductionStockByProductId", checkAuth, getProductionStockByProductId);
despatchRoute.get("/Despatch/GetGSTInvoiceFinishGoodsInvoiceNo", checkAuth, getGSTInvoiceFinishGoodsInvoiceNo);
despatchRoute.post("/Despatch/AddEditGSTInvoiceFinishGoods", checkAuth, addEditGSTInvoiceFinishGoods);
despatchRoute.post("/Despatch/GetAllGSTInvoiceFinishGoodsRecords", checkAuth, getAllGSTInvoiceFinishGoodsRecords);
despatchRoute.get("/Despatch/GetGSTInvoiceFinishGoodsById", checkAuth, getGSTInvoiceFinishGoodsById);
despatchRoute.post("/Despatch/DeleteItemFromDBById", checkAuth, deleteItemFromDBById);
despatchRoute.get("/Despatch/DeleteInvoiceById", checkAuth, deleteInvoiceById);
despatchRoute.get("/Despatch/GenerateGSTInvoiceForFinishGoodsById", generateGSTInvoiceForFinishGoodsById);

// Despatch - GST Invoice RM
despatchRoute.get("/Despatch/GetGSTInvoiceRMInvoice", checkAuth, getGSTInvoiceRMInvoice);
despatchRoute.post("/Despatch/GetrawMaterialStockByRMId", checkAuth, getrawMaterialStockByRMId);
despatchRoute.post("/Despatch/AddEditInvoiceRM", checkAuth, addEditInvoiceRM);
despatchRoute.post("/Despatch/GetAllGSTInvoiceRMRecords", checkAuth, getAllGSTInvoiceRMRecords);
despatchRoute.get("/Despatch/GetGSTInvoiceRMById", checkAuth, getGSTInvoiceRMById);
despatchRoute.post("/Despatch/DeleteRMItemFromDBById", checkAuth, deleteRMItemFromDBById);
despatchRoute.get("/Despatch/DeleteRMInvoiceById", checkAuth, deleteRMInvoiceById);
despatchRoute.get("/Despatch/GenerateGSTInvoiceForRMById", generateGSTInvoiceForRMById);

// Despatch - GST Invoice PM
despatchRoute.get("/Despatch/GetGSTInvoicePMInvoiceNo", checkAuth, getGSTInvoicePMInvoiceNo);
despatchRoute.post("/Despatch/GetPakcingMaterialStockByPMID", checkAuth, getPakcingMaterialStockByPMID);
despatchRoute.post("/Despatch/AddEditInvoicePM", checkAuth, addEditInvoicePM);
despatchRoute.post("/Despatch/GetAllGSTInvoicePMRecords", checkAuth, getAllGSTInvoicePMRecords);
despatchRoute.get("/Despatch/GetGSTInvoicePMById", checkAuth, getGSTInvoicePMById);
despatchRoute.post("/Despatch/DeletePMItemFromDBById", checkAuth, deletePMItemFromDBById);
despatchRoute.get("/Despatch/DeletePMInvoiceById", checkAuth, deletePMInvoiceById);
despatchRoute.get("/Despatch/GenerateGSTInvoiceForPMById", generateGSTInvoiceForPMById);

// Despatch - Sales Order Entry
despatchRoute.post("/Despatch/AddEditSalesOrderEntry", checkAuth, addEditSalesOrderEntry);
despatchRoute.get("/Despatch/GetAllOrderDetailsItemMappingById", checkAuth, getAllOrderDetailsItemMappingById);
despatchRoute.post("/Despatch/GetAllSalesOrderEntry", checkAuth, getAllSalesOrderEntry);
despatchRoute.get("/Despatch/DeleteSalesOrderById", checkAuth, deleteSalesOrderById);
despatchRoute.get("/Despatch/DeleteSalesOrderItemByItemId", checkAuth, deleteSalesOrderItemByItemId);

// Despatch - Sales Goods Return Entry
despatchRoute.get("/Despatch/GetSalesGoodsReturnEntryInvoiceNo", checkAuth, getSalesGoodsReturnEntryInvoiceNo);
despatchRoute.get("/Despatch/GetAllBatchesForItemByItemId", checkAuth, getAllBatchesForItemByItemId);
despatchRoute.post("/Despatch/AddEditSalesGoodsReturnEntry", checkAuth, addEditSalesGoodsReturnEntry);
despatchRoute.post("/Despatch/GetAllSalesGoodsReturnEntry", checkAuth, getAllSalesGoodsReturnEntry);
despatchRoute.get("/Despatch/GetSalesGoodsReturnDetailsById", checkAuth, getSalesGoodsReturnDetailsById);
despatchRoute.post("/Despatch/DeleteSalesGoodsReturnItemById", checkAuth, deleteSalesGoodsReturnItemById);
despatchRoute.get("/Despatch/DeleteSalesGoodsReturnById", checkAuth, deleteSalesGoodsReturnById);

// Despatch - Envelope Entry
despatchRoute.get("/Despatch/GetCompanyAddressByCompanyId", checkAuth, getCompanyAddressByCompanyId);

// Despatch - Reports - Party wise Despatch Report
despatchRoute.post("/Despatch/GetAllPartyWiseDespatchItem", checkAuth, getAllPartyWiseDespatchItem);
despatchRoute.get("/Despatch/GetAllPartyWiseDespatchItemById", checkAuth, getAllPartyWiseDespatchItemById);

// Despatch - Reports - Item wise Despatch Report
despatchRoute.post("/Despatch/GetAllItemWiseDesptach", checkAuth, getAllItemWiseDesptach);

// Despatch - Reports - Item Wise Monthly Sales
despatchRoute.post("/Despatch/GetALLItemWiseMonthlySales", checkAuth, getALLItemWiseMonthlySales);

// Despatch - Reports - Party Wise Monthly Sales
despatchRoute.get("/Despatch/GetAllPartyWiseMonthlySalesByPartyId", checkAuth, getAllPartyWiseMonthlySalesByPartyId);

// Despatch - Reports - Stock Statement Report
despatchRoute.post("/Despatch/GetAllStockStatementReport", checkAuth, getAllStockStatementReport);
despatchRoute.get("/Despatch/GetALLStockStatementByProductId", getALLStockStatementByProductId);
despatchRoute.post("/Despatch/GetAllBatchWiseStockStatementReport", checkAuth, getAllBatchWiseStockStatementReport);

// Despatch - Reports - Stock Ledger Report
despatchRoute.post("/Despatch/GetAllStockLedgerReport", checkAuth, getAllStockLedgerReport);
despatchRoute.post("/Despatch/GetAllStockLedgerReportBatchStock", checkAuth, getAllStockLedgerReportBatchStock);

// Despatch - Reports - Near Expirty Stock Report
despatchRoute.post("/Despatch/GetAllNearExpiryStockReport", checkAuth, getAllNearExpiryStockReport);

// Despatch - Inward Post Entry 
despatchRoute.post("/Despatch/AddEditInwardPost", checkAuth, addEditInwardPost);
despatchRoute.post("/Despatch/GetAllInwardPost", checkAuth, getAllInwardPost);
despatchRoute.get("/Despatch/GetInwardPostById", checkAuth, getInwardPostById);
despatchRoute.get("/Despatch/DeleteInwardPostById", checkAuth, deleteInwardPostById);

// Despatch - Outward Post Entry 
despatchRoute.post("/Despatch/AddEditOutwardPost", checkAuth, addEditOutwardPost);
despatchRoute.post("/Despatch/GetAllOutwardPost", checkAuth, getAllOutwardPost);
despatchRoute.get("/Despatch/GetOutwardPostById", checkAuth, getOutwardPostById);
despatchRoute.get("/Despatch/DeleteOutwardPostById", checkAuth, deleteOutwardPostById);
export default despatchRoute;
