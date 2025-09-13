// labController.js
import User from "../models/user.model.js";
import bcrypt from "bcrypt";

// Endpoint: Sign Up for Lab Partners
export const signupLabPartner = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      password,
      labName,
      labAddress,
      licenseNumber,
    } = req.body;

    // Validation is built into the model, but we'll check required fields here too
    if (
      !fullname ||
      !email ||
      !phone ||
      !password ||
      !labName ||
      !labAddress ||
      !licenseNumber
    ) {
      return res
        .status(400)
        .json({ error: "Please fill all required fields." });
    }

    // License number validation
    if (licenseNumber.length < 5) {
      return res.status(400).json({ error: "License number is too short." });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new lab partner
    const newLabPartner = new User({
      name: fullname,
      email,
      phone,
      password: hashedPassword,
      userType: "lab_partner",
      labProfile: {
        lab_name: labName,
        lab_address: labAddress,
        license_number: licenseNumber,
      },
    });

    // Save lab partner to database
    await newLabPartner.save();

    res.status(201).json({
      success: true,
      id: newLabPartner._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all lab partners
export const getAllLabPartners = async (req, res) => {
  try {
    const labPartners = await User.find({
      userType: "lab_partner",
    }).select("_id name email phone labProfile");

    res.json(labPartners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get lab partner by ID
export const getLabPartnerById = async (req, res) => {
  try {
    const labPartnerId = req.params.id;

    const labPartner = await User.findOne({
      _id: labPartnerId,
      userType: "lab_partner",
    }).select("_id name email phone labProfile");

    if (!labPartner) {
      return res.status(404).json({ error: "Lab partner not found." });
    }

    res.json(labPartner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update lab partner profile
export const updateLabPartnerProfile = async (req, res) => {
  try {
    const labPartnerId = req.params.id;
    const { fullname, phone, labName, labAddress, licenseNumber } = req.body;

    const updatedLabPartner = await User.findOneAndUpdate(
      { _id: labPartnerId, userType: "lab_partner" },
      {
        name: fullname,
        phone,
        "labProfile.lab_name": labName,
        "labProfile.lab_address": labAddress,
        "labProfile.license_number": licenseNumber,
      },
      { new: true }
    );

    if (!updatedLabPartner) {
      return res.status(404).json({ error: "Lab partner not found." });
    }

    res.json({
      success: true,
      message: "Lab partner profile updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete lab partner account
export const deleteLabPartner = async (req, res) => {
  try {
    const labPartnerId = req.params.id;

    const deletedLabPartner = await User.findOneAndDelete({
      _id: labPartnerId,
      userType: "lab_partner",
    });

    if (!deletedLabPartner) {
      return res.status(404).json({ error: "Lab partner not found." });
    }

    res.json({
      success: true,
      message: "Lab partner account deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};