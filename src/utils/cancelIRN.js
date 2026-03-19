import axios from "axios";

export const cancelIRN = async (authToken, cancelPayload, gstnNo) => {

    const body = {
        Irn: cancelPayload.irn,
        CnlRsn: cancelPayload.cancelReason,
        CnlRem: cancelPayload.cancelRemark
    };

    const response = await axios.post(
        process.env.TAXPRO_CANCEL_EINVOICE_URL,
        body,
        {
            params: {
                aspid: process.env.TAXPRO_ASP_ID,
                password: process.env.TAXPRO_PASSWORD,
                Gstin: gstnNo,
                User_name: process.env.TAXPRO_USERNAME,
                AuthToken: authToken
            },
            headers: {
                "Content-Type": "application/json",
                "aspid": process.env.TAXPRO_ASP_ID,
                "password": process.env.TAXPRO_PASSWORD
            }
        }
    );

    return response.data;
};