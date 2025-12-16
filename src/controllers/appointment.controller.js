// controllers/appointment.controller.js
import { Appointment } from "../models/appointment.model.js";

// Book appointment
export const bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, reason } = req.body;

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ status: 400, message: "Missing required fields" });
    }

    const newAppointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      reason,
    });

    res.status(201).json({ status: 201, message: "Appointment booked", appointment: newAppointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ status: 500, message: "Server error while booking appointment" });
  }
};

// Get all appointments (optionally filter by doctor or patient)
export const getAppointments = async (req, res) => {
  try {
    const { doctorId, patientId } = req.query;

    const filter = {};
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name phone cnic");

    res.status(200).json({ status: 200, message: "Appointments fetched", appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ status: 500, message: "Server error while fetching appointments" });
  }
};

// Approve appointment
export const approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ status: 404, message: "Appointment not found" });

    res.status(200).json({ status: 200, message: "Appointment approved", appointment });
  } catch (error) {
    console.error("Error approving appointment:", error);
    res.status(500).json({ status: 500, message: "Server error while approving appointment" });
  }
};

// Decline appointment
export const declineAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "declined" },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ status: 404, message: "Appointment not found" });

    res.status(200).json({ status: 200, message: "Appointment declined", appointment });
  } catch (error) {
    console.error("Error declining appointment:", error);
    res.status(500).json({ status: 500, message: "Server error while declining appointment" });
  }
};
