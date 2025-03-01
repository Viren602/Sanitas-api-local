import express from "express";
import { getCompanyDataWithCompanyNameAndYear, getCompanyForCompanySelection, getFinancialYearByCompanyName, userAuthentication } from "../controller/adminLogin.js";

const adminLogin = express.Router();

adminLogin.get("/adminLogin/GetFinancialYearByCompanyName",getFinancialYearByCompanyName);
adminLogin.get("/adminLogin/GetCompanyForCompanySelection",getCompanyForCompanySelection);
adminLogin.post("/adminLogin/GetCompanyDataWithCompanyNameAndYear",getCompanyDataWithCompanyNameAndYear);
adminLogin.post("/adminLogin/userAuthentication",userAuthentication);

export default adminLogin;
