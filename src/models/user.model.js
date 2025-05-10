// models/User.js
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: String,
  role: {
    type: String,
    enum: ["admin", "marketer", "analyst"],
    default: "marketer",
  },
  last_login: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: Date,
});

userSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

export const User = mongoose.model("User", userSchema);
