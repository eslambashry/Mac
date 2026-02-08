import express from "express";
import * as applicationCon from "./applications.controller.js";
import { allowedExtensions } from "../../utilities/allowedExtensions.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { isAuth } from "../../middleware/isAuth.js";
import { systemRoles } from "../../utilities/systemRole.js";

const applicationRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Applications Management
 */

/**
 * @swagger
 * /api/v1/applications/apply:
 *   post:
 *     summary: Apply for a career
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - careerId
 *               - fullName
 *               - email
 *               - phone
 *               - cv
 *             properties:
 *               careerId:
 *                 type: string
 *                 description: ID of the career to apply for
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: CV Document (PDF, DOC, DOCX)
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Missing fields or file
 *       404:
 *         description: Career not found or not active
 *       409:
 *         description: Already applied
 */
applicationRouter.post(
  "/apply",
  multerCloudFunction(allowedExtensions.Document).single("cv"),
  applicationCon.applyForCareer
);

/**
 * @swagger
 * /api/v1/applications/apply-general:
 *   post:
 *     summary: Apply for general position (without specific career)
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - cv
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: CV Document (PDF, DOC, DOCX)
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Missing fields or file
 */
applicationRouter.post(
  "/apply-general",
  multerCloudFunction(allowedExtensions.Document).single("cv"),
  applicationCon.applyGeneral
);

/**
 * @swagger
 * /api/v1/applications/:
 *   get:
 *     summary: Get all applications
 *     tags: [Applications]
 *     responses:
 *       200:
 *         description: List of all applications
 */
applicationRouter.get('/', applicationCon.getAllApplications)

/**
 * @swagger
 * /api/v1/applications/byjob/{id}:
 *   get:
 *     summary: Get applications for a specific career
 *     tags: [Applications]
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
 *         description: List of applications for the career
 *       404:
 *         description: No applications found
 */
applicationRouter.get('/byjob/:id', isAuth([systemRoles.ADMIN, systemRoles.HR]), applicationCon.getSingleCareerApplications)

/**
 * @swagger
 * /api/v1/applications/{id}:
 *   get:
 *     summary: Get a single application
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application details
 *       404:
 *         description: Application not found
 */
applicationRouter.get('/:id', applicationCon.getSingleApplication)

/**
 * @swagger
 * /api/v1/applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, viewed, accepted, rejected]
 *                 description: New status
 *     responses:
 *       200:
 *         description: Application status updated
 *       404:
 *         description: Application not found
 */
applicationRouter.patch('/:id/status', isAuth([systemRoles.ADMIN, systemRoles.HR]), applicationCon.updateApplicationStatus)

/**
 * @swagger
 * /api/v1/applications/{id}:
 *   delete:
 *     summary: Delete an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *       404:
 *         description: Application not found
 */
applicationRouter.delete('/:id', isAuth([systemRoles.ADMIN, systemRoles.HR]), applicationCon.deleteApplication)

/**
 * @swagger
 * /api/v1/applications/bulk-delete:
 *   post:
 *     summary: Bulk delete applications
 *     tags: [Applications]
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
 *                 description: Array of Application IDs to delete
 *     responses:
 *       200:
 *         description: Applications deleted successfully
 *       400:
 *         description: Invalid IDs provided
 *       404:
 *         description: No applications found to delete
 */
applicationRouter.post('/bulk-delete', isAuth([systemRoles.ADMIN, systemRoles.HR]), applicationCon.bulkDeleteApplications)

export default applicationRouter;