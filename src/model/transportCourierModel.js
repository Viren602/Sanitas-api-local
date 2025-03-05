
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const transportCourierSchema = mongoose.Schema({
    ID: { type: Number, default: 0 },
    transportCode: { type: String, default: '' },
    transportName: { type: String, default: '' },
    personName: { type: String, default: '' },
    address: { type: String, default: '' },
    mobileNo: { type: String, default: '' },
    webSite: { type: String, default: '' },
    telephone: { type: String, default: '' },
    transportId: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const transportCourierModel = async () => {
    const db = await connectToDatabase(globals.Database);
    return db.models.TransportCourierMasters || db.model("TransportCourierMasters", transportCourierSchema);
}

// const transportCourierModel = mongoose.model("TransportCourierMasters", transportCourierSchema)
export default transportCourierModel;