import app from "./expressApp.js";
import itemMaster from "../routes/itemMaster.js";
import adminLogin from "../routes/adminLogin.js";
import commonServices from "../routes/commonService.js";
import itemCategoryRoute from "../routes/itemCategory.js";
import rawMaterialMasterRoutes from "../routes/rawMaterialMaster.js";
import masterRoute from "../routes/masterRoute.js";
import migration from "../routes/migrationRoute.js";

// app.use("/auth",employeeRouter);
// app.use("/auth",auth);
app.use("/api", adminLogin);
app.use("/api", commonServices);

// Master Module
app.use("/api", itemMaster);
app.use("/api", itemCategoryRoute);
app.use("/api", rawMaterialMasterRoutes);
app.use("/api", masterRoute);

app.use("/api", migration);

export default app;