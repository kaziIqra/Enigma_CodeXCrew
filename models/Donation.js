import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    paymentId: { type: String }, // Razorpay payment_id (or mock)
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
