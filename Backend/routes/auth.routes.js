// routes.js
import express from "express";
import * as userController from "../Controllers/user.controller.js";
import * as trainerController from "../Controllers/trainer.controller.js";
import * as labController from "../Controllers/lab.controller.js";

const router = express.Router();

// User routes
router.post("/signup/user", userController.signupUser);
router.post("/signin", userController.signin);
router.get("/users/:id", userController.getUserById);
router.get("/users", userController.getAllUsers);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);
router.get("/me",userController.getme);

// Trainer routes
router.post("/signup/trainer", trainerController.signupTrainer);
router.get("/trainers", trainerController.getAllTrainers);
router.get("/trainers/:id", trainerController.getTrainerById);
router.put("/trainers/:id", trainerController.updateTrainerProfile);
router.get(
  "/trainers/search/:specialization",
  trainerController.searchTrainersBySpecialization
);

// Lab partner routes
router.post("/signup/lab", labController.signupLabPartner);
router.get("/lab-partners", labController.getAllLabPartners);
router.get("/lab-partners/:id", labController.getLabPartnerById);
router.put("/lab-partners/:id", labController.updateLabPartnerProfile);
router.delete("/lab-partners/:id", labController.deleteLabPartner);

export default router;