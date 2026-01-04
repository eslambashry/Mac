import { Schema, model } from "mongoose";

const careerSchema = new Schema(
  {
    // 🔹 Job Basic Info
    title_en: {
      type: String,
      required: true, // HVAC Technician
    },
    title_ar: {
      type: String,
      required: true, // فني تكييف
    },

    department_en: {
      type: String,
      required: true, // Engineering
    },
    department_ar: {
      type: String,
      required: true, // الهندسة
    },

    location_en: {
      type: String,
      required: true, // Riyadh
    },
    location_ar: {
      type: String,
      required: true, // الرياض
    },

    employmentType_en: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Contract"],
      required: true,
    },
    employmentType_ar: {
      type: String,
      enum: ["دوام كامل", "دوام جزئي", "عقد"],
      required: true,
    },

    // 🔹 Card Description
    shortDescription_en: {
      type: String,
    },
    shortDescription_ar: {
      type: String,
    },

    // 🔹 Details Page
    description_en: {
      type: String,
    },
    description_ar: {
      type: String,
    },

    responsibilities_en: {
      type: [String],
    },
    responsibilities_ar: {
      type: [String],
    },

    requirements_en: {
      type: [String],
    },
    requirements_ar: {
      type: [String],
    },

    // 🔹 Status
    isActive: {
      type: Boolean,
      default: true,
    },
    customId:String
  },
  {
    timestamps: true,
  }
);

export const careerModel = model("Career", careerSchema);
