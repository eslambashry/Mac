import { UserModel } from "../../DB/models/userModel.js";
import { generateToken, verifyToken } from "../../utilities/tokenFunctions.js";
import { nanoid } from "nanoid";
import pkg from 'bcrypt';
import CustomError from "../../utilities/customError.js";
import imagekit, { destroyImage } from "../../utilities/imagekitConfigration.js";
import jwt from "jsonwebtoken";
import { emailTemplate } from "../../utilities/emailTemplate.js";
import { sendEmailService } from "../../services/sendEmail.js";

export const registerUser = async ({ userName, email, password, role = 'user' }) => {
    const isExsisted = await UserModel.findOne({ email });
    if (isExsisted) {
        throw new CustomError('Email Already Existed', 409);
    }

    const hashedPassword = pkg.hashSync(password, +process.env.SALT_ROUNDS);

    const user = new UserModel({
        userName,
        email,
        password: hashedPassword,
        role
    });
    const saveUser = await user.save();
    return saveUser;
};

export const loginUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new CustomError('Email And Password Is Required', 422);
    }

    const userExsist = await UserModel.findOne({ email });
    if (!userExsist) {
        throw new CustomError('user not found', 401);
    }

    if (userExsist.isActive === false) { // Strict check
        throw new CustomError('user is not active', 401);
    }

    const passwordExsist = pkg.compareSync(password, userExsist.password);

    if (!passwordExsist) {
        throw new CustomError('password incorrect', 401);
    }

    const token = generateToken({
        payload: {
            email,
            _id: userExsist._id,
            role: userExsist.role
        },
        signature: process.env.SIGN_IN_TOKEN_SECRET,
        expiresIn: '12h',
    });

    const userUpdated = await UserModel.findOneAndUpdate(
        { email },
        {
            token,
            isActive: true, // Ensure boolean
        },
        { new: true },
    );
    return userUpdated;
};


export const createNewUser = async ({ userName, email, password, role, file }) => {
    if (!userName || !email || !password || !role) {
        throw new CustomError("All fields are required", 400);
    }

    const isExist = await UserModel.findOne({ email });
    if (isExist) {
        throw new CustomError("Email is already existed", 400);
    }

    const hashedPassword = pkg.hashSync(password, +process.env.SALT_ROUNDS);
    const customId = nanoid();

    const user = new UserModel({
        userName,
        email,
        password: hashedPassword,
        role,
        isActive: true,
        customId,
    });

    if (file) {
        const uploadResult = await imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: `${process.env.PROJECT_FOLDER}/User/${customId}`,
        });

        user.image = {
            imageLink: uploadResult.url,
            public_id: uploadResult.fileId,
        };
    }

    await user.save();
    return user;
};

export const updateUserService = async ({ id, userName, email, password, role, isActive, file }) => {
    const user = await UserModel.findById(id);

    if (!user) {
        throw new CustomError("User Didn't Found", 400);
    }

    if (file) {
        const uploadResult = await imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: `${process.env.PROJECT_FOLDER}/User/${user.customId}`,
        });
        user.image = {
            imageLink: uploadResult.url,
            public_id: uploadResult.fileId
        };
    }

    if (userName) user.userName = userName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive; // Check strictly for undefined to allow false

    if (password) {
        const hashedPassword = pkg.hashSync(password, +process.env.SALT_ROUNDS);
        user.password = hashedPassword;
    }

    await user.save();
    return user;
};

export const deleteUserService = async (id) => {
    const user = await UserModel.findById(id);
    if (!user) {
        throw new CustomError("User not found", 404);
    }
    const uploadedimage = user.image?.public_id;
    if (uploadedimage) {
        await destroyImage(uploadedimage);
    }
    await UserModel.findByIdAndDelete(id);
    return user;
};

export const deleteUsersService = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new CustomError("Please provide an array of IDs to delete", 400);
    }

    const Users = await UserModel.find({ _id: { $in: ids } });

    if (Users.length === 0) {
        throw new CustomError("No Users found for the provided IDs", 404);
    }

    await UserModel.deleteMany({ _id: { $in: ids } });
    return true;
};

export const logoutService = async (token) => {
    if (!token) {
        throw new CustomError("Token is required", 400);
    }

    let decoded;
    try {
        decoded = verifyToken({
            token,
            signature: process.env.SIGN_IN_TOKEN_SECRET,
        });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            decoded = jwt.decode(token);
        } else {
            throw new CustomError("Invalid token", 401);
        }
    }

    if (!decoded?.email) {
        throw new CustomError("Invalid token payload", 401);
    }

    await UserModel.findOneAndUpdate(
        { email: decoded.email },
        { token: null },
        { new: true }
    );
    return true;
};

export const initiateForgotPasswordService = async (email, protocol, host) => {
    const isExist = await UserModel.findOne({ email });
    if (!isExist) {
        throw new CustomError("Email not found", 400);
    }

    const code = nanoid();
    const hashcode = pkg.hashSync(code, +process.env.SALT_ROUNDS);
    const token = generateToken({
        payload: {
            email,
            sendCode: hashcode,
        },
        signature: process.env.RESET_TOKEN,
        expiresIn: '1h',
    });

    const resetPasswordLink = `${protocol}://${host}/user/reset/${token}`;
    const isEmailSent = await sendEmailService({
        to: email,
        subject: "Reset Password",
        message: emailTemplate({
            link: resetPasswordLink,
            linkData: "Click Here Reset Password",
            subject: "Reset Password",
        }),
    });

    if (!isEmailSent) {
        throw new CustomError("Email failed to send", 500);
    }

    const userupdete = await UserModel.findOneAndUpdate(
        { email },
        { forgetCode: hashcode },
        { new: true },
    );
    return userupdete;
};

export const resetPasswordService = async (token, newPassword) => {
    const decoded = verifyToken({ token, signature: process.env.RESET_TOKEN });
    const user = await UserModel.findOne({
        email: decoded?.email,
        forgetCode: decoded?.sendCode // Typo fix: fotgetCode -> forgetCode, sentCode -> sendCode (check logic)
    });

    // In controller: forgetCode: hashcode
    // In token payload: sendCode: hashcode
    // In model: forgetCode (based on schema? No, explicit update in controller was forgetCode)
    // Wait, controller line 313: `fotgetCode: decoded?.sentCode`. Typo in controller!
    // I will assume `forgetCode` is the correct field name standard.

    if (!user) {
        throw new CustomError("Invalid token or link expired", 400);
    }

    const hashedPassword = pkg.hashSync(newPassword, +process.env.SALT_ROUNDS);
    user.password = hashedPassword;
    user.forgetCode = null; // Clear it

    const updatedUser = await user.save();
    return updatedUser;
};

export const getAllUsersService = async () => {
    const users = await UserModel.find();
    if (!users || users.length === 0) {
        throw new CustomError('No users found', 404);
    }
    return users;
};

export const getOneUserService = async (id) => {
    const user = await UserModel.findById(id);
    if (!user) {
        throw new CustomError('No user found', 404);
    }
    return user;
};

export const changePasswordService = async (email, newPassword) => {
    const userExsist = await UserModel.findOne({ email });

    if (!userExsist) {
        throw new CustomError("User not found", 404);
    }
    const hashedPassword = pkg.hashSync(newPassword, +process.env.SALT_ROUNDS);

    userExsist.password = hashedPassword;
    await userExsist.save(); // Better to save than just mutate
    return userExsist;
};
