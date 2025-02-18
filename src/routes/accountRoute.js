import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { addEditContraEntry, addEditPaymentEntry, addEditReceiptEntry, deleteContraEntryById, deletePaymentDetailsByPaymentReceiptId, deleteReceiptDetailsByReceiptId, getAllContraEntry, getAllPaymnetEntry, getAllPendingInvoiceByPartyId, getAllReceiptEntry, getContraEntryById, getContraEntryVoucherNo, getPaymentDetailsByPaymnetReceiptId, getPaymentEntryVoucherNo, getReceiptDetailsByReceiptId, getReceiptEntryVoucherNo } from "../controller/accountController.js";

const accountRoute = express.Router();

// Receipt Entry
accountRoute.get("/Account/GetReceiptEntryVoucherNo", checkAuth, getReceiptEntryVoucherNo);
accountRoute.get("/Account/GetAllPendingInvoiceByPartyId", checkAuth, getAllPendingInvoiceByPartyId);
accountRoute.post("/Account/AddEditReceiptEntry", checkAuth, addEditReceiptEntry);
accountRoute.post("/Account/GetAllReceiptEntry", checkAuth, getAllReceiptEntry);
accountRoute.get("/Account/GetReceiptDetailsByReceiptId", checkAuth, getReceiptDetailsByReceiptId);
accountRoute.get("/Account/DeleteReceiptDetailsByReceiptId", checkAuth, deleteReceiptDetailsByReceiptId);

// Receipt Entry
accountRoute.get("/Account/GetPaymentEntryVoucherNo", checkAuth, getPaymentEntryVoucherNo);
accountRoute.post("/Account/AddEditPaymentEntry", checkAuth, addEditPaymentEntry);
accountRoute.post("/Account/GetAllPaymnetEntry", checkAuth, getAllPaymnetEntry);
accountRoute.get("/Account/GetPaymentDetailsByPaymnetReceiptId", checkAuth, getPaymentDetailsByPaymnetReceiptId);
accountRoute.get("/Account/DeletePaymentDetailsByPaymentReceiptId", checkAuth, deletePaymentDetailsByPaymentReceiptId);

// Receipt Entry
accountRoute.get("/Account/GetContraEntryVoucherNo", checkAuth, getContraEntryVoucherNo);
accountRoute.post("/Account/AddEditContraEntry", checkAuth, addEditContraEntry);
accountRoute.post("/Account/GetAllContraEntry", checkAuth, getAllContraEntry);
accountRoute.get("/Account/GetContraEntryById", checkAuth, getContraEntryById);
accountRoute.get("/Account/DeleteContraEntryById", checkAuth, deleteContraEntryById);

export default accountRoute;
