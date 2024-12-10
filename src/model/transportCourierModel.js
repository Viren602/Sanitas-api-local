
import mongoose from "mongoose";

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


const transportCourierModel = mongoose.model("TransportCourierMasters", transportCourierSchema)
export default transportCourierModel;