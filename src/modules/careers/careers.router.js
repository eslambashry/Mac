import { Router } from "express";
import * as careerCon from "./careers.controller.js"
import { isAuth } from "../../middleware/isAuth.js";
import { systemRoles } from "../../utilities/systemRole.js";
const careerRouter = Router()

/**
 * @swagger
 * tags:
 *   name: Careers
 *   description: Careers Management
 */

/**
 * @swagger
 * /api/v1/careers/create:
 *   post:
 *     summary: Create a new career
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title_en
 *               - title_ar
 *               - department_en
 *               - department_ar
 *               - location_en
 *               - location_ar
 *               - employmentType_en
 *               - employmentType_ar
 *             properties:
 *               title_en:
 *                 type: string
 *               title_ar:
 *                 type: string
 *               department_en:
 *                 type: string
 *               department_ar:
 *                 type: string
 *               location_en:
 *                 type: string
 *               location_ar:
 *                 type: string
 *               employmentType_en:
 *                 type: string
 *               employmentType_ar:
 *                 type: string
 *               shortDescription_en:
 *                 type: string
 *               shortDescription_ar:
 *                 type: string
 *               description_en:
 *                 type: string
 *               description_ar:
 *                 type: string
 *               responsibilities_en:
 *                 type: string
 *               responsibilities_ar:
 *                 type: string
 *               requirements_en:
 *                 type: string
 *               requirements_ar:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Career created successfully
 */
careerRouter.post('/create', isAuth([systemRoles.ADMIN, systemRoles.HR]), careerCon.createCareer)

/**
 * @swagger
 * /api/v1/careers/:
 *   get:
 *     summary: Get all careers
 *     tags: [Careers]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, ar]
 *           default: en
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: employmentType
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of careers
 */
careerRouter.get('/', careerCon.getAllCareers)

/**
 * @swagger
 * /api/v1/careers/one/{id}:
 *   get:
 *     summary: Get a single career
 *     tags: [Careers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Career ID
 *     responses:
 *       200:
 *         description: Career details
 *       404:
 *         description: Career not found
 */
careerRouter.get('/one/:id', careerCon.getOneCareer)

/**
 * @swagger
 * /api/v1/careers/ar:
 *   get:
 *     summary: Get all Arabic careers (projection)
 *     tags: [Careers]
 *     responses:
 *       200:
 *         description: List of Arabic careers
 */
careerRouter.get('/ar', careerCon.getAllArabicCareer)

/**
 * @swagger
 * /api/v1/careers/en:
 *   get:
 *     summary: Get all English careers (projection)
 *     tags: [Careers]
 *     responses:
 *       200:
 *         description: List of English careers
 */
careerRouter.get('/en', careerCon.getAllEnglishCareer)

/**
 * @swagger
 * /api/v1/careers/{id}:
 *   put:
 *     summary: Update a career
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Career ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title_en:
 *                 type: string
 *               title_ar:
 *                 type: string
 *               department_en:
 *                 type: string
 *               department_ar:
 *                 type: string
 *               location_en:
 *                 type: string
 *               location_ar:
 *                 type: string
 *               employmentType_en:
 *                 type: string
 *               employmentType_ar:
 *                 type: string
 *               shortDescription_en:
 *                 type: string
 *               shortDescription_ar:
 *                 type: string
 *               description_en:
 *                 type: string
 *               description_ar:
 *                 type: string
 *               responsibilities_en:
 *                 type: string
 *               responsibilities_ar:
 *                 type: string
 *               requirements_en:
 *                 type: string
 *               requirements_ar:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Career updated successfully
 *       404:
 *         description: Career not found
 */
careerRouter.put("/:id", isAuth([systemRoles.ADMIN, systemRoles.HR]), careerCon.updateCareer);

/**
 * @swagger
 * /api/v1/careers/{id}/toggle:
 *   patch:
 *     summary: Toggle career status
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Career ID
 *     responses:
 *       200:
 *         description: Career status toggled successfully
 *       404:
 *         description: Career not found
 */
careerRouter.patch("/:id/toggle", isAuth([systemRoles.ADMIN, systemRoles.HR]), careerCon.toggleCareerStatus);

/**
 * @swagger
 * /api/v1/careers/{id}:
 *   delete:
 *     summary: Delete a career
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Career ID
 *     responses:
 *       200:
 *         description: Career deleted successfully
 *       404:
 *         description: Career not found
 */
careerRouter.delete("/:id", isAuth([systemRoles.ADMIN, systemRoles.HR]), careerCon.deleteCareer);

/**
 * @swagger
 * /api/v1/careers/bulk-delete:
 *   post:
 *     summary: Bulk delete careers
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
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
 *                 description: Array of career IDs to delete
 *     responses:
 *       200:
 *         description: Careers deleted successfully
 *       400:
 *         description: Invalid request - IDs array required
 *       404:
 *         description: No careers found for the provided IDs
 */
careerRouter.post("/bulk-delete", isAuth([systemRoles.ADMIN, systemRoles.HR]), careerCon.bulkDeleteCareers);

export default careerRouter