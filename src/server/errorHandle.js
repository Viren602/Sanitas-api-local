import { ErrorMail, ErrorMessage, ErrorSubject, FromMail } from "../middleware/appSetting.js";
import { getRequestData } from "../middleware/encryption.js";
import mailsender from "../utils/sendingEmail.js";
import config from "../config/config.js";

function errorHandler(err, req, res, message) {
    const isProd = config.PRODUCTION === 'true' ? 'Production' : 'Local';
    let html = `<html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body>
                        <h1>${message || 'Error Occurred'}</h1>
                        <p><strong>Message:</strong> ${err?.message || 'N/A'}</p>
                        <p><strong>Environment:</strong> ${isProd}</p>
                        <p><strong>Endpoint:</strong> ${req?.originalUrl || 'N/A'}</p>
                        <p><strong>Method:</strong> ${req?.method || 'N/A'}</p>
                        <p><strong>Request Body:</strong> ${JSON.stringify(req?.body || {}, null, 2)}</p>
                    </body>
                    </html>`

    let emaildata = {
        toMail: ErrorMail,
        subject: ErrorSubject,
        fromMail: ErrorMail,
        html: html,
        pass: 'fbaf cbzj fpwf yufg'
    };

    mailsender(emaildata)

    return res.status(200).json({
        data: {
            statusCode: 500,
            Message: ErrorMessage,
            responseData: err.message,
            isEnType: true
        },
    });;
};

export default errorHandler
