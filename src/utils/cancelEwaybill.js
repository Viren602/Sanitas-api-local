import axios from "axios";

export const cancelEWayBill = async (authToken, payload, gstnNo) => {

    const body = {
        ewbNo: payload.ewbNo,
        cancelRsnCode: payload.cancelReason,
        cancelRmrk: payload.cancelRemark?.trim()
    };

    console.log("EWB Cancel Body:", body);

    const response = await axios.post(
        process.env.TAXPRO_EWAYBILL_URL,
        body,
        {
            params: {
                action: "CANEWB",
                aspid: process.env.TAXPRO_ASP_ID,
                password: process.env.TAXPRO_PASSWORD,
                gstin: gstnNo,
                username: process.env.TAXPRO_USERNAME,
                authtoken: authToken
            },
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
};