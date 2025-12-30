import { multerCloudFunction } from '../../services/multerCloud.js';
import { allowedExtensions } from '../../utilities/allowedExtensions.js';
import * as userCon from './auth.controller.js';
import { Router } from 'express';

const userRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Management & Authentication
 */

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       201:
 *         description: User registered successfully
 */
userRouter.post('/register', userCon.register);

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success
 */
userRouter.post('/login', userCon.login);
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 */
userRouter.get('/', userCon.getAllUsers);

/**
 * @swagger
 * /api/v1/user:
 *   get:
 *     summary: Get One user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: display one user
 */
userRouter.get('/:id', userCon.getOneUsers);

/**
 * @swagger
 * /api/v1/users/add:
 *   post:
 *     summary: Add a user (Admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       201:
 *         description: User added successfully
 */
userRouter.post('/add', userCon.addUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user data
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Upload user profile image
 *     responses:
 *       200:
 *         description: User updated successfully
 */
userRouter.put(
  '/:id',
  multerCloudFunction(allowedExtensions.Image).single("image"),
  userCon.UpdateUser
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
userRouter.delete('/:id', userCon.deleteUser);

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 */
userRouter.post('/logout', userCon.logout);

/**
 * @swagger
 * /api/v1/users/forget-password:
 *   post:
 *     summary: Send reset password email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent successfully
 */
userRouter.post('/forget-password', userCon.forgetPassword);

/**
 * @swagger
 * /api/v1/users/reset/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
userRouter.post('/reset/:token', userCon.resetPassword);

userRouter.post('/reset/:token',userCon.resetPassword)

/**
 * @swagger
 * /api/v1/users/change_password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
userRouter.post('/change_password', userCon.changePassword);


/**
 * @swagger
 * /api/v1/users/multy:
 *   post:
 *     summary: Delete multiple users
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Users deleted successfully
 */
userRouter.post('/multy', userCon.multyDeleteUsers);

export default userRouter;


