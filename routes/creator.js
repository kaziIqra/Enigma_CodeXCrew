import express from "express";
import { authorizeRole, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/projects",
  protect,
  authorizeRole("creator"),
  async (req, res) => {
    const project = req.body;
  }
);

export default router;
