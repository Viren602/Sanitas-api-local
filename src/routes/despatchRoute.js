import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { addEditGSTInvoiceFinishGoods, addEditInvoicePM, addEditInvoiceRM, addEditSalesGoodsReturnEntry, addEditSalesOrderEntry, deleteInvoiceById, deleteItemFromDBById, deletePMInvoiceById, deletePMItemFromDBById, deleteRMInvoiceById, deleteRMItemFromDBById, deleteSalesGoodsReturnById, deleteSalesGoodsReturnItemById, deleteSalesOrderById, deleteSalesOrderItemByItemId, generateGSTInvoiceForFinishGoodsById, generateGSTInvoiceForPMById, generateGSTInvoiceForRMById, getAllBatchesForItemByItemId, getAllGSTInvoiceFinishGoodsRecords, getAllGSTInvoicePMRecords, getAllGSTInvoiceRMRecords, getAllOrderDetailsItemMappingById, getAllSalesGoodsReturnEntry, getAllSalesOrderEntry, getGSTInvoiceFinishGoodsById, getGSTInvoiceFinishGoodsInvoiceNo, getGSTInvoicePMById, getGSTInvoicePMInvoiceNo, getGSTInvoiceRMById, getGSTInvoiceRMInvoice, getPakcingMaterialStockByPMID, getProductionStockByProductId, getrawMaterialStockByRMId, getSalesGoodsReturnDetailsById, getSalesGoodsReturnEntryInvoiceNo } from "../controller/despatchController.js";

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

export default despatchRoute;
