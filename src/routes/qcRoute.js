import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import * as qcController from "../controller/qcController.js";
const qc = express.Router()

qc.get("/qc/GetGRNItemsByGRNNo", checkAuth, qcController.getGRNItemsByGRNNo);

// Raw Material Sample Entry
qc.get("/qc/GetRawMaterialSampleEntryCount", checkAuth, qcController.getRawMaterialSampleEntryCount);
qc.post("/qc/AddEditRawMaterialSampleEntry", checkAuth, qcController.addEditRawMaterialSampleEntry);
qc.get("/qc/GetAllRawMaterialSampleEntry", checkAuth, qcController.getAllRawMaterialSampleEntry);
qc.get("/qc/GetRawMaterialSampleEntryDetailsById", checkAuth, qcController.getRawMaterialSampleEntryDetailsById);
qc.get("/qc/DeleteRawMaterialSampleEntryById", checkAuth, qcController.deleteRawMaterialSampleEntryById);

// Packing Material Sample Entry
qc.get("/qc/GetPackingMaterialSampleEntryCount", checkAuth, qcController.getPackingMaterialSampleEntryCount);
qc.post("/qc/AddEditPackingMaterialSampleEntry", checkAuth, qcController.addEditPackingMaterialSampleEntry);
qc.get("/qc/GetAllPackingMaterialSampleEntry", checkAuth, qcController.getAllPackingMaterialSampleEntry);
qc.get("/qc/GetPackingMaterialSampleEntryDetailsById", checkAuth, qcController.getPackingMaterialSampleEntryDetailsById);
qc.get("/qc/DeletePackingMaterialSampleEntryById", checkAuth, qcController.deletePackingMaterialSampleEntryById);

// Finish Goods Sample Entry
qc.get("/qc/GetFinishGoodsSampleEntryCount", checkAuth, qcController.getFinishGoodsSampleEntryCount);
qc.get("/qc/GetProductionItemsByProductionNo", checkAuth, qcController.getProductionItemsByProductionNo);
qc.post("/qc/AddEditFinishGoodsSampleEntry", checkAuth, qcController.addEditFinishGoodsSampleEntry);
qc.get("/qc/GetAllFinishGoodsSampleEntry", checkAuth, qcController.getAllFinishGoodsSampleEntry);
qc.get("/qc/GetFinishGoodsSampleEntryDetailsById", checkAuth, qcController.getFinishGoodsSampleEntryDetailsById);
qc.get("/qc/DeleteFinishGoodsSampleEntryById", checkAuth, qcController.deleteFinishGoodsSampleEntryById);

// Raw Material Test Report Entry
qc.get("/qc/GetAllPeningRawMaterialSampleEntry", checkAuth, qcController.getAllPeningRawMaterialSampleEntry);
qc.post("/qc/AddEditRawMaterialTestReport", checkAuth, qcController.addEditRawMaterialTestReport);
qc.get("/qc/GetAllRawMaterialTestReportEntry", checkAuth, qcController.getAllRawMaterialTestReportEntry);
qc.get("/qc/GetRawMaterialTestEntryDetailsById", checkAuth, qcController.getRawMaterialTestEntryDetailsById);
qc.get("/qc/DeleteRawMaterialTestEntryById", checkAuth, qcController.deleteRawMaterialTestEntryById);

// Packing Material Test Report Entry
qc.get("/qc/GetAllPeningPackingMaterialSampleEntry", checkAuth, qcController.getAllPeningPackingMaterialSampleEntry);
qc.post("/qc/AddEditPackingMaterialTestReport", checkAuth, qcController.addEditPackingMaterialTestReport);
qc.get("/qc/GetAllPackingMaterialTestReportEntry", checkAuth, qcController.getAllPackingMaterialTestReportEntry);
qc.get("/qc/GetPackingMaterialTestEntryDetailsById", checkAuth, qcController.getPackingMaterialTestEntryDetailsById);
qc.get("/qc/DeletePackingMaterialTestEntryById", checkAuth, qcController.deletePackingMaterialTestEntryById);

// Finish Goods Test Report Entry
qc.get("/qc/GetAllPeningFinishGoodsSampleEntry", checkAuth, qcController.getAllPeningFinishGoodsSampleEntry);
qc.post("/qc/AddEditFinishGoodsTestReport", checkAuth, qcController.addEditFinishGoodsTestReport);
qc.get("/qc/GetAllFinishGoodsTestReportEntry", checkAuth, qcController.getAllFinishGoodsTestReportEntry);
qc.get("/qc/GetFinishGoodsTestEntryDetailsById", checkAuth, qcController.getFinishGoodsTestEntryDetailsById);
qc.get("/qc/DeleteFinishGoodsTestEntryById", checkAuth, qcController.deleteFinishGoodsTestEntryById);

export default qc;