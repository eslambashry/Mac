import { Router } from "express";
import * as servicesCon from "./services.controller.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utilities/allowedExtensions.js";

const servicesRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Services Management
 */

/**
 * @swagger
 * /api/v1/services/add:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
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
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 5 images
 *     responses:
 *       201:
 *         description: Service created successfully
 */


servicesRouter.post(
  "/add",
  multerCloudFunction(allowedExtensions.Image).any(),
  servicesCon.createService
);
    
servicesRouter.put(
    "/:id",
    multerCloudFunction(allowedExtensions.Image).array("image", 5),
    servicesCon.updateService
);

/**
 * @swagger
 * /api/v1/services/:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of all services
 */
servicesRouter.get("/",servicesCon.getAllServices);

/**
 * @swagger
 * /api/v1/services/ar:
 *   get:
 *     summary: Get all Arabic Services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of all Arabic services
 */
servicesRouter.get("/ar",servicesCon.getAllArabicServices);

/**
 * @swagger
 * /api/v1/services/en:
 *   get:
 *     summary: Get all English Services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of all English services
 */
servicesRouter.get("/en",servicesCon.getAllEnglishServices);




/**
 * @swagger
 * /api/v1/services/{id}:
 *   get:
 *     summary: Get a single service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service data
 */
servicesRouter.get("/:id",servicesCon.getServiceById);



/**
 * @swagger
 * /api/v1/services/{id}:
 *   put:
 *     summary: Update a service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
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
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 5 images
 *     responses:
 *       200:
 *         description: Service updated successfully
 */



/**
 * @swagger
 * /api/v1/services/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 */

servicesRouter.delete("/:id",servicesCon.deleteService);


servicesRouter.post("/multy",servicesCon.multyDeleteServices);



// ~ Create Review 
/**
 * @swagger
 * /api/v1/services/review/{id}:
 *   post:
 *     summary: Add review to a service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               review:
 *                 type: string
 *               screenShots:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 3 screenshots
 *     responses:
 *       200:
 *         description: Review added successfully
 */

servicesRouter.post(
    "/review/:id", 
    multerCloudFunction(allowedExtensions.Image).array("screenShots", 3),
    servicesCon.createServiceReview
);

export default servicesRouter;