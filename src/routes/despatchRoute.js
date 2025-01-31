import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { addEditGSTInvoiceFinishGoods, deleteInvoiceById, deleteItemFromDBById, generateGSTInvoiceForFinishGoodsById, getAllGSTInvoiceFinishGoodsRecords, getGSTInvoiceFinishGoodsById, getGSTInvoiceFinishGoodsInvoiceNo, getProductionStockByProductId } from "../controller/despatchController.js";

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


export default despatchRoute;
