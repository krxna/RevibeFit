// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getDashboardStats } from "./controllers/admin.controller.js";
// Import the combined auth routes
import routes from "./routes/auth.routes.js";
// Import blog routes
import blogRoutes from "./routes/blog.routes.js";
import classRoutes from "./routes/class.routes.js";
// Import workout video routes
import workoutRoutes from "./routes/workout.routes.js";
// Import trainer routes
import trainerRoutes from "./routes/trainer.routes.js";
import labtestRoutes from "./routes/labtest.routes.js";
import reportRoutes from "./routes/report.routes.js";
// Mongo connection helper
import Dbconnect from "./util/db.js";
import {
  submitContact,
  getAllQueries,
  markAsRead,
} from "./controllers/contact.controller.js";
import { EventEmitter } from "events";

// Set higher limit for event listeners
EventEmitter.defaultMaxListeners = 15;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

import adminRoutes from "./Routes/admin.routes.js";

// Add admin routes
app.use("/api/admin", adminRoutes);

// __dirname setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(
  cors({
    origin: "http://localhost:3000", // adjust if needed
    credentials: true,
  })
);
// Increase JSON payload limit to handle larger image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "some-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// --- Static & Views ---
app.use(express.static(path.join(__dirname, "..", "Templates Users")));
app.use(express.static(path.join(__dirname, "..", "Templates Trainer")));
app.use(express.static(path.join(__dirname, "..", "Templates Admin")));
app.use(express.static(path.join(__dirname, "..", "Templates LabPartners")));
app.use(express.static(path.join(__dirname, "..", "Assets")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "Templates Users"));

// --- Database ---
Dbconnect(); // connects via mongoose.connect(process.env.MONGO_URI)

// --- Auth Routes ---
app.use("/", routes);
// --- Blog Routes ---
app.use("/api", blogRoutes);
app.use("/api", classRoutes);
// --- Workout Video Routes ---
app.use("/api", workoutRoutes);
// --- Trainer Routes ---
app.use("/api", trainerRoutes);
// --- Lab Test Routes ---
app.use("/", labtestRoutes);
// --- Report Routes ---
app.use("/", reportRoutes);

// Contact routes
app.post("/api/contact/submit", submitContact);
app.get("/api/contact/all", getAllQueries);
app.put("/api/contact/mark-read/:id", markAsRead);

// Add this with your other routes
app.get("/api/admin/dashboard-stats", getDashboardStats);

// --- EJS page routes with simple session check ---
const protect = (req, res, next) => {
  if (!req.session.user) return res.redirect("/userhome");
  next();
};

// Trainer protection middleware
const protectTrainer = (req, res, next) => {
  if (!req.session.user) return res.redirect("/userhome");
  if (req.session.user.userType !== "trainer") return res.redirect("/userhome");
  next();
};

// Root route now renders homepage
app.get("/", (req, res) => {
  res.redirect("/userhome");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ message: "Fitness API running" });
});

// Trainer routes
app.get("/trainer", protectTrainer, (req, res) => {
  res.render("../Templates Trainer/trainer", { user: req.session.user });
});

app.get("/trainer-settings", protectTrainer, (req, res) => {
  res.render("../Templates Trainer/settings", { user: req.session.user });
});

app.get("/upload-content", protectTrainer, (req, res) => {
  res.render("../Templates Trainer/upload_content", { user: req.session.user });
});

app.get("/take-classes", protectTrainer, (req, res) => {
  res.render("../Templates Trainer/take_classes", { user: req.session.user });
});

app.get("/userhome", (req, res) =>
  res.render("homepage", { user: req.session.user })
);
app.get("/blogs_client", (req, res) =>
  res.render("blogs_client_side", { user: req.session.user })
);
app.get("/cares", (req, res) => res.render("care", { user: req.session.user }));
app.get("/class", (req, res) =>
  res.render("classes", { user: req.session.user })
);
app.get("/direct", (req, res) =>
  res.render("directory", { user: req.session.user })
);
app.get("/all-trainers", (req, res) =>
  res.render("all_trainers", { user: req.session.user })
);
app.get("/get", (req, res) =>
  res.render("get_coach", { user: req.session.user })
);
app.get("/nutri", (req, res) =>
  res.render("Nutrition", { user: req.session.user })
);
app.get("/work", (req, res) =>
  res.render("workout", { user: req.session.user })
);
app.get("/selecttrainer", (req, res) =>
  res.render("select-trainer", { user: req.session.user })
);
app.get("/profile", (req, res) =>
  res.render("trainer_profile", { user: req.session.user })
);

// Dynamic trainer profile page using ID
app.get("/trainer-profile/:id", async (req, res) => {
  try {
    res.render("trainer_profile", {
      user: req.session.user,
      trainerId: req.params.id,
    });
  } catch (error) {
    console.error("Error loading trainer profile:", error);
    res.status(500).send("Error loading trainer profile");
  }
});

app.get("/viewcoach", (req, res) =>
  res.render("view_coaches", { user: req.session.user })
);

app.get("/about_us", (req, res) =>
  res.render("about_us", { user: req.session.user })
);
// User profile page route
app.get("/userprofile", protect, (req, res) =>
  res.render("user_profile", { user: req.session.user })
);

// --- Logout ---
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/userhome");
  });
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// --- Promise rejection logging ---
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});
