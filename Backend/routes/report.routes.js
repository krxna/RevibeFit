import express from "express";
import multer from "multer";
import {
  uploadPatientReport,
  getReportsByPatient,
  getReportsByLabPartner,
} from "../Controllers/report.controller.js";

const router = express.Router();

// configure multer to accept only PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // ensure this folder exists or create at startup
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// POST   /reports/upload      ← requires multipart/form-data with fields: patientEmail, testType, testDate, report
router.post("/upload", upload.single("report"), uploadPatientReport);

// GET    /reports/patient     ← reports for the logged-in patient
router.get("/patient", getReportsByPatient);

// GET    /reports/lab         ← reports uploaded by the logged-in lab partner
router.get("/lab", getReportsByLabPartner);

export default router;
