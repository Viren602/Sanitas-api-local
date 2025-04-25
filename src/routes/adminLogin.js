import express from "express";
import { getCompanyDataWithCompanyNameAndYear, getCompanyForCompanySelection, getFinancialYearByCompanyName, userAuthentication } from "../controller/adminLogin.js";
import checkAuth from "../middleware/checkAuth.js";

const adminLogin = express.Router();

adminLogin.get("/adminLogin/GetFinancialYearByCompanyName", checkAuth, getFinancialYearByCompanyName);
adminLogin.get("/adminLogin/GetCompanyForCompanySelection", checkAuth, getCompanyForCompanySelection);
adminLogin.post("/adminLogin/GetCompanyDataWithCompanyNameAndYear", checkAuth, getCompanyDataWithCompanyNameAndYear);
adminLogin.post("/adminLogin/userAuthentication", userAuthentication);

export default adminLogin;
