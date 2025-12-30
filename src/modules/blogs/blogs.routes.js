import { Router } from "express";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utilities/allowedExtensions.js";
import * as BlogCon from "./blogs.controller.js";
import { isAuth } from "../../middleware/isAuth.js";
import { systemRoles } from "../../utilities/systemRole.js";

const blogsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog Management
 */

/**
 * @swagger
 * /api/v1/blogs/add:
 *   post:
 *     summary: Create a new blog
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title_ar:
 *                 type: string
 *               title_en:
 *                 type: string
 *               content_ar:
 *                 type: string
 *               content_en:
 *                 type: string
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 5 images
 *     responses:
 *       201:
 *         description: Blog created successfully
 */


blogsRouter.post(
  '/add',
  multerCloudFunction(allowedExtensions.Image).fields([
    { name: "images", maxCount: 5 },
    { name: "authorImage", maxCount: 1 }
  ]),
  BlogCon.createBlog
);

/**
 * @swagger
 * /api/v1/blogs/:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of all blogs
 */

blogsRouter.get('/', BlogCon.getAllBlogs);


/**
 * @swagger
 * /api/v1/blogs/{id}:
 *   get:
 *     summary: Get a single blog
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog data
 */

blogsRouter.get('/:id', BlogCon.getOneBlogs);

/**
 * @swagger
 * /api/v1/blogs/{id}:
 *   put:
 *     summary: Update a blog
 *     tags: [Blogs]
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
 *               title_ar:
 *                 type: string
 *               title_en:
 *                 type: string
 *               content_ar:
 *                 type: string
 *               content_en:
 *                 type: string
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 5 images
 *     responses:
 *       200:
 *         description: Blog updated successfully
 */
blogsRouter.put(
  '/:id',
  multerCloudFunction(allowedExtensions.Image).fields([
    { name: "images", maxCount: 5 },
    { name: "authorImage", maxCount: 1 }
  ]),
  BlogCon.updateBlog
);

/**
 * @swagger
 * /api/v1/blogs/{id}:
 *   delete:
 *     summary: Delete a blog
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 */
blogsRouter.delete('/:id', BlogCon.deleteBlog);

blogsRouter.post('/multy', BlogCon.multyDeleteblogs);

export default blogsRouter;



 