import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { getProductionStockByProductId } from "../controller/despatchController.js";

const despatchRoute = express.Router();

// Despatch - GST Invoice Finish Goods
despatchRoute.get("/Despatch/GetProductionStockByProductId", checkAuth, getProductionStockByProductId);


export default despatchRoute;
