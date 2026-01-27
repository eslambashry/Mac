import { careerModel } from "../../DB/models/careerModel.js";
import imagekit from "../../utilities/imagekitConfigration.js";
import { customAlphabet } from 'nanoid'
import { applicationsModel } from "../../DB/models/applicationsModel.js";
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5)

export const applyForCareer = async (req, res, next) => {
  try {
    const { careerId, fullName, email, phone } = req.body;

    // 🔴 Validate fields
    if (!careerId || !fullName || !email || !phone) {
      return next(new CustomError("All fields are required", 400));
    }

    // 🔴 Check career exists & active
    const career = await careerModel.findById(careerId);
    if (!career || !career.isActive) {
      return next(new CustomError("Career not available", 404));
    }

    // 🔴 Validate CV
    if (!req.file) {
      return next(new CustomError("CV file is required", 400));
    }
    const customId = nanoid()
    // 🔹 Upload CV to ImageKit
    const uploadResult = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: `${process.env.PROJECT_FOLDER}/Careers/CVs/${customId}`,
    });

    // 🔹 Create application
    const application = await applicationsModel.create({
      career: careerId,
      fullName,
      email,
      phone,
      cv: {
        fileUrl: uploadResult.url,
        public_id: uploadResult.fileId,
      },
      customId
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
    });

  } catch (error) {
    // duplicate apply
    if (error.code === 11000) {
      return next(
        new CustomError("You already applied for this position", 409)
      );
    }
    return next(error);
  }
};

// General application without specific career
export const applyGeneral = async (req, res, next) => {
  try {
    const { fullName, email, phone } = req.body;

    // 🔴 Validate fields
    if (!fullName || !email || !phone) {
      return next(new CustomError("All fields are required", 400));
    }

    // 🔴 Validate CV
    if (!req.file) {
      return next(new CustomError("CV file is required", 400));
    }

    const customId = nanoid()

    // 🔹 Upload CV to ImageKit
    const uploadResult = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: `${process.env.PROJECT_FOLDER}/Careers/CVs/${customId}`,
    });

    // 🔹 Create application (without career)
    const application = await applicationsModel.create({
      fullName,
      email,
      phone,
      cv: {
        fileUrl: uploadResult.url,
        public_id: uploadResult.fileId,
      },
      customId
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
    });

  } catch (error) {
    return next(error);
  }
};

export const getAllApplications = async (req, res, next) => {
  const applications = await applicationsModel
    .find()
    .populate("career", "title_en title_ar")
    .sort({ createdAt: -1 });
  if (!applications) {
    return next(new CustomError("No applications found"))
  }
  res.status(200).json({
    success: true,
    message: "Applications retrieved successfully",
    count: applications.length,
    applications
  })
}

export const getSingleCareerApplications = async (req, res, next) => {
  const { id: careerId } = req.params
  const applications = await applicationsModel.
    find({ career: careerId }).
    populate("career", "title_en title_ar department_en department_ar location_en location_ar employmentType_en employmentType_ar").
    sort({ createdAt: -1 }); // newest first

  if (applications.length === 0) {
    return next(new CustomError("No applications found for this job", 404));
  }

  res.status(201).json({
    success: true,
    message: "Applications retrive successfully",
    count: applications.length,
    applications
  })
}

export const getSingleApplication = async (req, res, next) => {
  try {
    const application = await applicationsModel
      .findById(req.params.id)
      .populate("career");

    if (!application) {
      return next(new CustomError("Application not found", 404));
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    console.log("updateApplicationStatus request:", { id: req.params.id, body: req.body, status });

    const application = await applicationsModel.findById(req.params.id);
    if (!application) {
      return next(new CustomError("Application not found", 404));
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application status updated",
      application,
    });
  } catch (error) {
    console.error("updateApplicationStatus Error:", error);
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const application = await applicationsModel.findById(req.params.id);
    if (!application) {
      return next(new CustomError("Application not found", 404));
    }

    if (application.cv?.public_id) {
      await imagekit.deleteFile(application.cv.public_id);
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteApplications = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new CustomError("Invalid IDs provided", 400));
    }

    const applications = await applicationsModel.find({ _id: { $in: ids } });

    if (applications.length === 0) {
      return next(new CustomError("No applications found to delete", 404));
    }

    for (const app of applications) {
      if (app.cv?.public_id) {
        await imagekit.deleteFile(app.cv.public_id);
      }
      await app.deleteOne();
    }

    res.status(200).json({
      success: true,
      message: `${applications.length} applications deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
