import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { addEditReceiptEntry, deleteReceiptDetailsByReceiptId, getAllPendingInvoiceByPartyId, getAllReceiptEntry, getReceiptDetailsByReceiptId, getReceiptEntryVoucherNo } from "../controller/accountController.js";

const accountRoute = express.Router();

// Receipt Entry
accountRoute.get("/Account/GetReceiptEntryVoucherNo", checkAuth, getReceiptEntryVoucherNo);
accountRoute.get("/Account/GetAllPendingInvoiceByPartyId", checkAuth, getAllPendingInvoiceByPartyId);
accountRoute.post("/Account/AddEditReceiptEntry", checkAuth, addEditReceiptEntry);
accountRoute.post("/Account/GetAllReceiptEntry", checkAuth, getAllReceiptEntry);
accountRoute.get("/Account/GetReceiptDetailsByReceiptId", checkAuth, getReceiptDetailsByReceiptId);
accountRoute.get("/Account/DeleteReceiptDetailsByReceiptId", checkAuth, deleteReceiptDetailsByReceiptId);

export default accountRoute;
