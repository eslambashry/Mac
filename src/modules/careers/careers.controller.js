import { careerModel } from "../../DB/models/careerModel.js";

export const createCareer = async (req, res, next) => {
  try {
    const {
      title_en,
      title_ar,

      department_en,
      department_ar,

      location_en,
      location_ar,

      employmentType_en,
      employmentType_ar,

      shortDescription_en,
      shortDescription_ar,

      description_en,
      description_ar,

      responsibilities_en,
      responsibilities_ar,

      requirements_en,
      requirements_ar,

      order,
    } = req.body;

    // 🔴 Required fields validation
    if (
      !title_en ||
      !title_ar ||
      !department_en ||
      !department_ar ||
      !location_en ||
      !location_ar ||
      !employmentType_en ||
      !employmentType_ar
    ) {
      return next(
        new CustomError(
          "title, department, location and employment type (en & ar) are required",
          400
        )
      );
    }

    const career = await careerModel.create({
      title_en,
      title_ar,

      department_en,
      department_ar,

      location_en,
      location_ar,

      employmentType_en,
      employmentType_ar,

      shortDescription_en,
      shortDescription_ar,

      description_en,
      description_ar,

      responsibilities_en,
      responsibilities_ar,

      requirements_en,
      requirements_ar,

      order,
    });

    res.status(201).json({
      success: true,
      message: "Career created successfully",
      data: career,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCareers = async (req, res, next) => {
  try {
    const {
      department,
      location,
      employmentType,
      isActive,
      lang = "en",
    } = req.query;

    const filter = {};

    // 🔤 Language-based filtering
    if (department) {
      filter[lang === "ar" ? "department_ar" : "department_en"] = department;
    }

    if (location) {
      filter[lang === "ar" ? "location_ar" : "location_en"] = location;
    }

    if (employmentType) {
      filter[
        lang === "ar" ? "employmentType_ar" : "employmentType_en"
      ] = employmentType;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const careers = await careerModel
      .find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      lang,
      count: careers.length,
      careers,
    });
  } catch (error) {
    next(error);
  }
};

export const getOneCareer = async (req, res, next) => {
  const id = req.params.id
  const careers = await careerModel.findById(id)
  if (!careers) {
    return next(new CustomError("No Careers Found", 404));
  }
  res.status(201).json({
    success: true,
    message: "Career return successfully",
    careers: careers,
  })
}

export const getAllArabicCareer = async (req, res, next) => {

  const careers = await careerModel.find().select('title_ar department_ar location_ar employmentType_ar shortDescription_ar description_ar responsibilities_ar requirements_ar')
  if (!careers) {
    return next(new CustomError("No Careers Found", 404));
  }
  res.status(201).json({
    success: true,
    message: "Career return successfully",
    careers: careers,
  })
}

export const getAllEnglishCareer = async (req, res, next) => {

  const careers = await careerModel.find().select('title_en department_en location_en employmentType_en shortDescription_en description_en responsibilities_en requirements_en')
  if (!careers) {
    return next(new CustomError("No Careers Found", 404));
  }
  res.status(201).json({
    success: true,
    message: "Career return successfully",
    careers: careers,
  })
}

export const updateCareer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const career = await careerModel.findById(id);
    if (!career) {
      return next(new CustomError("Career not found", 404));
    }

    const {
      title_en,
      title_ar,
      department_en,
      department_ar,
      location_en,
      location_ar,
      employmentType_en,
      employmentType_ar,
      shortDescription_en,
      shortDescription_ar,
      description_en,
      description_ar,
      responsibilities_en,
      responsibilities_ar,
      requirements_en,
      requirements_ar,
      isActive,
      order,
    } = req.body;

    // update only sent fields
    if (title_en !== undefined) career.title_en = title_en;
    if (title_ar !== undefined) career.title_ar = title_ar;

    if (department_en !== undefined) career.department_en = department_en;
    if (department_ar !== undefined) career.department_ar = department_ar;

    if (location_en !== undefined) career.location_en = location_en;
    if (location_ar !== undefined) career.location_ar = location_ar;

    if (employmentType_en !== undefined)
      career.employmentType_en = employmentType_en;
    if (employmentType_ar !== undefined)
      career.employmentType_ar = employmentType_ar;

    if (shortDescription_en !== undefined)
      career.shortDescription_en = shortDescription_en;
    if (shortDescription_ar !== undefined)
      career.shortDescription_ar = shortDescription_ar;

    if (description_en !== undefined)
      career.description_en = description_en;
    if (description_ar !== undefined)
      career.description_ar = description_ar;

    if (responsibilities_en !== undefined)
      career.responsibilities_en = responsibilities_en;
    if (responsibilities_ar !== undefined)
      career.responsibilities_ar = responsibilities_ar;

    if (requirements_en !== undefined)
      career.requirements_en = requirements_en;
    if (requirements_ar !== undefined)
      career.requirements_ar = requirements_ar;

    if (isActive !== undefined) career.isActive = isActive;
    if (order !== undefined) career.order = order;

    await career.save();

    res.status(200).json({
      success: true,
      message: "Career updated successfully",
      data: career,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCareerStatus = async (req, res, next) => {
  try {
    const career = await careerModel.findById(req.params.id);
    if (!career) {
      return next(new CustomError("Career not found", 404));
    }

    career.isActive = !career.isActive;
    await career.save();

    res.status(200).json({
      success: true,
      message: "Career status updated",
      career,
    });
  } catch (error) {
    next(error);
  }
};

// ~ Delete Career
export const deleteCareer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const career = await careerModel.findById(id);

    if (!career) {
      return next(new CustomError("Career not found", 404));
    }

    await careerModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Career deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ~ Bulk Delete Careers
export const bulkDeleteCareers = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new CustomError("Please provide an array of IDs to delete", 400));
    }

    const careers = await careerModel.find({ _id: { $in: ids } });

    if (careers.length === 0) {
      return next(new CustomError("No careers found for the provided IDs", 404));
    }

    for (const career of careers) {
      await careerModel.findByIdAndDelete(career._id);
    }

    res.status(200).json({
      success: true,
      message: `${careers.length} career(s) deleted successfully`,
      deletedCount: careers.length,
    });
  } catch (error) {
    next(error);
  }
};