// controllers/class.controller.js

import Class from "../models/class.model.js";

/**
 * CREATE a new class
 * POST /classes
 */
export const createClass = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const {
      scheduledAt,
      classType,
      duration,
      difficultyLevel,
      maxParticipants,
      description,
    } = req.body;
    const newClass = await Class.create({
      scheduledAt,
      classType,
      duration,
      difficultyLevel,
      maxParticipants,
      description,
      createdBy: userId,
    });
    return res.status(201).json(newClass);
  } catch (err) {
    console.error("createClass error:", err);
    return res.status(500).json({ message: "Failed to create class" });
  }
};

/**
 * GET all classes
 * GET /classes
 */
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("createdBy", "name")
      .populate("enrolledUsers", "name");
    return res.status(200).json(classes);
  } catch (err) {
    console.error("getAllClasses error:", err);
    return res.status(500).json({ message: "Failed to fetch classes" });
  }
};

/**
 * GET classes created by the authenticated user
 * GET /classes/created
 */
export const getClassesByCreator = async (req, res) => {
  try {
    const classes = await Class.find({ createdBy: req.session.user._id })
      .populate("enrolledUsers", "name")
      .sort({ scheduledAt: 1 });
    return res.status(200).json(classes);
  } catch (err) {
    console.error("getClassesByCreator error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch your created classes" });
  }
};

/**
 * GET classes the authenticated user is enrolled in
 * GET /classes/enrolled
 */
export const getClassesByEnrolled = async (req, res) => {
  try {
    const classes = await Class.find({ enrolledUsers: req.session.user._id })
      .populate("createdBy", "name")
      .sort({ scheduledAt: 1 });
    return res.status(200).json(classes);
  } catch (err) {
    console.error("getClassesByEnrolled error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch your enrolled classes" });
  }
};

/**
 * UPDATE an existing class
 * PUT /classes/:id
 */
export const updateClass = async (req, res) => {
  try {
    const updated = await Class.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Class not found" });
    }
    return res.status(200).json(updated);
  } catch (err) {
    console.error("updateClass error:", err);
    return res.status(500).json({ message: "Failed to update class" });
  }
};

/**
 * DELETE a class
 * DELETE /classes/:id
 */
export const deleteClass = async (req, res) => {
  try {
    const deleted = await Class.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Class not found" });
    }
    return res.status(200).json({ message: "Class deleted successfully" });
  } catch (err) {
    console.error("deleteClass error:", err);
    return res.status(500).json({ message: "Failed to delete class" });
  }
};

export const enrollInClass = async (req, res) => {
  try {
    // 1) Ensure the user is logged in via session
    if (!req.session.user || !req.session.user._id) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const userId = req.session.user._id;

    // 2) Add them to the enrolledUsers array (no duplicates)
    const existingClass = await Class.findById(req.params.id);

    if (!existingClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (existingClass.enrolledUsers.includes(userId)) {
      return res
        .status(200)
        .json({ message: "You have already enrolled in this class" });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { enrolledUsers: userId } },
      { new: true }
    )
      .populate("createdBy", "name")
      .populate("enrolledUsers", "name");

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // 3) Return the updated class
    return res.status(200).json(updatedClass);
  } catch (err) {
    console.error("enrollInClass error:", err);
    return res.status(500).json({ message: "Failed to enroll in class" });
  }
};

/**
 * GET all participants of a specific class
 * GET /classes/:id/participants
 */
export const getClassParticipants = async (req, res) => {
  try {
    // 1) Fetch the class by ID and populate enrolledUsers
    const cls = await Class.findById(req.params.id).populate(
      "enrolledUsers",
      "name email"
    ); // choose whatever user fields you want

    // 2) Not found?
    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    // 3) Return the array of participants
    return res.status(200).json(cls.enrolledUsers);
  } catch (err) {
    console.error("getClassParticipants error:", err);
    return res.status(500).json({ message: "Failed to load participants" });
  }
};
