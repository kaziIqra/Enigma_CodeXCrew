import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import creatorRoutes from "./routes/creator.js";
import moderatorRoutes from "./routes/moderator.js";
import { protect, authorizeRole } from "./middleware/authMiddleware.js";
import User from "./models/User.js";
import Project from "./models/Project.js";
import path from "path";
import cors from "cors";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow frontend (3000) to access backend (5000)

dotenv.config();
const app = express();
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true, // allow cookies / auth headers
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/auth", authRoutes);
app.use("/creator", creatorRoutes);
app.use("/user", userRoutes);
app.use("/moderator", moderatorRoutes);

// GET /profile
app.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("donations")
      .populate("followedProjects", "title category status");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
});

app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find({ status: "Approved" })
      .populate("creator", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: projects.length, projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching projects" });
  }
});

app.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("creator", "name email")
      .populate("milestones");
    if (project.status != "Approved")
      return res.status(404).json({ message: "Project not found" });
    res.status(200).json({ success: true, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching project" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
