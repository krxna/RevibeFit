import express from "express";
import {
  createWorkoutVideo,
  getAllWorkoutVideos,
  getWorkoutVideosByCategory,
  getWorkoutVideoById,
  getWorkoutVideosByTrainer,
  updateWorkoutVideo,
  deleteWorkoutVideo,
} from "../Controllers/workout.controller.js";

const router = express.Router();

// API health check route
router.get("/workout/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Workout Video API is running" });
});

// Create a new workout video
router.post("/workouts", createWorkoutVideo);

// Get all published workout videos
router.get("/workouts", getAllWorkoutVideos);

// Get workout videos by category
router.get("/workouts/category/:category", getWorkoutVideosByCategory);

// Get workout video by ID
router.get("/workouts/:id", getWorkoutVideoById);

// Get workout videos by trainer (author)
router.get("/trainer/workouts", getWorkoutVideosByTrainer);

// Update a workout video
router.put("/workouts/:id", updateWorkoutVideo);

// Delete a workout video
router.delete("/workouts/:id", deleteWorkoutVideo);

export default router; 