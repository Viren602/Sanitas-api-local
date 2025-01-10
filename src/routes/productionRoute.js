import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { addEditProductionPlanningEntry, deleteProductionPlanningEntryById, getAllProductionPlanningEntry, getProductionPlanningEntryById, getProductionRMFOrmulaByProductionDetailsId, getRMFormulaForProductionById, productionRequisitionRMFormulaListing } from "../controller/productionController.js";

const productionRoute = express.Router();

// Production - G.R.N Entry
productionRoute.post("/Production/AddEditProductionPlanningEntry", checkAuth, addEditProductionPlanningEntry);
productionRoute.post("/Production/GetAllProductionPlanningEntry", checkAuth, getAllProductionPlanningEntry);
productionRoute.get("/Production/GetProductionPlanningEntryById", checkAuth, getProductionPlanningEntryById);
productionRoute.get("/Production/DeleteProductionPlanningEntryById", checkAuth, deleteProductionPlanningEntryById);
productionRoute.get("/Production/GetRMFormulaForProductionById", checkAuth, getRMFormulaForProductionById);
productionRoute.post("/Production/ProductionRequisitionRMFormulaListing", checkAuth, productionRequisitionRMFormulaListing);
productionRoute.get("/Production/GetProductionRMFOrmulaByProductionDetailsId", checkAuth, getProductionRMFOrmulaByProductionDetailsId);


export default productionRoute;
