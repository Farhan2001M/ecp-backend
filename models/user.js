import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Store users in a separate "users" collection
const User = mongoose.model("Admin", UserSchema, "admins");

export default User;
