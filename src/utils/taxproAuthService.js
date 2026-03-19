import axios from "axios";

export const getTaxProAuthToken = async (gstnNo) => {

    const response = await axios.get(process.env.TAXPRO_AUTH_URL, {
        params: {
            aspid: process.env.TAXPRO_ASP_ID,
            password: process.env.TAXPRO_PASSWORD,
            Gstin: gstnNo,
            User_name: process.env.TAXPRO_USERNAME,
            eInvPwd: process.env.TAXPRO_EINV_PASSWORD
        }
    });

    return response.data;
};