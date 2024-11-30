import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import errorHandler from "./errorHandle.js"; // Make sure this path is correct
import Ddos from "ddos";
import cookieParser from "cookie-parser";
import config from "../config/config.js";
import path from "path";
const app = express();


app.use(express.json());
app.use(cookieParser());


app.use(cors({
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
}));

const url = config.DB;
mongoose.connect(url);


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to the database");
});


app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(errorHandler);
app.set('trust proxy', 1);

const ddos = new Ddos({ burst: 50, limit: 50 }); // Initialize Ddos correctly
app.use(ddos.express);

app.use("/uploads", express.static(path.join( "uploads")));

app.get("/", function (req, res) {
  res.json({ Status: "Success", Message: "Server is running" });

});


export default app;