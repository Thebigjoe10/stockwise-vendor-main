"use server";

import { connectToDatabase } from "@/lib/database/connect";
import Category from "@/lib/database/models/category.model";
import slugify from "slugify";
import cloudinary from "cloudinary";
import { base64ToBuffer } from "@/utils";

// Configure cloudinary once
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Create a category for vendor
export const createCategory = async (name: string, images: string[]) => {
  try {
    await connectToDatabase();

    // Check if category exists
    const test = await Category.findOne({ name });
    if (test) {
      return {
        message: "Category already exists, try a different name.",
        success: false,
        categories: [],
      };
    }

    // Upload images using Cloudinary SDK
    const uploadImagestoCloudinary = images.map(async (base64Image: string) => {
      const buffer = base64ToBuffer(base64Image);

      return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
          { upload_preset: "website" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer); // send the buffer to Cloudinary
      });
    });

    const cloudinaryImages: any = await Promise.all(uploadImagestoCloudinary);

    const imageUrls = cloudinaryImages.map((img: any) => ({
      url: img.secure_url,
      public_id: img.public_id,
    }));

    await new Category({
      name,
      slug: slugify(name),
      images: imageUrls,
    }).save();

    const categories = await Category.find().sort({ updatedAt: -1 });

    return {
      success: true,
      message: `Category ${name} has been successfully created.`,
      categories: JSON.parse(JSON.stringify(categories)),
    };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: "Error creating category." };
  }
};

// Delete category
export const deleteCategory = async (id: string) => {
  try {
    await connectToDatabase();

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return {
        message: "Category not found with this ID!",
        success: false,
      };
    }

    // Use correct field (public_id)
    const imagePublicIds = category.images.map(
      (image: any) => image.public_id
    );

    const deleteImagePromises = imagePublicIds.map((publicId: string) =>
      cloudinary.v2.uploader.destroy(publicId)
    );

    await Promise.all(deleteImagePromises);

    const categories = await Category.find().sort({ updatedAt: -1 });
    return {
      success: true,
      message:
        "Successfully deleted Category and its associated images in Cloudinary.",
      categories: JSON.parse(JSON.stringify(categories)),
    };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: "Error deleting category." };
  }
};

// Update category
export const updateCategory = async (id: string, name: string) => {
  try {
    await connectToDatabase();

    const category = await Category.findByIdAndUpdate(id, {
      name,
      slug: slugify(name),
    });

    if (!category) {
      return {
        message: "Category not found with this Id!",
        success: false,
      };
    }

    const categories = await Category.find().sort({ updatedAt: -1 });
    return {
      message: "Successfully updated category!",
      success: true,
      categories: JSON.parse(JSON.stringify(categories)),
    };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: "Error updating category." };
  }
};

// Get all categories
export const getAllCategories = async () => {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ updatedAt: -1 });
    return JSON.parse(JSON.stringify(categories));
  } catch (error: any) {
    console.error(error);
    return [];
  }
};
