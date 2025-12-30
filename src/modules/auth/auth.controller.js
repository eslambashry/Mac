import { UserModel } from "../../DB/models/userModel.js"
import {generateToken, verifyToken} from "../../utilities/tokenFunctions.js"
import { nanoid } from "nanoid"
import pkg from 'bcrypt'
import CustomError from "../../utilities/customError.js"
import imagekit, { destroyImage } from "../../utilities/imagekitConfigration.js"
import jwt from "jsonwebtoken"
import { emailTemplate } from "../../utilities/emailTemplate.js"
import { sendEmailService } from "../../services/sendEmail.js"

export const register = async(req,res,next) => {
    
    const { 
        userName,
        email,
        password,
        role
    } = req.body
    //is email exsisted
    const isExsisted = await UserModel.findOne({email})
    if(isExsisted){
        return next(new CustomError('Email Already Exsisted', 409))
    }

    const hashedPassword = pkg.hashSync(password, +process.env.SALT_ROUNDS)
    
    const user = new UserModel({
        userName,
        email,
        password:hashedPassword,
        role
    })
    const saveUser = await user.save()
    res.status(201).json({message:'done', saveUser})
}


export const login = async(req,res,next) => {
    const {email,password} = req.body
     
    if(!email || !password){
        return next(new CustomError('Email And Password Is Required',  422 ))
     }

    const userExsist = await UserModel.findOne({email})
    if(!userExsist){
        return next(new CustomError('user not found',401))
    } 

    if(userExsist.isActive == false){
        return next(new CustomError('user is not active',401))
    }

    
    const passwordExsist = pkg.compareSync(password,userExsist.password)
 
    if(!passwordExsist){
        return next(new CustomError('password incorrect',401))
    }

    const token = generateToken({
        payload:{
            email,
            _id: userExsist._id,
            role: userExsist.role
        },
        signature: process.env.SIGN_IN_TOKEN_SECRET ,
        expiresIn: '12h',
     })
     

     const userUpdated = await UserModel.findOneAndUpdate(
        
        {email},
        
        {
            token,
            isActive: true,
        },
        {new: true},
     )
     res.status(200).json({message: 'Login Success', userUpdated})
}


export const getAllUsers = async(req,res,next) => { 

    const users = await UserModel.find()

    if (!users || users.length === 0) {
        return next(new CustomError('No users found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'done', 
        length: users.length,
        users
    })
}

export const getOneUsers = async(req,res,next) => { 
    const id = req.params.id
    const user = await UserModel.findById(id)

    if (!user) {
        return next(new CustomError('No user found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'done', 
        user
    })
}

export const addUser = async (req, res, next) => {
  const { userName, email, password, role} = req.body;
    
  // ? Validate required fields
  if (!userName || !email || !password || !role) {
    return next(new CustomError("All fields are required", 400));
  }

  // Check if email already exists
  const isExist = await UserModel.findOne({ email });
  if (isExist) {
    return next(new CustomError("Email is already existed", 400));
  }

  // Hash the password
  const hashedPassword = pkg.hashSync(password, +process.env.SALT_ROUNDS);

  // Generate custom ID for image folder
  const customId = nanoid();

  // Prepare user object
  const user = new UserModel({
    userName,
    email,
    password: hashedPassword,
    role,
    isActive:"Active",
    customId,
  });

  if (req.file) {
    const uploadResult = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: `${process.env.PROJECT_FOLDER }/User/${customId}`,
    });

    user.image = {
      imageLink: uploadResult.url,
      public_id: uploadResult.fileId,
    };
  }

  await user.save();

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user
  });
};

