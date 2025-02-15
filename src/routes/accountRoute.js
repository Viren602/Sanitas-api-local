import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { getAllPendingInvoiceByPartyId, getReceiptEntryVoucherNo } from "../controller/accountController.js";

const accountRoute = express.Router();

// Receipt Entry
accountRoute.get("/Account/GetReceiptEntryVoucherNo", checkAuth, getReceiptEntryVoucherNo);
accountRoute.get("/Account/GetAllPendingInvoiceByPartyId", checkAuth, getAllPendingInvoiceByPartyId);

export default accountRoute;
