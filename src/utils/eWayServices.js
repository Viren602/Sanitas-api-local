import axios from "axios";

export const generateEWayBill = async (authToken, ewbData, gstnNo) => {

    try {
        console.log("AuthToken:", authToken);
        console.log("GSTIN:", gstnNo);
        console.log("Username:", process.env.TAXPRO_USERNAME);
        console.log("password : ", process.env.TAXPRO_PASSWORD);
        const response = await axios.post(
            process.env.TAXPRO_EWAYBILL_URL,
            ewbData,
            {
                params: {
                    action: "GENEWAYBILL",
                    aspid: process.env.TAXPRO_ASP_ID,
                    password: process.env.TAXPRO_PASSWORD,
                    gstin: gstnNo,
                    authtoken: authToken
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {

        if (error?.response?.data) {
            throw new Error(JSON.stringify(error.response.data));
        }

        throw error;

    }

};