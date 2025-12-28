// models/appointment.model.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  date: Date,
  time: String,
  reason: String,
  status: {
    type: String,
    enum: ["pending", "approved", "declined"],
    default: "pending",
  },
});
export const Appointment = mongoose.model("Appointment", appointmentSchema);
