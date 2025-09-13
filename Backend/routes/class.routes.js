// routes/class.routes.js
import express from "express";
import {
  createClass,
  updateClass,
  deleteClass,
  getAllClasses,
  getClassesByCreator,
  getClassesByEnrolled,
  enrollInClass,
  getClassParticipants,
} from "../Controllers/class.controller.js";

const router = express.Router();

// Create / Update / Delete (from before)
router.post("/classes", createClass);
router.put("/classes/:id", updateClass);
router.delete("/classes/:id", deleteClass);

// --- New GET routes ---

// 1) Get **all** classes
router.get("/classes", getAllClasses);

// 2) Get classes **created** by the authenticated user
router.get("/classes/created", getClassesByCreator);

// 3) Get classes the authenticated user has **enrolled** in
router.get("/classes/enrolled", getClassesByEnrolled);
router.post("/classes/:id/enroll", enrollInClass);
router.get("/classes/:id/participants", getClassParticipants);

export default router;
