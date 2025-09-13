// userController.js
import User from "../models/user.model.js";
import bcrypt from "bcrypt";

// Endpoint: Sign Up for Fitness Enthusiasts
export const signupUser = async (req, res) => {
  try {
    const { fullname, email, phone, password, goals, level } = req.body;

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

    // Create new user
    const newUser = new User({
      name: fullname,
      email,
      phone,
      password: hashedPassword,
      userType: "fitness_enthusiast",
      fitnessProfile: {
        goals,
        fitness_level: level,
      },
    });

    // Save user to database
    await newUser.save();

    res.status(201).json({
      success: true,
      id: newUser._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Endpoint: Sign In
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please fill in email and password." });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Create user object without password
    const userObject = user.toObject();
    delete userObject.password;

    // Set user session
    req.session.user = userObject;

    // Determine redirect based on user type
    let redirectUrl = "/userhome";
    if (user.userType === "trainer") {
      redirectUrl = "/trainer";
    } else if (user.userType === "lab_partner") {
      redirectUrl = "http://localhost:3001/lab_part.html";
    }
    if (user.userType === "admin") {
      redirectUrl = "http://localhost:3001/admin.html";
    }

    res.json({
      success: true,
      user: userObject,
      redirectUrl: redirectUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile by ID
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("_id name email phone userType");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullname, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name: fullname, phone },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user account
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


  export const getme = async (req, res) => {
    try {

      if(!req.session.user) {
        return res.status(401).json({ error: "Unauthorized. Please login first." });
      }
      const userId = req.session.user._id; // Get user ID from session
      const user = await User.findById(userId).select("-password"); // Exclude password from response

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      res.json(user); // Send user data as response
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };