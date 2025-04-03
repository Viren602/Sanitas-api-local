import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { addEditContraEntry, addEditGeneralCreditNoteEntry, addEditGeneralDebitNoteEntry, addEditGSTPurchaseEntryRMPM, addEditGSTPurchaseEntryWithoutInventory, addEditJVEntry, addEditPaymentEntry, addEditReceiptEntry, deleteContraEntryById, deleteGeneralCreditNoteEntryById, deleteGeneralDebitNoteEntryById, deleteGSTPurchaseEntryRMPMById, deleteGSTPurchaseEntryWithoutInventoryById, deleteJVEntryById, deletePaymentDetailsByPaymentReceiptId, deleteReceiptDetailsByReceiptId, getAllAccountLedger, getAllBankWiseCashBankBookReport, getAllContraEntry, getAllDateWiseCashBankBookReportbyBankId, getAllGeneralCreditNoteEntry, getAllGeneralDebitNoteEntry, getAllGroupWiseAccountSummary, getAllGSTPurchaseEntryRMPM, getAllGSTPurchaseRegister, getAllGSTSalesRegister, getAllJVEntry, getAllMonthWiseCashBankBookReportbyBankId, getAllOpeningBalanceReport, getAllPaymnetEntry, getAllPendingGRNPurchaseEntry, getAllPendingInvoiceByPartyId, getAllPendingInvoiceForPaymentEntryByPartyId, getAllPurchaseEntryWithoutInventory, getAllReceiptEntry, getBankBalanceByBankId, getContraEntryById, getContraEntryVoucherNo, getGeneralCreditNoteEntryById, getGeneralCreditNoteEntrySRNo, getGeneralDebitNoteEntryById, getGeneralDebitNoteEntrySRNo, getGSTPurchaseEntryRMPMById, getGSTPurchaseEntryWithoutInventoryById, getGSTPurchseEntrySRNo, getGSTPurchseWithoutInventoryEntrySRNo, getJVEntryById, getJVEntryVoucherNo, getPaymentDetailsByPaymnetReceiptId, getPaymentEntryVoucherNo, getReceiptDetailsByReceiptId, getReceiptEntryVoucherNo, getRunningBalanceByPartyId, updateGRNEntryToPurchaseEntry } from "../controller/accountController.js";

const accountRoute = express.Router();

// Receipt Entry
accountRoute.get("/Account/GetReceiptEntryVoucherNo", checkAuth, getReceiptEntryVoucherNo);
accountRoute.get("/Account/GetAllPendingInvoiceByPartyId", checkAuth, getAllPendingInvoiceByPartyId);
accountRoute.post("/Account/AddEditReceiptEntry", checkAuth, addEditReceiptEntry);
accountRoute.post("/Account/GetAllReceiptEntry", checkAuth, getAllReceiptEntry);
accountRoute.get("/Account/GetReceiptDetailsByReceiptId", checkAuth, getReceiptDetailsByReceiptId);
accountRoute.get("/Account/DeleteReceiptDetailsByReceiptId", checkAuth, deleteReceiptDetailsByReceiptId);

// Payment Entry
accountRoute.get("/Account/GetPaymentEntryVoucherNo", checkAuth, getPaymentEntryVoucherNo);
accountRoute.get("/Account/GetAllPendingInvoiceForPaymentEntryByPartyId", checkAuth, getAllPendingInvoiceForPaymentEntryByPartyId);
accountRoute.post("/Account/AddEditPaymentEntry", checkAuth, addEditPaymentEntry);
accountRoute.post("/Account/GetAllPaymnetEntry", checkAuth, getAllPaymnetEntry);
accountRoute.get("/Account/GetPaymentDetailsByPaymnetReceiptId", checkAuth, getPaymentDetailsByPaymnetReceiptId);
accountRoute.get("/Account/DeletePaymentDetailsByPaymentReceiptId", checkAuth, deletePaymentDetailsByPaymentReceiptId);

// Contra Entry
accountRoute.get("/Account/GetContraEntryVoucherNo", checkAuth, getContraEntryVoucherNo);
accountRoute.post("/Account/AddEditContraEntry", checkAuth, addEditContraEntry);
accountRoute.post("/Account/GetAllContraEntry", checkAuth, getAllContraEntry);
accountRoute.get("/Account/GetContraEntryById", checkAuth, getContraEntryById);
accountRoute.get("/Account/DeleteContraEntryById", checkAuth, deleteContraEntryById);
accountRoute.get("/Account/GetBankBalanceByBankId", checkAuth, getBankBalanceByBankId);

