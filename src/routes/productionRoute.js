import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { addEditProductionPlanningEntry, deleteProductionPlanningEntryById, getAllProductionPlanningEntry, getPMFormulaByPackingItemId, getProductionPlanningEntryById, getProductionPMFOrmulaByProductionDetailsId, getProductionRMFOrmulaByProductionDetailsId, getRMFormulaForProductionById, packingRequisitionPMFormulaListing, productionRequisitionRMFormulaListing } from "../controller/productionController.js";

const productionRoute = express.Router();

// Production - Production Requisition
productionRoute.post("/Production/AddEditProductionPlanningEntry", checkAuth, addEditProductionPlanningEntry);
productionRoute.post("/Production/GetAllProductionPlanningEntry", checkAuth, getAllProductionPlanningEntry);
productionRoute.get("/Production/GetProductionPlanningEntryById", checkAuth, getProductionPlanningEntryById);
productionRoute.get("/Production/DeleteProductionPlanningEntryById", checkAuth, deleteProductionPlanningEntryById);
productionRoute.get("/Production/GetRMFormulaForProductionById", checkAuth, getRMFormulaForProductionById);
productionRoute.post("/Production/ProductionRequisitionRMFormulaListing", checkAuth, productionRequisitionRMFormulaListing);
productionRoute.get("/Production/GetProductionRMFOrmulaByProductionDetailsId", checkAuth, getProductionRMFOrmulaByProductionDetailsId);

// Production - Packing Requisition
productionRoute.get("/Production/GetPMFormulaByPackingItemId", checkAuth, getPMFormulaByPackingItemId);
productionRoute.post("/Production/PackingRequisitionPMFormulaListing", checkAuth, packingRequisitionPMFormulaListing);
productionRoute.get("/Production/GetProductionPMFOrmulaByProductionDetailsId", checkAuth, getProductionPMFOrmulaByProductionDetailsId);


export default productionRoute;
