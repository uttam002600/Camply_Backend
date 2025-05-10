// models/Campaign.js
import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  segment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Segment",
    required: true,
  },
  template: {
    subject: { type: String, required: true },
    body: { type: String, required: true },
    variables: [String], // e.g., ['name', 'total_spent']
  },
  status: {
    type: String,
    enum: ["draft", "scheduled", "processing", "completed", "failed"],
    default: "draft",
  },
  scheduled_at: Date,
  started_at: Date,
  completed_at: Date,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  stats: {
    total_recipients: Number,
    sent: Number,
    failed: Number,
    open_rate: Number,
    click_rate: Number,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: Date,
});

// Middleware to update timestamps
campaignSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  if (this.isModified("status") && this.status === "processing") {
    this.started_at = Date.now();
  }
  if (this.isModified("status") && this.status === "completed") {
    this.completed_at = Date.now();
  }
  next();
});

export const Campaign = mongoose.model("Campaign", campaignSchema);
