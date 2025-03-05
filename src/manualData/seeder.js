import mongoose from "mongoose";
import config from "../config/config.js";
import ItemCategory from "../model/itemCategory.js";
import Categories from "./itemCategoryData.js";
import HNSCodesScHema from "../model/hnsCode.js";
import HNSCodes from "./HNSCodes.js";
import UsersSCHM from "../model/user.js";
import Users from "./Users.js";


const url = config.DB;
mongoose.connect(url);


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Connected to the database");
});


//------------------------------ Inserting Categories in Database ------------------------------
// const importCategories = async () => {
//     try {
//         await ItemCategory.deleteMany();
//         const createUsers = await ItemCategory.insertMany(Categories)
//         console.log(createUsers)
//     } catch (error) {
//     }
// }

// importCategories().then(() => {
//     mongoose.connection.close();
//   });
// ------------------------------------------------------------------------------------------

//------------------------------ Inserting HNSCode in Database ------------------------------
// const importHNSCode = async () => {
//     try {
    // let hcModel = await HNSCodesScHema()
//         await hcModel.deleteMany();
//         const createUsers = await hcModel.insertMany(HNSCodes)
//         console.log(createUsers)
//     } catch (error) {
//     }
// }

// importHNSCode().then(() => {
//     mongoose.connection.close();
//   });
// ------------------------------------------------------------------------------------------

//------------------------------ Inserting Users in Database ------------------------------
// const importHNSCode = async () => {
//     try {
//         await UsersSCHM.deleteMany();
//         const createUsers = await UsersSCHM.insertMany(Users)
//         console.log(createUsers)
//     } catch (error) {
//     }
// }

// importHNSCode().then(() => {
//     mongoose.connection.close();
//   });
// ------------------------------------------------------------------------------------------