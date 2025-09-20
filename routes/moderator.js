import express from "express";
import { authorizeRole, protect } from "../middleware/authMiddleware.js";
import Project from "../models/Project.js";

const router = express.Router();

router.get(
  "/projects/:action",
  protect,
  authorizeRole("moderator"),
  async (req, res) => {
    try {
      const action = req.params.action.toLowerCase();
      const validStatuses = ["pending", "blacklisted", "rejected", "approved"];

      if (!validStatuses.includes(action)) {
        return res.status(400).json({ message: "Invalid action parameter" });
      }

      const projects = await Project.find({
        status: action.charAt(0).toUpperCase() + action.slice(1),
      });

      if (!projects || projects.length === 0) {
        return res.status(404).json({ message: `No ${action} projects found` });
      }

      res.status(200).json({
        success: true,
        status: action,
        count: projects.length,
        projects,
      });
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .json({ message: "Server error while fetching projects" });
    }
  }
);

router.put(
  "/projects/:id/:todo",
  protect,
  authorizeRole("moderator"),
  async (req, res) => {
    try {
      let project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(400).json({ message: "Project not found" });
      }
      switch (req.params.todo.toLowerCase()) {
        case "approve":
          project.status = "Approved";
          break;
        case "reject":
          project.status = "Rejected";
          break;
        case "blacklist":
          project.status = "Blacklisted";
          break;
        default:
          return res.status(400).json({ message: "Invalid action parameter" });
      }
      await project.save();

      return res.status(200).json({
        success: true,
        message: `Project ${project.status.toLowerCase()} successfully`,
        project,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error while approving project" });
    }
  }
);



export default router;
