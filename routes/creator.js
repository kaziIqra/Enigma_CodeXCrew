import express from "express";
import { authorizeRole, protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post(
  "/projects",
  protect,
  authorizeRole("creator"),
  async (req, res) => {
    
  }
);

export default router;
