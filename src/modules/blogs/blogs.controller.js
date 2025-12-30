import { BlogsModel } from '../../DB/models/blogsModel.js';
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5)
import CustomError from "../../utilities/customError.js"
import imagekit from '../../utilities/imagekitConfigration.js';

export const createBlog = async (req, res, next) => {
  try {

    const {
      title_ar, title_en,
      content_ar, content_en,
      author_ar, author_en,
      autherJobTitle_ar, autherJobTitle_en,
      category_ar, category_en,readTime
    } = req.body;

    // Validate required fields
    if (
      !title_ar || !title_en ||
      !content_ar || !content_en ||
      !author_ar || !author_en ||
      !autherJobTitle_ar || !autherJobTitle_en ||
      !category_ar || !category_en
    ) {
      return next(new CustomError("All fields are required", 400));
    }

    // Extract uploaded images
    const imageFiles = req.files?.images || [];
    if (imageFiles.length === 0) {
      return next(new CustomError("At least one image is required", 400));
    }

    // Extract author image
    // const authorImage = req.files?.authorImage?.[0] || null;
    // if (!authorImage) {
    //   return next(new CustomError("Author image is required", 400));
    // }

    const customId = nanoid();
    const uploadedImages = [];

    // Upload blog images
    for (const file of imageFiles) {
      const uploadResult = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: `${process.env.PROJECT_FOLDER}/Blogs/${customId}`,
      });

      uploadedImages.push({
        imageLink: uploadResult.url,
        public_id: uploadResult.fileId,
      });
    }

    // Upload author image
    // const uploadAuthorImage = await imagekit.upload({
    //   file: authorImage.buffer,
    //   fileName: authorImage.originalname,
    //   folder: `${process.env.PROJECT_FOLDER}/Blogs/${customId}/Author`,
    // });

    // Save blog to DB
    const newBlog = new BlogsModel({
      title: {
        ar: title_ar,
        en: title_en,
      },
      content: {
        ar: content_ar,
        en: content_en,
      },
      author: {
        ar: author_ar,
        en: author_en,
      },
      autherJobTitle: {
        ar: autherJobTitle_ar,
        en: autherJobTitle_en,
      },
      readTime,
      category: {
        ar: category_ar,
        en: category_en,
      },
      authorImage: {
        imageLink: uploadAuthorImage.url,
        public_id: uploadAuthorImage.fileId,
      },
      customId,
      images: uploadedImages,
    });

    await newBlog.save();

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: newBlog,
    });

  } catch (error) {
    console.error(error);
    return next(error);
  }
};


export const getAllBlogs = async (req, res, next) => {
    const blogs = await BlogsModel.find().sort({ createdAt: -1 });
    return res.status(200).json({
        success: true,
        blogs
    });
}

export const getOneBlogs = async (req, res, next) => {
    const id = req.params.id

    const blog = await BlogsModel.findById(id)
    return res.status(200).json({
        success: true,
        blog
    });
}

export const updateBlog = async (req, res, next) => {

    const { title_ar, title_en, content_ar, content_en } = req.body;
    const id = req.params.id;
    
    const blog = await BlogsModel.findById(id);
    if (!blog) {
        return next(new CustomError("Blog not found", 404));
    }

    if (title_ar) blog.title.ar = title_ar;
    if (title_en) blog.title.en = title_en;
    if (content_ar) blog.content.ar = content_ar;
    if (content_en) blog.content.en = content_en;

    if (req.files && req.files.length > 0) {
        // Delete old images from ImageKit
        for (const img of blog.images) {
            await imagekit.deleteFile(img.public_id);
        }   
        const uploadedImages = [];
        // Upload new images to ImageKit
        for (const file of req.files) {
          const uploadResult = await imagekit.upload({  
            file: file.buffer, 
            fileName: file.originalname,
            folder: `${process.env.PROJECT_FOLDER}/Blogs/${blog.customId}`,
          });
            uploadedImages.push({
            imageLink: uploadResult.url,
            public_id: uploadResult.fileId,
          });
        }
        blog.images = uploadedImages;
    }
    await blog.save();

    return res.status(200).json({
        success: true,
        message: "Blog updated successfully",
        blog
    });
}

export const deleteBlog = async (req, res, next) => {
    const id = req.params.id;
    const blog = await BlogsModel.findById(id);
    if (!blog) {
        return next(new CustomError("Blog not found", 404));
    }   
    // Delete images from ImageKit
    for (const img of blog.image) {
        await imagekit.deleteFile(img.public_id);
    }   
    await BlogsModel.findByIdAndDelete(id);

    return res.status(200).json({
        success: true,
        message: "Blog deleted successfully"
    });
}

export const multyDeleteblogs = async (req, res, next) => {
  const { ids } = req.body; // Expecting an array of IDs in the request body
  
  if (!Array.isArray(ids) || ids.length === 0) {
    return next(new CustomError("Please provide an array of IDs to delete", 400));
  }
  const Blogs = await BlogsModel.find({ _id: { $in: ids } });
  
  if (Blogs.length === 0) {
    return next(new CustomError("No Blogs found for the provided IDs", 404));
  }
  
  for (const blog of Blogs) {
    blog.images.forEach(async (image) => {
      await destroyImage(image.public_id);
    });
    await BlogsModel.findByIdAndDelete(blog._id);
  }
  return res.status(200).json({
    success: true,
    message: "Blogs deleted successfully",
  });
}