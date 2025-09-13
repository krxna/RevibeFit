import WorkoutVideo from "../models/workout.model.js";

// Create a new workout video
export const createWorkoutVideo = async (req, res) => {
  try {
    console.log("Received workout video creation request");
    
    // Check if the user is logged in
    if (!req.session || !req.session.user) {
      console.log("Unauthorized - No user in session");
      return res
        .status(401)
        .json({ 
          success: false,
          message: "Unauthorized. Please login first." 
        });
    }

    const { title, category, duration, featuredImage, videoUrl } = req.body;

    // Verify all required fields are present
    if (!title || !category || !duration || !featuredImage || !videoUrl) {
      console.error("Missing required fields:", {
        hasTitle: !!title,
        hasCategory: !!category,
        hasDuration: !!duration,
        hasImage: !!featuredImage,
        hasVideo: !!videoUrl
      });
      
      return res.status(400).json({
        success: false,
        message: "Missing required fields for workout video"
      });
    }

    // Check data sizes for debugging
    const imageSizeInMB = featuredImage ? (featuredImage.length / (1024 * 1024)).toFixed(2) : 0;
    const videoSizeInMB = videoUrl ? (videoUrl.length / (1024 * 1024)).toFixed(2) : 0;
    const totalSizeInMB = (parseFloat(imageSizeInMB) + parseFloat(videoSizeInMB)).toFixed(2);
    
    console.log("Workout data received:", {
      title,
      category,
      duration,
      imageSizeMB: imageSizeInMB,
      videoSizeMB: videoSizeInMB,
      totalSizeMB: totalSizeInMB
    });
    
    // Check if the payload is too large
    if (totalSizeInMB > 50) {
      console.error(`Payload too large: ${totalSizeInMB} MB exceeds 50 MB limit`);
      return res.status(413).json({
        success: false,
        message: "Video file is too large. Please use a smaller file."
      });
    }
    
    console.log("Creating workout video for user:", req.session.user._id);

    // Create new workout video
    const newWorkoutVideo = new WorkoutVideo({
      title,
      category,
      duration,
      featuredImage,
      videoUrl,
      author: req.session.user._id,
      authorName: req.session.user.name || req.session.user.username,
    });

    // Save workout video to database
    await newWorkoutVideo.save();
    console.log("Workout video saved successfully with ID:", newWorkoutVideo._id);

    res.status(201).json({
      success: true,
      message: "Workout video created successfully",
      workoutVideo: {
        _id: newWorkoutVideo._id,
        title: newWorkoutVideo.title,
        category: newWorkoutVideo.category,
        duration: newWorkoutVideo.duration,
        authorName: newWorkoutVideo.authorName,
        createdAt: newWorkoutVideo.createdAt
      }
    });
  } catch (error) {
    console.error("Error creating workout video:", error);
    
    // Check for specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error. Please check your input.",
        error: error.message
      });
    }
    
    // Check for MongoDB connection errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        success: false,
        message: "Database error. Please try again later.",
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to create workout video",
      error: error.message,
    });
  }
};

// Get all published workout videos
export const getAllWorkoutVideos = async (req, res) => {
  try {
    const videos = await WorkoutVideo.find({ published: true })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(20); // Limit to 20 videos initially

    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error("Error fetching workout videos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch workout videos",
      error: error.message,
    });
  }
};

// Get workout videos by category
export const getWorkoutVideosByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const videos = await WorkoutVideo.find({ category, published: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error("Error fetching workout videos by category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch workout videos by category",
      error: error.message,
    });
  }
};

// Get workout video by ID
export const getWorkoutVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await WorkoutVideo.findById(id);

    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Workout video not found" });
    }

    res.status(200).json({ success: true, video });
  } catch (error) {
    console.error("Error fetching workout video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch workout video",
      error: error.message,
    });
  }
};

// Get workout videos by trainer (author)
export const getWorkoutVideosByTrainer = async (req, res) => {
  try {
    if (!req.session.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please login first." });
    }

    const videos = await WorkoutVideo.find({ author: req.session.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error("Error fetching trainer workout videos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trainer workout videos",
      error: error.message,
    });
  }
};

// Update a workout video
export const updateWorkoutVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, duration, featuredImage, videoUrl, published } = req.body;

    if (!req.session.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please login first." });
    }

    const video = await WorkoutVideo.findById(id);

    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Workout video not found" });
    }

    // Check if the user is the author of the workout video
    if (video.author.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own workout videos",
      });
    }

    // Update workout video
    video.title = title || video.title;
    video.category = category || video.category;
    video.duration = duration || video.duration;
    video.featuredImage = featuredImage || video.featuredImage;
    video.videoUrl = videoUrl || video.videoUrl;
    video.published = published !== undefined ? published : video.published;

    await video.save();

    res
      .status(200)
      .json({ success: true, message: "Workout video updated successfully", video });
  } catch (error) {
    console.error("Error updating workout video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update workout video",
      error: error.message,
    });
  }
};

// Delete a workout video
export const deleteWorkoutVideo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.session.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please login first." });
    }

    const video = await WorkoutVideo.findById(id);

    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Workout video not found" });
    }

    // Check if the user is the author of the workout video
    if (video.author.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own workout videos",
      });
    }

    await WorkoutVideo.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Workout video deleted successfully" });
  } catch (error) {
    console.error("Error deleting workout video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete workout video",
      error: error.message,
    });
  }
}; 