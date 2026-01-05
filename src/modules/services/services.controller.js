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
      header_sub_title_en,
      header_sub_title_ar,
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
      const customId = nanoid()
      const uploadResult = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: `${process.env.PROJECT_FOLDER}/Services/${customId}`,
      });

      uploadedServices.push({
        ...s,
        order: Number(s.order),
        image: {
          imageLink: uploadResult.url,
          public_id: uploadResult.fileId,
        },
        customId: customId
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
          sub_title_en: header_sub_title_en,
          sub_title_ar: header_sub_title_ar,
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

export const getServiceById = async (req, res, next) => {

  console.log(req.params);

  const id = req.params.id;
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




// ~ Update Service Section Header Only
export const updateService = async (req, res, next) => {
  try {
    const id = req.params.id;
    const {
      title_en,
      title_ar,
      sub_title_en,
      sub_title_ar,
      description_en,
      description_ar,
      isActive
    } = req.body;

    // Use dot notation for nested fields update without overwriting the whole object
    const updateData = {};
    if (title_en) updateData["header.title_en"] = title_en;
    if (title_ar) updateData["header.title_ar"] = title_ar;
    if (sub_title_en) updateData["header.sub_title_en"] = sub_title_en;
    if (sub_title_ar) updateData["header.sub_title_ar"] = sub_title_ar;
    if (description_en) updateData["header.description_en"] = description_en;
    if (description_ar) updateData["header.description_ar"] = description_ar;
    if (isActive !== undefined) updateData["isActive"] = isActive;

    const service = await serviceModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!service) {
      return next(new CustomError("Service section not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Service section updated successfully",
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

// ~ Add New Service Item to Section
export const addServiceItem = async (req, res, next) => {
  try {
    const id = req.params.id;
    const {
      title_en,
      title_ar,
      category_en,
      category_ar,
      description_en,
      description_ar,
      order
    } = req.body;

    const serviceSection = await serviceModel.findById(id);
    if (!serviceSection) {
      return next(new CustomError("Service section not found", 404));
    }

    if (!req.file) {
      return next(new CustomError("Image is required for service item", 400));
    }

    // Determine Custom ID for folder (use section's customId if implicit or create one? 
    // Schema doesn't enforce customId on section, but controller creates it.
    // Ideally we re-use if possible, or new nanoid.
    // The previous create logic didn't save customId on the *Section*?? 
    // Ah, it saved it on the Item. Let's look at schema...
    // Schema: services: [ { customId: String ... } ]

    const customId = nanoid();
    const folderPath = `${process.env.PROJECT_FOLDER}/Services/${customId}`;

    const uploadResult = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: folderPath,
    });

    const newItem = {
      title_en,
      title_ar,
      category_en,
      category_ar,
      description_en,
      description_ar,
      order: Number(order) || 0,
      customId: customId,
      image: {
        imageLink: uploadResult.url,
        public_id: uploadResult.fileId,
      }
    };

    serviceSection.services.push(newItem);
    await serviceSection.save();

    return res.status(201).json({
      success: true,
      message: "Service item added successfully",
      data: serviceSection,
    });

  } catch (err) {
    next(err);
  }
};

// ~ Update Service Item
export const updateServiceItem = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    const {
      title_en,
      title_ar,
      category_en,
      category_ar,
      description_en,
      description_ar,
      order
    } = req.body;

    const serviceSection = await serviceModel.findById(id);
    if (!serviceSection) {
      return next(new CustomError("Service section not found", 404));
    }

    const itemIndex = serviceSection.services.findIndex(s => s._id.toString() === itemId);
    if (itemIndex === -1) {
      return next(new CustomError("Service item not found", 404));
    }

    const item = serviceSection.services[itemIndex];

    // Update fields if provided
    if (title_en) item.title_en = title_en;
    if (title_ar) item.title_ar = title_ar;
    if (category_en) item.category_en = category_en;
    if (category_ar) item.category_ar = category_ar;
    if (description_en) item.description_en = description_en;
    if (description_ar) item.description_ar = description_ar;
    if (order !== undefined) item.order = Number(order);

    // Handle Image Update
    if (req.file) {
      // Delete old image
      if (item.image?.public_id) {
        await destroyImage(item.image.public_id);
      }

      const folderId = item.customId || nanoid();
      // Ensure customId exists if old item didn't have it
      item.customId = folderId;

      const uploadResult = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: `${process.env.PROJECT_FOLDER}/Services/${folderId}`,
      });

      item.image = {
        imageLink: uploadResult.url,
        public_id: uploadResult.fileId,
      };
    }

    serviceSection.services[itemIndex] = item;
    // Mongoose array split won't detect deep object change unless marked? 
    // Actually direct indexing assignment in simple array works, but for subdocs it's safer to markModified if weirdness happens.
    // But usually saving parent works.
    await serviceSection.save();

    return res.status(200).json({
      success: true,
      message: "Service item updated successfully",
      data: serviceSection,
    });

  } catch (err) {
    next(err);
  }
};

// ~ Delete Service Item
export const deleteServiceItem = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;

    const serviceSection = await serviceModel.findById(id);
    if (!serviceSection) {
      return next(new CustomError("Service section not found", 404));
    }

    const item = serviceSection.services.find(s => s._id.toString() === itemId);
    if (!item) {
      return next(new CustomError("Service item not found", 404));
    }

    // Remove image from ImageKit
    if (item.image?.public_id) {
      await destroyImage(item.image.public_id);
    }

    // Remove item from array
    serviceSection.services = serviceSection.services.filter(s => s._id.toString() !== itemId);
    await serviceSection.save();

    return res.status(200).json({
      success: true,
      message: "Service item deleted successfully",
      data: serviceSection,
    });

  } catch (err) {
    next(err);
  }
};

// ~ Delete Entire Service Section
export const deleteService = async (req, res, next) => {
  try {
    const id = req.params.id;
    const serviceSection = await serviceModel.findById(id);

    if (!serviceSection) {
      return next(new CustomError("Service section not found", 404));
    }

    // Delete all images for all items
    for (const item of serviceSection.services) {
      if (item.image?.public_id) {
        await destroyImage(item.image.public_id);
      }
    }

    await serviceModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Service section deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const multyDeleteServices = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new CustomError("Please provide an array of IDs to delete", 400));
    }

    const services = await serviceModel.find({ _id: { $in: ids } });
    if (services.length === 0) {
      return next(new CustomError("No services found for the provided IDs", 404));
    }

    for (const service of services) {
      for (const item of service.services) {
        if (item.image?.public_id) {
          await destroyImage(item.image.public_id);
        }
      }
      await serviceModel.findByIdAndDelete(service._id);
    }

    return res.status(200).json({
      success: true,
      message: "Services deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};


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
