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
 *               - fullName
 *               - companyEmail
 *               - message
 *               - phoneNumber
 *               - companyName
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *                 description: Sender's full name
 *               companyName:
 *                 type: string
 *                 example: MACC Solutions
 *                 description: Company name (optional)
 *               companyEmail:
 *                 type: string
 *                 example: john@macc.com
 *                 description: Sender's email address
 *               phoneNumber:
 *                 type: string
 *                 example: "+201234567890"
 *                 description: Phone number (optional)
 *               message:
 *                 type: string
 *                 example: I would like to know more about your services.
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
