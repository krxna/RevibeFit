import express from "express";
import {
  applyForLabTest,
  changeApplicationStatus,
  getApprovedLabPartners,
  getConnectedUsers,
  getPendingApplications,
} from "../Controllers/labtest.controller.js";

const router = express.Router();

router.post("/apply", applyForLabTest);
router.patch("/:id/status", changeApplicationStatus);

router.get("/my-labs", getApprovedLabPartners);
router.get("/connected-users", getConnectedUsers);
router.get("/pending", getPendingApplications);

export default router;
