import * as authService from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    const saveUser = await authService.registerUser(req.body);
    res.status(201).json({ message: 'done', saveUser });
  } catch (error) {
    next(error);
  }
}

export const login = async (req, res, next) => {
  try {
    const userUpdated = await authService.loginUser(req.body);
    res.status(200).json({ message: 'Login Success', userUpdated });
  } catch (error) {
    next(error);
  }
}

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsersService();
    res.status(200).json({
      success: true,
      message: 'done',
      length: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
}

export const getOneUsers = async (req, res, next) => {
  try {
    const user = await authService.getOneUserService(req.params.id);
    res.status(200).json({
      success: true,
      message: 'done',
      user
    });
  } catch (error) {
    next(error);
  }
}

export const addUser = async (req, res, next) => {
  try {
    const { userName, email, password, role } = req.body;
    const user = await authService.createNewUser({
      userName,
      email,
      password,
      role,
      file: req.file
    });
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user
    });
  } catch (error) {
    next(error);
  }
};

export const UpdateUser = async (req, res, next) => {
  try {
    const { userName, email, password, role, isActive } = req.body;
    const user = await authService.updateUserService({
      id: req.params.id,
      userName,
      email,
      password,
      role,
      isActive: isActive === undefined ? undefined : isActive, // pass undefined if it's undefined
      file: req.file
    });
    res.status(200).json({ message: "user updated successfully", user });
  } catch (error) {
    next(error);
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    const user = await authService.deleteUserService(req.params.id);
    res.status(201).json({ message: "User deleted", user });
  } catch (error) {
    next(error);
  }
}

export const multyDeleteUsers = async (req, res, next) => {
  try {
    await authService.deleteUsersService(req.body.ids);
    return res.status(200).json({
      success: true,
      message: "Users deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export const logout = async (req, res, next) => {
  try {
    await authService.logoutService(req.body.token);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

export const forgetPassword = async (req, res, next) => {
  try {
    const userupdete = await authService.initiateForgotPasswordService(
      req.body.email,
      req.protocol,
      req.headers.host
    );
    return res.status(200).json({ message: "password changed", userupdete });
  } catch (error) {
    next(error);
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    const updatedUser = await authService.resetPasswordService(
      req.params.token,
      req.body.newPassword
    );
    res.status(200).json({ message: "Done", updatedUser });
  } catch (error) {
    next(error);
  }
}

export const changePassword = async (req, res, next) => {
  try {
    const userExsist = await authService.changePasswordService(
      req.body.email,
      req.body.newPassword
    );
    res.status(200).json({ success: true, message: "Password Changed", userExsist });
  } catch (error) {
    next(error);
  }
}