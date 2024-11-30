import companyAdminModel from "../model/companyAdmin.js";
import companyFinancialYearModel from "../model/companyFinancialYear.js";
import companyGroupModel from "../model/companyGroup.js";

const getCompanyInfo = async (req, res) => {
    try {
        let response = [];
        const companyFinancialYear = await companyFinancialYearModel.find({});
        const companyGroup = await companyGroupModel.find({});
        response = {
            companyGroup,
            companyFinancialYear
        }
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const userAuthentication = async (req, res) => {
    try {
        let data = req.body.data
        const checkUser = await companyAdminModel.findOne({ UserName: data.userName });
        if (checkUser !== null) {
            if (checkUser.Password === data.password) {
                res.status(201).json({ Message: "User authenticate successfully", statusCode: 200, responseContent: checkUser });
            } else {
                res.status(201).json({ Message: "Password is incorrect", statusCode: 401, responseContent: [] });
            }
        } else {
            res.status(201).json({ Message: "User not found", statusCode: 404, responseContent: [] });
        }

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};


export {
    getCompanyInfo,
    userAuthentication
};
