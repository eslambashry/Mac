import {Schema,model} from "mongoose";

const serviceItemSchema = new Schema(
  {
    title_en: String,
    title_ar: String,

    category_en: String,
    category_ar: String,

    description_en: String,
    description_ar: String,

    image: {
      imageLink: String,
      public_id: String,
    },

    order: Number,
  },
  { _id: false }
);

const serviceSectionSchema = new Schema(
  {
    // 🔹 Section Header (Hard Services)
    header: {
      title_en: {
        type: String,
        required: true,
      },
      title_ar: {
        type: String,
        required: true,
      },
      description_en: {
        type: String,
        required: true,
      },
      description_ar: {
        type: String,
        required: true,
      }
    },

    services: [serviceItemSchema],

    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

export const serviceModel = model(
  "ServiceSection",
  serviceSectionSchema
);
