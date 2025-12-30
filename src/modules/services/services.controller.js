import slugify from "slugify";
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5)
import { serviceModel } from "../../DB/models/servicesModel.js";
import CustomError from "../../utilities/customError.js";
import imagekit, { destroyImage } from "../../utilities/imagekitConfigration.js";

export const createService = async (req, res, next) => {
  
    console.log(req.body);
  if (req.body["feature_ar."]) req.body.feature_ar = req.body["feature_ar."];
  if (req.body["feature_en."]) req.body.feature_en = req.body["feature_en."];
    const {
      name_ar,
      name_en,
      icon,
      color,
      feature_ar,
      feature_en,
      shortDescription_ar,
      shortDescription_en,
      description_ar,
      description_en,
      serviceType,
      price,
      currency,
      aggregateRating_ratingValue,
      aggregateRating_reviewCount
    } = req.body;
    
    // 🔥 Validate required fields
    if (!name_ar || !name_en) {
      return next(new CustomError("Arabic and English names are required", 400));
    }

    if (!description_ar || !description_en) {
      return next(new CustomError("Descriptions (AR + EN) are required", 400));
    }

    const imageFiles = req.files || [];
    if (imageFiles.length === 0) {
      return next(new CustomError("At least one image is required", 400));
    }

    // 🔥 Create slug from English name
    const slug = slugify(name_en, { replacement: '_', lower: true });

    // 🔥 Prepare upload folder
    const customId = nanoid();
    const uploadedImages = [];

    // 🔥 Upload images to ImageKit
    for (const file of imageFiles) {
      const uploadResult = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: `${process.env.PROJECT_FOLDER}/Services/${customId}`,
      });

      uploadedImages.push({
        imageLink: uploadResult.url,
        public_id: uploadResult.fileId,
      });
    }

    // 🔥 Create new service document
    const newService = new serviceModel({
      name_ar,
      name_en,
      slug,
      icon,
      color,
    features: feature_ar && feature_en
      ? feature_ar.map((fa, index) => ({
          feature_ar: fa,
          feature_en: feature_en[index] || "",
        }))
      : [],
      shortDescription_ar,
      shortDescription_en,
      description_ar,
      description_en,
      serviceType,
      price,
      currency,
      images: uploadedImages,
      aggregateRating_ratingValue: aggregateRating_ratingValue || 0,
      aggregateRating_reviewCount: aggregateRating_reviewCount || 0, 
      customId,
    });
    
    console.log(newService);
    

    await newService.save();

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: newService,
    });
};
export const getAllServices = async (req, res, next) => {
  try {
    const services = await serviceModel.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      services,
    });
  } catch (err) {
    next(err);
  } 
};

export const getServiceById= async (req, res, next) => {

  console.log(req.params);
  
    const id  = req.params.id;
    console.log(id);
    
    const service = await serviceModel.findById(id);
    if (!service) {
      return next(new CustomError("Service not found", 404));
    }
    return res.status(200).json({
      success: true,
      service,
    });
  }

export const updateService = async (req, res, next) => {
  
    const id  = req.params.id;
    
    const service = await serviceModel.findById(id);
    if (!service) {
      return next(new CustomError("Service not found", 404));
    }
    if(service.name_en !== req.body.name_en){
      service.slug = slugify(req.body.name_en, { replacement: '_', lower: true });
    }
    
    service.name_ar = req.body.name_ar || service.name_ar;
    service.name_en = req.body.name_en ||  service.name_en;
    service.shortDescription_ar = req.body.shortDescription_ar || service.shortDescription_ar;
    service.shortDescription_en = req.body.shortDescription_en || service.shortDescription_en;
    service.description_ar = req.body.description_ar || service.description_ar;
    service.description_en = req.body.description_en || service.description_en;
    service.serviceType = req.body.serviceType || service.serviceType;
    service.price = req.body.price || service.price;
    service.currency = req.body.currency || service.currency;

    if(req.files && req.files.length > 0){
      // 🔥 Upload new images to ImageKit
  if (service.images?.public_id) {
    await destroyImage(service.images.public_id);
  }
      const imageFiles = req.files;
      const uploadedImages = [];
      for (const file of imageFiles) {
        const uploadResult = await imagekit.upload({
          file: file.buffer,
          fileName: file.originalname,
          folder: `${process.env.PROJECT_FOLDER}/Services/${service.customId}`,
        });
        uploadedImages.push({
          imageLink: uploadResult.url,
          public_id: uploadResult.fileId,
        });
      }

          service.images = uploadedImages;

      console.log("Last");
      
    await service.save();
    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
    }
  }

export const deleteService= async (req, res, next) => {

    const id  = req.params.id;
    
    const service = await serviceModel.findByIdAndDelete(id);
    if (!service) {
      return next(new CustomError("Service not found", 404));
    }

    service.images.forEach(async (image) => {
      await destroyImage(image.public_id);
    });
    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  }


export const multyDeleteServices = async (req, res, next) => {
  const { ids } = req.body; // Expecting an array of IDs in the request body
  if (!Array.isArray(ids) || ids.length === 0) {
    return next(new CustomError("Please provide an array of IDs to delete", 400));
  }
  const services = await serviceModel.find({ _id: { $in: ids } });
  if (services.length === 0) {
    return next(new CustomError("No services found for the provided IDs", 404));
  }
  for (const service of services) {
    service.images.forEach(async (image) => {
      await destroyImage(image.public_id);
    });
    await serviceModel.findByIdAndDelete(service._id);
  }
  return res.status(200).json({
    success: true,
    message: "Services deleted successfully",
  });
}


// ~ Create Review 
export const createServiceReview = async (req, res, next) => {
  const id = req.params.id;
  const { authorName, rating, body } = req.body;  
  const service = await serviceModel.findById(id);
  if (!service) {
    return next(new CustomError("Service not found", 404));
  }
  const newReview = {
    authorName,
    rating,
    body,
    screenShots: []
  }

const ratingValue = Number(service.aggregateRating_ratingValue) || 0;
let ratingCount = Number(service.aggregateRating_reviewCount) || 0;
const newRating = Number(req.body.rating);  // ⬅ الحل الأساسي

ratingCount += 1;

service.aggregateRating_ratingValue =
  ((ratingValue * (ratingCount - 1)) + newRating) / ratingCount;

service.aggregateRating_reviewCount = ratingCount;


    if (req.files && req.files.length > 0) {
      const imageFiles = req.files;
      const uploadedScreenshots = [];
      for (const file of imageFiles) {
        const uploadResult = await imagekit.upload({
          file: file.buffer,
          fileName: file.originalname,
          folder: `${process.env.PROJECT_FOLDER}/Services/${service.customId}/Reviews`,
        });
        uploadedScreenshots.push({
          imageLink: uploadResult.url,
          public_id: uploadResult.fileId,
        });
      }
    newReview.screenShots = uploadedScreenshots;
    }
  service.reviews.push(newReview);
    

  await service.save();
  return res.status(201).json({
    success: true,
    message: "Review added successfully",
    review: newReview,
  });
};
