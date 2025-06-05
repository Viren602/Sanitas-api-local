import app from "./expressApp.js";
import itemMaster from "../routes/itemMaster.js";
import adminLogin from "../routes/adminLogin.js";
import commonServices from "../routes/commonService.js";
import itemCategoryRoute from "../routes/itemCategory.js";
import rawMaterialMasterRoutes from "../routes/rawMaterialMaster.js";
import masterRoute from "../routes/masterRoute.js";
import migration from "../routes/migrationRoute.js";
import inventoryRoute from "../routes/inventoryRoute.js";
import productionRoute from "../routes/productionRoute.js";
import despatchRoute from "../routes/despatchRoute.js";
import accountRoute from "../routes/accountRoute.js";
import utilityRoute from "../routes/utilityRoute.js";
import dashboard from "../routes/dashboardRoute.js";

// app.use("/auth",employeeRouter);
// app.use("/auth",auth);
app.use("/api", adminLogin);
app.use("/api", commonServices);

// Master Module
app.use("/api", itemMaster);
app.use("/api", itemCategoryRoute);
app.use("/api", rawMaterialMasterRoutes);
app.use("/api", masterRoute);

// Inventory Module
app.use("/api", inventoryRoute);

// Production Module
app.use("/api", productionRoute);

// Despatch Module
app.use("/api", despatchRoute);

// Account Module
app.use("/api", accountRoute);

// Utility Module
app.use("/api", utilityRoute);

app.use("/api", migration);

app.use("/api", dashboard);

export default app;