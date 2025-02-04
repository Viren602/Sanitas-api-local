import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { addEditGSTInvoiceFinishGoods, addEditInvoiceRM, deleteInvoiceById, deleteItemFromDBById, deleteRMInvoiceById, deleteRMItemFromDBById, generateGSTInvoiceForFinishGoodsById, generateGSTInvoiceForRMById, getAllGSTInvoiceFinishGoodsRecords, getAllGSTInvoiceRMRecords, getGSTInvoiceFinishGoodsById, getGSTInvoiceFinishGoodsInvoiceNo, getGSTInvoiceRMById, getGSTInvoiceRMInvoice, getProductionStockByProductId, getrawMaterialStockByRMId } from "../controller/despatchController.js";

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


export default despatchRoute;
