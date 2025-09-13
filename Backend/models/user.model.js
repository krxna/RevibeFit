// user.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

// Base user schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    userType: {
      type: String,
      required: true,
      enum: ["fitness_enthusiast", "trainer", "lab_partner"],
    },
    // Fitness enthusiast specific fields
    fitnessProfile: {
      goals: String,
      fitness_level: String,
    },
    // Trainer specific fields
    trainerProfile: {
      specialization: String,
      certifications: String,
    },
    // Lab partner specific fields
    labProfile: {
      lab_name: String,
      lab_address: String,
      license_number: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compile model from schema
const User = mongoose.model("User", userSchema);

export default User;