import { sendContactUsEmailService } from "../../services/contactEmail.js";
import CustomError from "../../utilities/customError.js"

export const sendContactUsEmail = async (req, res, next) => {

    const { name, email, phone, message, service } = req.body;

    if (!name || !email || !phone || !message || !service) {
      return next(new CustomError("Please provide name, email, message and service", 400));
    }

    // optional: basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new CustomError("Invalid email format", 400));
    }

    await sendContactUsEmailService({ name, email, phone, message,service });

    return res.status(200).json({
        success: true,
        message: "Email sent successfully"
     });
};
