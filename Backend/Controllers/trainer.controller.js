// trainerController.js
import User from "../models/user.model.js";
import Class from "../models/class.model.js";
import bcrypt from "bcrypt";

// Endpoint: Sign Up for Trainers
export const signupTrainer = async (req, res) => {
  try {
    const { fullname, email, phone, password, specialization, certifications } =
      req.body;

    // Validation is built into the model, but we'll check required fields here too
    if (!fullname || !email || !phone || !password) {
      return res
        .status(400)
        .json({ error: "Please fill all required fields." });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new trainer
    const newTrainer = new User({
      name: fullname,
      email,
      phone,
      password: hashedPassword,
      userType: "trainer",
      trainerProfile: {
        specialization,
        certifications,
      },
    });

    // Save trainer to database
    await newTrainer.save();

    res.status(201).json({
      success: true,
      id: newTrainer._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all trainers
export const getAllTrainers = async (req, res) => {
  try {
    const trainers = await User.find({
      userType: "trainer",
    }).select("_id name email phone trainerProfile");

    // Get class counts for each trainer
    const trainerData = await Promise.all(
      trainers.map(async (trainer) => {
        const classesTaken = await Class.countDocuments({
          createdBy: trainer._id
        });
        
        return {
          ...trainer.toObject(),
          classesTaken
        };
      })
    );

    res.json(trainerData);
  } catch (error) {
    console.error("Error fetching trainers:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get trainer by ID
export const getTrainerById = async (req, res) => {
  try {
    const trainerId = req.params.id;

    const trainer = await User.findOne({
      _id: trainerId,
      userType: "trainer",
    }).select("_id name email phone trainerProfile");

    if (!trainer) {
      return res.status(404).json({ error: "Trainer not found." });
    }

    // Get class count for the trainer
    const classesTaken = await Class.countDocuments({
      createdBy: trainerId
    });

    const trainerData = {
      ...trainer.toObject(),
      classesTaken
    };

    res.json(trainerData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update trainer profile
export const updateTrainerProfile = async (req, res) => {
  try {
    const trainerId = req.params.id;
    const { specialization, certifications } = req.body;

    const updatedTrainer = await User.findOneAndUpdate(
      { _id: trainerId, userType: "trainer" },
      {
        "trainerProfile.specialization": specialization,
        "trainerProfile.certifications": certifications,
      },
      { new: true }
    );

    if (!updatedTrainer) {
      return res.status(404).json({ error: "Trainer not found." });
    }

    res.json({
      success: true,
      message: "Trainer profile updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search trainers by specialization
export const searchTrainersBySpecialization = async (req, res) => {
  try {
    const specialization = req.params.specialization;

    const trainers = await User.find({
      userType: "trainer",
      "trainerProfile.specialization": {
        $regex: specialization,
        $options: "i",
      },
    }).select("_id name email phone trainerProfile");

    // Get class counts for each trainer
    const trainerData = await Promise.all(
      trainers.map(async (trainer) => {
        const classesTaken = await Class.countDocuments({
          createdBy: trainer._id
        });
        
        return {
          ...trainer.toObject(),
          classesTaken
        };
      })
    );

    res.json(trainerData);
  } catch (error) {
    console.error("Error searching trainers:", error);
    res.status(500).json({ error: error.message });
  }
};