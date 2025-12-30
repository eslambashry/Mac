import slugify from "slugify";
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5)
import { serviceModel } from "../../DB/models/servicesModel.js";
import CustomError from "../../utilities/customError.js";
import imagekit, { destroyImage } from "../../utilities/imagekitConfigration.js";

export const createService = async (req, res, next) => {
  try {
    const {
      header_title_en,
      header_title_ar,
      header_description_en,
      header_description_ar,
      services // array of service items
    } = req.body;

    // 🔴 Validate header
    if (
      !header_title_en ||
      !header_title_ar ||
      !header_description_en ||
      !header_description_ar
    ) {
      return next(new CustomError("Service section header is required", 400));
    }

    // 🔴 Validate services array
    if (!services || !Array.isArray(services) || services.length === 0) {
      return next(new CustomError("At least one service is required", 400));
    }

    // 🔹 Prepare service items
    const uploadedServices = [];

    for (let i = 0; i < services.length; i++) {
      const s = services[i];

      if (
        !s.title_en ||
        !s.title_ar ||
        !s.category_en ||
        !s.category_ar ||
        !s.description_en ||
        !s.description_ar ||
        !s.order
      ) {
        return next(new CustomError(`All fields are required for service #${i + 1}`, 400));
      }

      // 🔹 Handle image
      const file = req.files[i]; // assuming images are uploaded as array with same order
      if (!file) {
        return next(new CustomError(`Image is required for service #${i + 1}`, 400));
      }

      const uploadResult = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: `${process.env.PROJECT_FOLDER}/Services/${nanoid()}`,
      });

      uploadedServices.push({
        ...s,
        order: Number(s.order),
        image: {
          imageLink: uploadResult.url,
          public_id: uploadResult.fileId,
        }
      });
    }

    // 🔹 Check if section exists
    let serviceSection = await serviceModel.findOne({ "header.title_en": header_title_en });

    if (serviceSection) {
      serviceSection.services.push(...uploadedServices);
      await serviceSection.save();
    } else {
      serviceSection = await serviceModel.create({
        header: {
          title_en: header_title_en,
          title_ar: header_title_ar,
          description_en: header_description_en,
          description_ar: header_description_ar,
        },
        services: uploadedServices,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Services created successfully",
      data: serviceSection
    });

  } catch (error) {
    console.error(error);
    return next(error);
  }
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

export const getAllArabicServices = async (req, res, next) => {
  try {
    const services = await serviceModel.find()
      .sort({ createdAt: -1 })
      .lean(); // lean() returns plain JS objects (better for mapping)

    // Map to Arabic only
    const arabicServices = services.map(section => ({
      header: {
        title: section.header.title_ar,
        description: section.header.description_ar
      },
      services: section.services.map(s => ({
        title: s.title_ar,
        category: s.category_ar,
        description: s.description_ar,
        order: s.order,
        image: s.image
      })),
      isActive: section.isActive,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt
    }));

    return res.status(200).json({
      success: true,
      services: arabicServices
    });
  } catch (err) {
    next(err);
  }
};

export const getAllEnglishServices = async (req, res, next) => {
  try {
    const services = await serviceModel.find()
      .sort({ createdAt: -1 })
      .lean(); // returns plain JS objects

    // Map to English only
    const englishServices = services.map(section => ({
      header: {
        title: section.header.title_en,
        description: section.header.description_en
      },
      services: section.services.map(s => ({
        title: s.title_en,
        category: s.category_en,
        description: s.description_en,
        order: s.order,
        image: s.image
      })),
      isActive: section.isActive,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt
    }));

    return res.status(200).json({
      success: true,
      services: englishServices
    });
  } catch (err) {
    next(err);
  }
};




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
