import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { addEditProductionPlanningEntry, deleteProductionPlanningEntryById, getAllProductionPlanningEntry, getProductionPlanningEntryById } from "../controller/productionController.js";

const productionRoute = express.Router();

// Production - G.R.N Entry
productionRoute.post("/Production/AddEditProductionPlanningEntry", checkAuth, addEditProductionPlanningEntry);
productionRoute.post("/Production/GetAllProductionPlanningEntry", checkAuth, getAllProductionPlanningEntry);
productionRoute.get("/Production/GetProductionPlanningEntryById", checkAuth, getProductionPlanningEntryById);
productionRoute.get("/Production/DeleteProductionPlanningEntryById", checkAuth, deleteProductionPlanningEntryById);


export default productionRoute;
