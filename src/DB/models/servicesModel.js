import { Schema, model } from "mongoose";

const ReviewSchema = new Schema({
  authorName: String,
  rating: { type: Number, min: 1, max: 5 },
  body: String,
  screenShots: [
    {
      imageLink: String,
      public_id: String
    }
  ],
},{timestamps: true});

const ServiceSchema = new Schema(
  {
    // 🔥 NAME
    name_ar: { type: String, required: true },
    name_en: { type: String, required: true },

    // 🔥 SLUG
    slug: { type: String, required: true, unique: true },

    icon: { type: String },
    color: { type: String },

    features: [{ 
      feature_ar: String, 
      feature_en: String
    }],

    // 🔥 SHORT DESCRIPTION
    shortDescription_ar: { type: String },
    shortDescription_en: { type: String },

    // 🔥 FULL DESCRIPTION
    description_ar: { type: String },
    description_en: { type: String },

    // BASIC SERVICE INFO
    serviceType: String,
    price: Number,
    currency: String,

    // IMAGES
    images: [
      {
        imageLink: { type: String, required: true },
        public_id: { type: String, required: true }
      }
    ],

    // REVIEWS
    reviews: [ReviewSchema],

    // AGGREGATE RATING
    aggregateRating_ratingValue: Number,
    aggregateRating_reviewCount: Number,
    customId: { type: String},
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const serviceModel = model("Service", ServiceSchema);