export const UpdateUser = async(req,res,next) => {
    const {
        userName,
        email,
        password,
        role,
        isActive
    } = req.body

    const id = req.params.id
    const user = await UserModel.findById(id)

    
    if(!user) {
        return next(new Error("user Didn't Found",{cause:400}))
      }
        // Check if file is uploaded
        if (req.file) {
            // Upload image to ImageKit
            const uploadResult = await imagekit.upload({
              file: req.file.buffer,
              fileName: req.file.originalname,
              folder: `${process.env.PROJECT_FOLDER}/User/${user.customId}`,
            });
            user.image.imageLink = uploadResult.url
            user.image.public_id = uploadResult.fileId
          }
          
          if(userName) user.userName = userName
          if(email) user.email = email
          if(role) user.role = role
          if(isActive) user.isActive = isActive

          if(password) {
            const hashedPassword = pkg.hashSync(password, +process.env.SALT_ROUNDS)
            user.password = hashedPassword
          }

          // save the user 
          await user.save()
          res.status(200).json({message : "user updated successfully",user})      
}

export const deleteUser = async(req,res,next) => {
    const {id} = req.params
    
    const user = await UserModel.findById(id)
  if (user) {
    const uploadedimage = user.image.public_id
    if(uploadedimage){
        await destroyImage(uploadedimage)
    }
  }
  await UserModel.findByIdAndDelete(id)
    res.status(201).json({message:"User",user})
}

export const logout = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
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
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    if (!decoded?.email) {
      return res.status(401).json({ message: "Invalid token" });
    }

    await UserModel.findOneAndUpdate(
      { email: decoded.email },
      { token: null },
      { new: true }
    );

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


  export const forgetPassword = async(req,res,next) => {
    const {email} = req.body

    const isExist = await UserModel.findOne({email})
    if(!isExist){
        return res.status(400).json({message: "Email not found"})
    }
    
    const code = nanoid()
    const hashcode = pkg.hashSync(code, +process.env.SALT_ROUNDS) // ! process.env.SALT_ROUNDS
    const token = generateToken({
        payload:{
            email,
            sendCode:hashcode,
        },
        signature: process.env.RESET_TOKEN, // ! process.env.RESET_TOKEN
        expiresIn: '1h',
    })
    
    const resetPasswordLink = `${req.protocol}://${req.headers.host}/user/reset/${token}`
    const isEmailSent = sendEmailService({
        to:email,
        subject: "Reset Password",
        message: emailTemplate({
            link:resetPasswordLink,
            linkData:"Click Here Reset Password",
            subject: "Reset Password",
        }),
    })
    if(!isEmailSent){
        return res.status(400).json({message:"Email not found"})
    }

    const userupdete = await UserModel.findOneAndUpdate(
        {email},
        {forgetCode:hashcode},
        {new: true},
    )
    return res.status(200).json({message:"password changed",userupdete})
}

export const resetPassword = async(req,res,next) => {
    const {token} = req.params
    const decoded = verifyToken({token, signature: process.env.RESET_TOKEN}) // ! process.env.RESET_TOKEN
    const user = await UserModel.findOne({
        email: decoded?.email,
        fotgetCode: decoded?.sentCode
    })

    if(!user){
        return res.status(400).json({message: "you are alreade reset it , try to login"})
    }

    const {newPassword} = req.body
    const hashedPassword = pkg.hashSync(newPassword, +process.env.SALT_ROUNDS)
    user.password = hashedPassword,
    user.forgetCode = null

    const updatedUser = await user.save()
    res.status(200).json({message: "Done",updatedUser})
}

export const changePassword = async(req,res,next) => {
  const {email, newPassword} = req.body

  const userExsist = await UserModel.findOne({email:email})

  if(!userExsist){
    return next(new CustomError("All fields are required", 400));
  }
    const hashedPassword = pkg.hashSync(newPassword, +process.env.SALT_ROUNDS)

  userExsist.password = hashedPassword
  res.status(200).json({success:true,message:"Password Changed",userExsist})
}

export const multyDeleteUsers = async (req, res,next) => {
    const { ids } = req.body; // Expecting an array of IDs in the request body

    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new CustomError("Please provide an array of IDs to delete", 400));
    }

    const Users = await UserModel.find({ _id: { $in: ids } });

    if (Users.length === 0) {
      return next(new CustomError("No Users found for the provided IDs", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Users deleted successfully",
    });
}