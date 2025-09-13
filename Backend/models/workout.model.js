import mongoose from "mongoose";

const workoutVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["HIIT", "Strength Training", "Yoga", "Cardio", "Core", "Flexibility"],
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
    },
    featuredImage: {
      type: String, // URL to the thumbnail image
      required: true,
    },
    videoUrl: {
      type: String, // URL to the video file
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    published: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const WorkoutVideo = mongoose.model("WorkoutVideo", workoutVideoSchema);

export default WorkoutVideo; 