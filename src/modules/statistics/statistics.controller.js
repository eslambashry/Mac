import { applicationsModel } from "../../DB/models/applicationsModel.js";
import { serviceModel } from "../../DB/models/servicesModel.js";
import { careerModel } from "../../DB/models/careerModel.js";
import CustomError from "../../utilities/customError.js";

export const getDashboardStats = async (req, res, next) => {
    try {
        const [applications, services, careers] = await Promise.all([
            applicationsModel.countDocuments(),
            serviceModel.countDocuments(),
            careerModel.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                applications,
                services,
                careers
            }
        });
    } catch (err) {
        next(err);
    }
};
