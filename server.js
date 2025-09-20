import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import creatorRoutes from "./routes/creator.js";
import moderatorRoutes from "./routes/moderator.js";
import { protect, authorizeRole } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/auth", authRoutes);
app.use("/creator", creatorRoutes);
app.use("/user", userRoutes);
app.use("/moderator", moderatorRoutes);

app.get("/", protect, authorizeRole("user"), (req, res) => {
  res.send("Hello");
});

app.listen(5000, () => console.log("Server running on port 5000"));
