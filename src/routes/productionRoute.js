import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { addEditBatchClearingEntry, addEditProductionPlanningEntry, deleteBatchCLearingEntryById, deleteProductionPlanningEntryById, getAllBatchClearedRecords, getAllJobChargeRecords, getAllMaterialRequirementReportForPM, getAllMaterialRequirementReportForRM, getAllPendingProductionPlanningReport, getAllProductionBatchRegister, getAllProductionPlanningEntry, getBatchClearingEntryByProductId, getBatchCostingReportPMFormulaById, getBatchCostingReportRMFormulaId, getPMFormulaByPackingItemId, getProductCostingReport, getProductDetailsForBatchClearedByProductId, getProductionPlanningEntryById, getProductionPMFOrmulaByProductionDetailsId, getProductionRMFOrmulaByProductionDetailsId, getRMFormulaForProductionById, packingRequisitionPMFormulaListing, productionRequisitionRMFormulaListing, removeProductionPlanningEntryFromBatchCLearingEntryById, removeProductionPlanningEntryFromPackingRequisition, removeProductionPlanningEntryFromProductionRequisition } from "../controller/productionController.js";

const productionRoute = express.Router();

// Production - Production Requisition
productionRoute.post("/Production/AddEditProductionPlanningEntry", checkAuth, addEditProductionPlanningEntry);
productionRoute.post("/Production/GetAllProductionPlanningEntry", checkAuth, getAllProductionPlanningEntry);
productionRoute.get("/Production/GetProductionPlanningEntryById", checkAuth, getProductionPlanningEntryById);
productionRoute.get("/Production/DeleteProductionPlanningEntryById", checkAuth, deleteProductionPlanningEntryById);
productionRoute.get("/Production/GetRMFormulaForProductionById", checkAuth, getRMFormulaForProductionById);
productionRoute.post("/Production/ProductionRequisitionRMFormulaListing", checkAuth, productionRequisitionRMFormulaListing);
productionRoute.get("/Production/GetProductionRMFOrmulaByProductionDetailsId", checkAuth, getProductionRMFOrmulaByProductionDetailsId);
productionRoute.get("/Production/RemoveProductionPlanningEntryFromProductionRequisition", checkAuth, removeProductionPlanningEntryFromProductionRequisition);

// Production - Packing Requisition
productionRoute.get("/Production/GetPMFormulaByPackingItemId", checkAuth, getPMFormulaByPackingItemId);
productionRoute.post("/Production/PackingRequisitionPMFormulaListing", checkAuth, packingRequisitionPMFormulaListing);
productionRoute.get("/Production/GetProductionPMFOrmulaByProductionDetailsId", checkAuth, getProductionPMFOrmulaByProductionDetailsId);
productionRoute.get("/Production/RemoveProductionPlanningEntryFromPackingRequisition", checkAuth, removeProductionPlanningEntryFromPackingRequisition);

// Production - Batch Clearing
productionRoute.post("/Production/AddEditBatchClearingEntry", checkAuth, addEditBatchClearingEntry);
productionRoute.get("/Production/GetBatchClearingEntryByProductId", checkAuth, getBatchClearingEntryByProductId);
productionRoute.post("/Production/GetAllBatchClearedRecords", checkAuth, getAllBatchClearedRecords);
productionRoute.post("/Production/DeleteBatchCLearingEntryById", checkAuth, deleteBatchCLearingEntryById);
productionRoute.get("/Production/RemoveProductionPlanningEntryFromBatchCLearingEntryById", checkAuth, removeProductionPlanningEntryFromBatchCLearingEntryById);

// Production - Reports
productionRoute.post("/Production/GetAllPendingProductionPlanningReport", checkAuth, getAllPendingProductionPlanningReport);
productionRoute.post("/Production/GetAllProductionBatchRegister", checkAuth, getAllProductionBatchRegister);
productionRoute.post("/Production/GetAllJobChargeRecords", checkAuth, getAllJobChargeRecords);
productionRoute.post("/Production/GetProductCostingReport", checkAuth, getProductCostingReport);
productionRoute.get("/Production/GetProductDetailsForBatchClearedByProductId", checkAuth, getProductDetailsForBatchClearedByProductId);
productionRoute.get("/Production/GetBatchCostingReportRMFormulaId", checkAuth, getBatchCostingReportRMFormulaId);
productionRoute.get("/Production/GetBatchCostingReportPMFormulaById", checkAuth, getBatchCostingReportPMFormulaById);
productionRoute.post("/Production/GetAllMaterialRequirementReportForRM", checkAuth, getAllMaterialRequirementReportForRM);
productionRoute.post("/Production/GetAllMaterialRequirementReportForPM", checkAuth, getAllMaterialRequirementReportForPM);

export default productionRoute;
