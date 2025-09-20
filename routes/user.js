import express from "express";
import { authorizeRole, protect } from "../middleware/authMiddleware.js";
import Project from "../models/Project.js";

const router = express.Router();

// GET /user/projects


// POST /user/projects/:id/donate
// router.post(
//   "/projects/:id/donate",
//   protect,
//   authorizeRole("user"),
//   async (req, res) => {
//     try {
//       const { amount } = req.body;
//       if (!amount || amount <= 0)
//         return res.status(400).json({ message: "Invalid donation amount" });

//       const project = await Project.findOne({
//         _id: req.params.id,
//         status: "Approved",
//       });
//       if (!project)
//         return res.status(404).json({ message: "Project not found" });

//       // Create donation record
//       const donation = await Donation.create({
//         donor: req.user._id,
//         project: project._id,
//         amount,
//         paymentId: "mock_payment_id", // replace with real payment integration if needed
//       });

//       // Update project raised amount
//       project.raisedAmount += amount;
//       await project.save();

//       // Add donation reference to user
//       req.user.donations.push(donation._id);
//       await req.user.save();

//       res.status(201).json({
//         success: true,
//         message: `Donated ₹${amount} successfully`,
//         donation,
//         project,
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Server error while donating" });
//     }
//   }
// );

// POST /user/projects/:id/follow
router.post(
  "/projects/:id/follow",
  protect,
  authorizeRole("user"),
  async (req, res) => {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        status: "Approved",
      });
      if (!project)
        return res.status(404).json({ message: "Project not found" });

      // Check if already following
      if (req.user.followedProjects.includes(project._id)) {
        return res
          .status(400)
          .json({ message: "Already following this project" });
      }

      req.user.followedProjects.push(project._id);
      await req.user.save();

      res.status(200).json({
        success: true,
        message: "Project followed successfully",
        project,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while following project" });
    }
  }
);

// GET /user/donations/history
router.get(
  "/donations/history",
  protect,
  authorizeRole("user"),
  async (req, res) => {
    try {
      const donations = await Donation.find({ donor: req.user._id }).populate(
        "project",
        "title category"
      );
      res
        .status(200)
        .json({ success: true, count: donations.length, donations });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Server error while fetching donation history" });
    }
  }
);

export default router;
