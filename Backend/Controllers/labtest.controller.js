import LabTestApplication from "../models/labtest.model.js";

/**
 * User applies to a lab: either update an existing OPEN record to PENDING
 * or create a new PENDING application.
 */
export const applyForLabTest = async (req, res) => {
  const applicantId = req.session.user._id;
  const { labPartnerId } = req.body;

  if (!applicantId ) {
    return res.status(401).json({ error: "Unauthorised User" });
  }

  try {
    // if any application already exists for this user↔labPartner pair, reject
    const existing = await LabTestApplication.findOne({
      applicant: applicantId,
      labPartner: labPartnerId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "You have already applied for this lab." });
    }

    // create new pending application
    const app = await LabTestApplication.create({
      applicant: applicantId,
      labPartner: labPartnerId,
      status: "pending",
    });
    return res.status(201).json(app);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * Lab partner approves or disapproves a pending application.
 */
export const changeApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'disapproved'

  if (!["approved", "disapproved"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const app = await LabTestApplication.findById(id);
    if (!app) return res.status(404).json({ error: "Not found" });
    if (app.status !== "pending") {
      return res.status(400).json({ error: "Only pending may be updated" });
    }
    app.status = status;
    await app.save();
    res.json(app);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * 1. For the **user**: get all approved lab-partners they've applied to.
 */
export const getApprovedLabPartners = async (req, res) => {
  const userId = req.session.user._id;
  try {
    const apps = await LabTestApplication.find({
      applicant: userId,
      status: "approved",
    }).populate("labPartner", "name email phone labProfile.lab_name");
    res.json(apps.map((a) => a.labPartner));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * 2. For the **lab-partner**: get all users they've “approved” (i.e. connected users).
 */
export const getConnectedUsers = async (req, res) => {
  const labPartnerId = req.session.user._id;
  try {
    const apps = await LabTestApplication.find({
      labPartner: labPartnerId,
      status: "approved",
    }).populate("applicant", "name email");
    res.json(apps.map((a) => a.applicant));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * 3. For the **lab-partner**: list all **pending** applications.
 */
export const getPendingApplications = async (req, res) => {
  const labPartnerId = req.session.user._id;
  try {
    const apps = await LabTestApplication.find({
      labPartner: labPartnerId,
      status: "pending",
    }).populate("applicant", "name email");
    res.json(apps);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
