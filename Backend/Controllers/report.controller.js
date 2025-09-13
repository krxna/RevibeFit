import PatientReport from "../models/report.model.js";

// POST /reports/upload
export const uploadPatientReport = async (req, res) => {
  try {
    // multer placed file info on req.file
    if (!req.file) {
      return res.status(400).json({ error: "PDF report is required." });
    }

    const { patientEmail, testType, testDate } = req.body;
    if (!patientEmail || !testType || !testDate) {
      return res
        .status(400)
        .json({ error: "patientEmail, testType & testDate required." });
    }

    const app = await PatientReport.create({
      patientEmail: patientEmail.toLowerCase().trim(),
      testType,
      testDate: new Date(testDate), // expect YYYY-MM-DD or similar
      reportPath: req.file.path, // or key if storing elsewhere
      labPartner: req.session.user._id,
    });

    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /reports/patient
export const getReportsByPatient = async (req, res) => {
  try {
    const email = req.session.user.email.toLowerCase().trim();
    const reports = await PatientReport.find({ patientEmail: email })
      .select("-__v")
      .sort("-createdAt");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /reports/lab
export const getReportsByLabPartner = async (req, res) => {
  try {
    const labId = req.session.user._id;
    const reports = await PatientReport.find({ labPartner: labId })
      .populate("labPartner", "name labProfile.lab_name")
      .select("-__v")
      .sort("-createdAt");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
