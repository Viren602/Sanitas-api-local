import express from "express";
import { getCompanyInfo, userAuthentication } from "../controller/adminLogin.js";

const adminLogin = express.Router();

adminLogin.get("/adminLogin/getCompanyInfo",getCompanyInfo);
adminLogin.post("/adminLogin/userAuthentication",userAuthentication);

export default adminLogin;
