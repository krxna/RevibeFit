import Blog from "../models/blog.model.js";

// Create a new blog post
export const createBlog = async (req, res) => {
  try {
    console.log("Received blog creation request");
    const { title, content, category, featuredImage } = req.body;

    // Log the received data (excluding the potentially large image)
    console.log("Blog data received:", {
      title,
      category,
      contentLength: content ? content.length : 0,
      hasImage: !!featuredImage,
    });

    if (!req.session.user) {
      console.log("Unauthorized - No user in session");
      return res
        .status(401)
        .json({ message: "Unauthorized. Please login first." });
    }

    console.log("Creating blog for user:", req.session.user._id);

    // Create new blog
    const newBlog = new Blog({
      title,
      content,
      category,
      featuredImage,
      author: req.session.user._id,
      authorName: req.session.user.name || req.session.user.username,
    });

    // Save blog to database
    await newBlog.save();
    console.log("Blog saved successfully with ID:", newBlog._id);

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create blog post",
      error: error.message,
    });
  }
};

// Get all published blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(20); // Limit to 20 blog posts initially

    res.status(200).json({ success: true, blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
      error: error.message,
    });
  }
};

// Get blogs by category
export const getBlogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const blogs = await Blog.find({ category, published: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, blogs });
  } catch (error) {
    console.error("Error fetching blogs by category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs by category",
      error: error.message,
    });
  }
};

// Get blog by ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
};

// Get blogs by trainer (author)
export const getBlogsByTrainer = async (req, res) => {
  try {
    if (!req.session.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please login first." });
    }

    const blogs = await Blog.find({ author: req.session.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, blogs });
  } catch (error) {
    console.error("Error fetching trainer blogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trainer blogs",
      error: error.message,
    });
  }
};

// Update a blog post
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, featuredImage, published } = req.body;

    if (!req.session.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please login first." });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // Check if the user is the author of the blog
    if (blog.author.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own blogs",
      });
    }

    // Update blog
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
    blog.featuredImage = featuredImage || blog.featuredImage;
    blog.published = published !== undefined ? published : blog.published;

    await blog.save();

    res
      .status(200)
      .json({ success: true, message: "Blog updated successfully", blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: error.message,
    });
  }
};

// Delete a blog post
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.session.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please login first." });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // Check if the user is the author of the blog
    if (blog.author.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own blogs",
      });
    }

    await Blog.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: error.message,
    });
  }
};
