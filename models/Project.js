import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Education", "Environment", "Health", "Crisis", "Other"],
      required: true,
    },
    goalAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isVerified: { type: Boolean, default: false },
    impactUnit: { type: String }, // e.g. "tree", "meal"
    impactValue: { type: Number }, // e.g. 100 = 1 tree
    milestones: [
      {
        text: String,
        image: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
