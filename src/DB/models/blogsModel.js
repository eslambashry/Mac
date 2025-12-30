import { Schema, model } from "mongoose";

const blogsSchema = new Schema(
  {
    title_ar: { type: String, required: true },
    title_en: { type: String, required: true },

    content_ar: { type: String, required: true },
    content_en: { type: String, required: true },

    author_ar: { type: String, required: true },
    author_en: { type: String, required: true },

    authorJobTitle_ar: { type: String, required: true },
    authorJobTitle_en: { type: String, required: true },

    category_ar: { type: String, required: true },
    category_en: { type: String, required: true },

    authorImage: {
      imageLink: { type: String, required: true },
      public_id: { type: String, required: true },
    },

    readTime: { type: Number, required: true },

    images: [
      {
        imageLink: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],

    customId: { type: String, required: true },
  },
  { timestamps: true }
);

export const BlogsModel = model("Blogs", blogsSchema);
