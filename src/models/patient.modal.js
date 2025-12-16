// models/patient.model.js
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  phone: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ["male", "female", "other"], default: "other" },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Patient = mongoose.model("Patient", patientSchema);
