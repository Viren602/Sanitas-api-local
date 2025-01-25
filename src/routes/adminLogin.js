import express from "express";
import { getCompanyDataWithCompanyNameAndYear, getCompanyInfo, userAuthentication } from "../controller/adminLogin.js";

const adminLogin = express.Router();

adminLogin.get("/adminLogin/getCompanyInfo",getCompanyInfo);
adminLogin.post("/adminLogin/GetCompanyDataWithCompanyNameAndYear",getCompanyDataWithCompanyNameAndYear);
adminLogin.post("/adminLogin/userAuthentication",userAuthentication);

export default adminLogin;
