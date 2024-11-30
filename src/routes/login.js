import express from "express";
import { userLogin,verifyOtp } from "../controller/login.js";
const auth=express.Router()

auth.post("/userLogin",userLogin);
auth.post('/verifyOtp',verifyOtp)

export default auth;