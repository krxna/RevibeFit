// trainer.routes.js
import express from "express";
import {
  getAllTrainers,
  getTrainerById,
  searchTrainersBySpecialization,
} from "../Controllers/trainer.controller.js";

const router = express.Router();

// Get all trainers for directory
router.get("/trainers", getAllTrainers);

// Get trainer by ID
router.get("/trainers/:id", getTrainerById);

// Search trainers by specialization
router.get("/trainers/search/:specialization", searchTrainersBySpecialization);

export default router;
