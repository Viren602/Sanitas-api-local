import axios from "axios";

export const generateIRN = async (authToken, invoiceJson, gstnNo) => {
    try {

        const response = await axios.post(process.env.TAXPRO_EINVOICE_URL, invoiceJson, {
            headers: {
                "Content-Type": "application/json",
                "AuthToken": authToken,
                "aspid": process.env.TAXPRO_ASP_ID,
                "password": process.env.TAXPRO_PASSWORD,
                "Gstin": gstnNo,
                "User_name": process.env.TAXPRO_USERNAME
            }
        });

        return response.data;

    } catch (error) {
        console.log("Generate IRN Error:", error.response?.data || error);
        throw error;
    }
};