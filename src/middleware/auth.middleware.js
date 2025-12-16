import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { ENV } from "../config/env.js";

// Protect route middleware
export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // must be Bearer <token>
    console.log("Auth header:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET); // check JWT secret

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute:", error);
    res.status(401).json({ message: "Unauthorized - invalid token" });
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!req.user.isAdmin) return res.status(403).json({ message: "Forbidden - admin only" });
  next();
};
