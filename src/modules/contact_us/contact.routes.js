import { Router } from "express";
import { sendContactUsEmail } from "./contact.controller.js";

const contactRoute = Router();

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact Us Form
 */

/**
 * @swagger
 * /api/v1/contact/send:
 *   post:
 *     summary: Send a Contact Us message
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 description: Sender's full name
 *               email:
 *                 type: string
 *                 description: Sender's email address
 *               phone:
 *                 type: string
 *                 description: (Optional) Phone number
 *               message:
 *                 type: string
 *                 description: Message content sent by the user
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Server error
 */
contactRoute.post("/send", sendContactUsEmail);

export default contactRoute;
