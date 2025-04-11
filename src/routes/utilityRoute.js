import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import { addEditAdmin, addEditUserProfile, deleteAdminById, getadminById, getAllAdminRoles, getAllAdminsByCompanyId, getAllUserLog, getUserProfile } from "../controller/utilityController.js";

const utilityRoute = express.Router();
// User profile 
utilityRoute.get("/Utility/GetUserProfile", checkAuth, getUserProfile);
utilityRoute.post("/Utility/AddEditUserProfile", checkAuth, addEditUserProfile);

// Admin role 
utilityRoute.get("/Utility/GetAllAdminRoles", checkAuth, getAllAdminRoles);
utilityRoute.get("/Utility/GetAllAdminsByCompanyId", checkAuth, getAllAdminsByCompanyId);
utilityRoute.get("/Utility/GetadminById", checkAuth, getadminById);
utilityRoute.post("/Utility/AddEditAdmin", checkAuth, addEditAdmin);
utilityRoute.get("/Utility/DeleteAdminById", checkAuth, deleteAdminById);

// User Log
utilityRoute.post("/Utility/GetAllUserLog", checkAuth, getAllUserLog);
export default utilityRoute;
