import app from "./expressApp.js";
import auth from "../routes/login.js";
import itemMaster from "../routes/itemMaster.js";
import adminLogin from "../routes/adminLogin.js";
import commonServices from "../routes/commonService.js";
import itemCategoryRoute from "../routes/itemCategory.js";

// app.use("/auth",employeeRouter);
// app.use("/auth",auth);
app.use("/api",itemMaster);
app.use("/api",adminLogin);
app.use("/api",commonServices);
app.use("/api",itemCategoryRoute);

export default app;