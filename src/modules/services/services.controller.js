import slugify from "slugify";
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5)
import { serviceModel } from "../../DB/models/servicesModel.js";
import CustomError from "../../utilities/customError.js";
import imagekit, { destroyImage } from "../../utilities/imagekitConfigration.js";

export const createService = async (req, res, next) => {
  try {
    const {
      title_en,
      title_ar,
      sub_title_en,
      sub_title_ar,
      description_en,
      description_ar,
      isActive,
      services // array of service items (optional now)
    } = req.body;

    // 🔴 Validate header
    if (
      !title_en ||
      !title_ar ||
      !sub_title_en ||
      !sub_title_ar ||
      !description_en ||
      !description_ar
    ) {
      return next(new CustomError("Service section header is required (all fields)", 400));
    }

    // � Prepare service items if any
    const uploadedServices = [];
    if (services && Array.isArray(services) && services.length > 0) {
      // Filter out mainImage from files to avoid index confusion if mixed
      // Assuming service images are unnamed or named sequentially? 
      // The original code used req.files[i]. 
      // We'll filter out 'mainImage' first.
      const serviceFiles = req.files ? req.files.filter(f => f.fieldname !== 'mainImage') : [];

      // 🔴 Check for duplicate orders in the payload itself
      const orderCounts = {};
      for (const s of services) {
        if (s.order < 1) {
          return next(new CustomError(`Order must be at least 1. Invalid order for service: ${s.title_en || 'Unknown'}`, 400));
        }
        if (orderCounts[s.order]) {
          return next(new CustomError(`Duplicate order number ${s.order} in the request payload`, 400));
        }
        orderCounts[s.order] = true;
      }

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
        const file = serviceFiles[i];
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
    }

    // 🔹 Handle Header Image
    let headerImage = {};
    if (req.files && req.files.length > 0) {
      const mainImageFile = req.files.find(f => f.fieldname === 'mainImage');
      if (mainImageFile) {
        const customId = nanoid();
        const uploadResult = await imagekit.upload({
          file: mainImageFile.buffer,
          fileName: mainImageFile.originalname,
          folder: `${process.env.PROJECT_FOLDER}/Services/Headers`,
        });
        headerImage = {
          imageLink: uploadResult.url,
          public_id: uploadResult.fileId
        };
      }
    }

    // 🔹 Check if section exists
    let serviceSection = await serviceModel.findOne({ "header.title_en": title_en });

    if (serviceSection) {
      // Update header info if it exists? Or just append services?
      // Original logic just appended services. 
      // But if we are "Creating" and passing header info, we probably want to ensure it's set?
      // For now, let's stick to original behavior of appending services, 
      // BUT we should probably return an error if we try to create a duplicate header title without services.
      // However, to be safe and flexible:
      if (uploadedServices.length > 0) {
        // Check for conflicts with existing services
        const existingOrders = new Set(serviceSection.services.map(s => s.order));
        for (const newService of uploadedServices) {
          if (existingOrders.has(newService.order)) {
            return next(new CustomError(`Order number ${newService.order} is already taken by an existing service in this section`, 400));
          }
        }
        serviceSection.services.push(...uploadedServices);
        await serviceSection.save();
      } else {
        return next(new CustomError("Service section with this title already exists", 400));
      }
    } else {
      serviceSection = await serviceModel.create({
        header: {
          title_en,
          title_ar,
          sub_title_en,
          sub_title_ar,
          description_en,
          description_ar,
          image: headerImage
        },
        services: uploadedServices,
        isActive: isActive !== undefined ? isActive : true
      });
    }

    return res.status(201).json({
      success: true,
      message: "Services created/updated successfully",
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

    const service = await serviceModel.findById(id);
    if (!service) {
      return next(new CustomError("Service section not found", 404));
    }

    // Use dot notation for nested fields update
    const updateData = {};
    if (title_en) updateData["header.title_en"] = title_en;
    if (title_ar) updateData["header.title_ar"] = title_ar;
    if (sub_title_en) updateData["header.sub_title_en"] = sub_title_en;
    if (sub_title_ar) updateData["header.sub_title_ar"] = sub_title_ar;
    if (description_en) updateData["header.description_en"] = description_en;
    if (description_ar) updateData["header.description_ar"] = description_ar;
    if (isActive !== undefined) updateData["isActive"] = isActive;

    // Handle Main Image Upload
    if (req.files && req.files.length > 0) {
      const mainImageFile = req.files.find(f => f.fieldname === 'mainImage');
      if (mainImageFile) {
        // Delete old image if exists
        if (service.header.image?.public_id) {
          await destroyImage(service.header.image.public_id);
        }

        // We need a customId for folder structure. Service sections don't explicitly have one in schema root? 
        // Wait, items have customId. Section might not. Let's create one or reuse if we can find a pattern.
        // Or store in 'Services/HeaderImages' etc.
        // Let's check if we can get a customId from the service or generated.
        // The previous create logic didn't save customId.
        // Let's use a generic folder or create a customId on the fly if we want to organize.
        // For now, let's use `Services/Headers/${id}` to enable cleanup.
        const customId = nanoid(); // Just a random suffix for folder if needed.

        const uploadResult = await imagekit.upload({
          file: mainImageFile.buffer,
          fileName: mainImageFile.originalname,
          folder: `${process.env.PROJECT_FOLDER}/Services/Headers`,
        });

        updateData["header.image"] = {
          imageLink: uploadResult.url,
          public_id: uploadResult.fileId,
        };
      }
    }

    const updatedService = await serviceModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Service section updated successfully",
      data: updatedService,
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

    const checkOrder = Number(order);
    if (checkOrder < 1) {
      return next(new CustomError("Order must be at least 1", 400));
    }

    // Check if order exists
    const existingOrder = serviceSection.services.find(s => s.order === checkOrder);
    if (existingOrder) {
      return next(new CustomError(`Order number ${order} is already taken by another service in this section`, 400));
    }

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

    const itemIndex = serviceSection.services.findIndex(s => s._id && s._id.toString() === itemId);
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
    if (order !== undefined) {
      const newOrder = Number(order);
      if (newOrder < 1) {
        return next(new CustomError("Order must be at least 1", 400));
      }
      // Check if another item has this order
      const conflict = serviceSection.services.find(s => s.order === newOrder && s._id.toString() !== itemId);
      if (conflict) {
        return next(new CustomError(`Order number ${newOrder} is already taken by another service in this section`, 400));
      }
      item.order = newOrder;
    }

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

    const item = serviceSection.services.find(s => s._id && s._id.toString() === itemId);
    if (!item) {
      return next(new CustomError("Service item not found", 404));
    }

    // Remove image from ImageKit
    if (item.image?.public_id) {
      await destroyImage(item.image.public_id);
    }

    // Remove item from array
    serviceSection.services = serviceSection.services.filter(s => s._id && s._id.toString() !== itemId);
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

    // Delete Header Image
    if (serviceSection.header?.image?.public_id) {
      await destroyImage(serviceSection.header.image.public_id);
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
