import mongoose from "mongoose";

const labTestApplicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    labPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "pending", "approved", "disapproved"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

// allow many applicants per labPartner (no unique index)
labTestApplicationSchema.index({ applicant: 1 });
labTestApplicationSchema.index({ labPartner: 1 });

export default mongoose.model("LabTestApplication", labTestApplicationSchema);
