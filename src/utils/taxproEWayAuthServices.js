import axios from "axios";

export const getTaxProEwayAuthToken = async (gstnNo) => {

    const response = await axios.get(process.env.TAXPRO_EWayAUTH_URL, {
        params: {
            action: "ACCESSTOKEN",
            aspid: process.env.TAXPRO_ASP_ID,
            password: process.env.TAXPRO_PASSWORD,
            gstin: gstnNo,
            username: process.env.TAXPRO_USERNAME,
            ewbpwd: process.env.TAXPRO_EINV_PASSWORD
        }
    });

    return response.data;
};