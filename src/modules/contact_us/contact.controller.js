import { sendContactUsEmailService } from "../../services/contactUsEmail.js";
import CustomError from "../../utilities/customError.js"

export const sendContactUsEmail = async (req, res, next) => {

    const { fullName, companyName, companyEmail , phoneNumber, message } = req.body;

    if (!fullName || !companyName || !companyEmail || !phoneNumber || !message ) {
      return next(new CustomError("Please provide name, email, message and service", 400));
    }

    await sendContactUsEmailService({ fullName,companyName, companyEmail, phoneNumber, message });

    return res.status(200).json({
        success: true,
        message: "Email sent successfully"
     });
};
