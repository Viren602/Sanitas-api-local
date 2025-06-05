import express from "express";
import { addEditItems, deleteItemById, getAllItems, getItemById } from "../controller/itemMaster.js";
import checkAuth from "../middleware/checkAuth.js";
import { getAllProductionPlanningNumber, getMonthlySalesAndPurchase, getTopActiveClients, getTopSellingProducts } from "../controller/dashboardController.js";

const dashboard = express.Router();

dashboard.get("/Dashboard/GetAllProductionPlanningNumber", checkAuth, getAllProductionPlanningNumber);
dashboard.get("/Dashboard/GetTopSellingProducts", checkAuth, getTopSellingProducts);
dashboard.get("/Dashboard/GetTopActiveClients", checkAuth, getTopActiveClients);
// dashboard.get("/Dashboard/GetMonthlySales", checkAuth, getMonthlySalesByName);
dashboard.get("/Dashboard/GetMonthlySalesAndPurchase", checkAuth, getMonthlySalesAndPurchase);

export default dashboard;
