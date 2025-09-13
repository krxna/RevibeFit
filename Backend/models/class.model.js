// models/Class.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const classSchema = new Schema(
  {
    // when the class will run
    scheduledAt: {
      type: Date,
      required: true,
    },

    // name/type of class
    classType: {
      type: String,
      required: true,
      trim: true,
    },

    // e.g. “30 minutes”, “45 minutes”
    duration: {
      type: String,
      required: true,
    },

    // Beginner / Intermediate / Advanced
    difficultyLevel: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },

    maxParticipants: {
      type: Number,
      required: true,
      min: 1,
    },

    description: {
      type: String,
      trim: true,
    },

    // users who have enrolled
    enrolledUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // **who created this class (the trainer)**
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Class", classSchema);