// GST Purchase Entry RM PM
accountRoute.get("/Account/GetGSTPurchseEntrySRNo", checkAuth, getGSTPurchseEntrySRNo);
accountRoute.post("/Account/GetAllPendingGRNPurchaseEntry", checkAuth, getAllPendingGRNPurchaseEntry);
accountRoute.post("/Account/UpdateGRNEntryToPurchaseEntry", checkAuth, updateGRNEntryToPurchaseEntry);
accountRoute.post("/Account/AddEditGSTPurchaseEntryRMPM", checkAuth, addEditGSTPurchaseEntryRMPM);
accountRoute.post("/Account/GetAllGSTPurchaseEntryRMPM", checkAuth, getAllGSTPurchaseEntryRMPM);
accountRoute.get("/Account/GetGSTPurchaseEntryRMPMById", checkAuth, getGSTPurchaseEntryRMPMById);
accountRoute.get("/Account/DeleteGSTPurchaseEntryRMPMById", checkAuth, deleteGSTPurchaseEntryRMPMById);

// GST Purchase EntryWithOut Inventory
accountRoute.get("/Account/GetGSTPurchseWithoutInventoryEntrySRNo", checkAuth, getGSTPurchseWithoutInventoryEntrySRNo);
accountRoute.post("/Account/AddEditGSTPurchaseEntryWithoutInventory", checkAuth, addEditGSTPurchaseEntryWithoutInventory);
accountRoute.post("/Account/GetAllPurchaseEntryWithoutInventory", checkAuth, getAllPurchaseEntryWithoutInventory);
accountRoute.get("/Account/GetGSTPurchaseEntryWithoutInventoryById", checkAuth, getGSTPurchaseEntryWithoutInventoryById);
accountRoute.get("/Account/DeleteGSTPurchaseEntryWithoutInventoryById", checkAuth, deleteGSTPurchaseEntryWithoutInventoryById);

// General Debit Note Entry
accountRoute.get("/Account/GetGeneralDebitNoteEntrySRNo", checkAuth, getGeneralDebitNoteEntrySRNo);
accountRoute.post("/Account/AddEditGeneralDebitNoteEntry", checkAuth, addEditGeneralDebitNoteEntry);
accountRoute.post("/Account/GetAllGeneralDebitNoteEntry", checkAuth, getAllGeneralDebitNoteEntry);
accountRoute.get("/Account/GetGeneralDebitNoteEntryById", checkAuth, getGeneralDebitNoteEntryById);
accountRoute.get("/Account/DeleteGeneralDebitNoteEntryById", checkAuth, deleteGeneralDebitNoteEntryById);

// General Credit Note Entry
accountRoute.get("/Account/GetGeneralCreditNoteEntrySRNo", checkAuth, getGeneralCreditNoteEntrySRNo);
accountRoute.post("/Account/AddEditGeneralCreditNoteEntry", checkAuth, addEditGeneralCreditNoteEntry);
accountRoute.post("/Account/GetAllGeneralCreditNoteEntry", checkAuth, getAllGeneralCreditNoteEntry);
accountRoute.get("/Account/GetGeneralCreditNoteEntryById", checkAuth, getGeneralCreditNoteEntryById);
accountRoute.get("/Account/DeleteGeneralCreditNoteEntryById", checkAuth, deleteGeneralCreditNoteEntryById);

// J.V Entry
accountRoute.get("/Account/GetJVEntryVoucherNo", checkAuth, getJVEntryVoucherNo);
accountRoute.post("/Account/AddEditJVEntry", checkAuth, addEditJVEntry);
accountRoute.post("/Account/GetAllJVEntry", checkAuth, getAllJVEntry);
accountRoute.get("/Account/GetJVEntryById", checkAuth, getJVEntryById);
accountRoute.get("/Account/DeleteJVEntryById", checkAuth, deleteJVEntryById);

// Reports
accountRoute.post("/Account/GetAllAccountLedger", checkAuth, getAllAccountLedger);
accountRoute.get("/Account/GetRunningBalanceByPartyId", checkAuth, getRunningBalanceByPartyId);
accountRoute.get("/Account/GetAllBankWiseCashBankBookReport", checkAuth, getAllBankWiseCashBankBookReport);
accountRoute.get("/Account/GetAllMonthWiseCashBankBookReportbyBankId", checkAuth, getAllMonthWiseCashBankBookReportbyBankId);
accountRoute.post("/Account/GetAllDateWiseCashBankBookReportbyBankId", checkAuth, getAllDateWiseCashBankBookReportbyBankId);
accountRoute.post("/Account/GetAllGroupWiseAccountSummary", checkAuth, getAllGroupWiseAccountSummary);
accountRoute.post("/Account/GetAllOpeningBalanceReport", checkAuth, getAllOpeningBalanceReport);
accountRoute.post("/Account/GetAllGSTSalesRegister", checkAuth, getAllGSTSalesRegister);
accountRoute.post("/Account/GetAllGSTPurchaseRegister", checkAuth, getAllGSTPurchaseRegister);

export default accountRoute;
