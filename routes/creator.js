import express from "express";
import Project from "../models/Project.js";
import { protect, authorizeRole } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
const router = express.Router();

// Setup storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder in your project
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage });
// Creator submits a new project
// POST /creator/projects
router.post(
  "/projects",
  protect,
  authorizeRole("creator"),
  upload.array("images", 10), 
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        location,
        goalAmount,
        impactUnit,
        impactValue,
      } = req.body;

      if (!title || !description || !category || !location || !goalAmount) {
        return res.status(400).json({
          message:
            "Title, description, location, goal amount, and category are required",
        });
      }

      // Map uploaded files to project.images array
      const images = req.files
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : [];

      const project = new Project({
        title,
        description,
        category,
        location,
        goalAmount,
        impactUnit,
        impactValue,
        images, // store uploaded image paths
        creator: req.user._id,
      });

      const savedProject = await project.save();

      res.status(201).json({
        success: true,
        message: "Project submitted successfully, pending approval",
        project: savedProject,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error while creating project" });
    }
  }
);

router.get("/projects", protect, authorizeRole("creator"), async (req, res) => {
  try {
    const projects = await Project.find({ creator: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, count: projects.length, projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching projects" });
  }
});

router.get(
  "/projects/:id",
  protect,
  authorizeRole("creator"),
  async (req, res) => {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        creator: req.user._id,
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.status(200).json({ success: true, project });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while fetching project" });
    }
  }
);

// PUT /creator/projects/:id
router.put(
  "/projects/:id",
  protect,
  authorizeRole("creator"),
  async (req, res) => {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        creator: req.user._id,
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.status !== "Pending") {
        return res
          .status(400)
          .json({ message: "Cannot edit project after approval/rejection" });
      }

      const updates = req.body;
      Object.assign(project, updates);
      await project.save();

      res.status(200).json({
        success: true,
        message: "Project updated successfully",
        project,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while updating project" });
    }
  }
);

// POST /creator/projects/:id/milestones
router.post(
  "/projects/:id/milestones",
  protect,
  authorizeRole("creator"),
  upload.single("image"), // "image" = field name in form-data
  async (req, res) => {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        creator: req.user._id,
      });
      if (!project)
        return res.status(404).json({ message: "Project not found" });

      const { text } = req.body;
      if (!text)
        return res.status(400).json({ message: "Milestone text required" });

      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

      project.milestones.push({ text, image: imagePath });
      await project.save();

      res
        .status(201)
        .json({ success: true, message: "Milestone added", project });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while adding milestone" });
    }
  }
);

// GET /profile/projects (creator only)
router.get(
  "/profile/projects",
  protect,
  authorizeRole("creator"),
  async (req, res) => {
    try {
      const projects = await Project.find({ creator: req.user._id });
      res.status(200).json({ success: true, count: projects.length, projects });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while fetching projects" });
    }
  }
);

export default router;
