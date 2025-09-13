import mongoose from "mongoose";

const patientReportSchema = new mongoose.Schema(
  {
    patientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    testType: {
      type: String,
      required: true,
      enum: [
        "Health Checkup",
        "Fitness Assessment",
        "Nutrition Panel",
        "Hormone Tests",
      ],
    },
    testDate: {
      type: Date,
      required: true,
    },
    reportPath: {
      type: String,
      required: true, // path on disk or S3 key
    },
    labPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PatientReport", patientReportSchema);
