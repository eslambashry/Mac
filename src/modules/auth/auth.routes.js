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

userRouter.post('/forget',userCon.forgetPassword)
userRouter.post('/reset/:token',userCon.resetPassword)

userRouter.post('/change_password',userCon.changePassword)
userRouter.post('/multy',userCon.multyDeleteUsers)

export default userRouter;


