// models/slot.model.js
import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g. "10:00 AM"
    status: { type: String, enum: ["available", "booked"], default: "available" },
  },
  { timestamps: true }
);

export const Slot = mongoose.model("Slot", slotSchema);
