import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogsByCategory,
  getBlogById,
  getBlogsByTrainer,
  updateBlog,
  deleteBlog,
} from "../Controllers/blog.controller.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Blog API is running" });
});

// Create a new blog post
router.post("/blogs", createBlog);

// Get all published blogs
router.get("/blogs", getAllBlogs);

// Get blogs by category
router.get("/blogs/category/:category", getBlogsByCategory);

// Get blog by ID
router.get("/blogs/:id", getBlogById);

// Get blogs by trainer (author)
router.get("/trainer/blogs", getBlogsByTrainer);

// Update a blog post
router.put("/blogs/:id", updateBlog);

// Delete a blog post
router.delete("/blogs/:id", deleteBlog);

export default router;
