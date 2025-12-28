// controllers/appointment.controller.js
import { Appointment } from "../models/appointment.model.js";
import { Slot } from "../models/slots.model.js";
// Book appointment
export const bookAppointment = async (req, res) => {
  try {
    const { slotId, patientId, reason } = req.body;

    if (!slotId || !patientId) {
      return res.status(400).json({ message: "slotId and patientId are required" });
    }

    // 1. Find slot
    const slot = await Slot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // 2. Check availability
    if (slot.status === "booked") {
      return res.status(400).json({ message: "Slot already booked" });
    }

    // 3. Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId: slot.doctorId,
      date: slot.date,
      time: slot.time,
      slotId: slot._id,
      reason: reason || "",
      status: "pending",
    });

    // 4. Mark slot as booked
    slot.status = "booked";
    await slot.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
    req.params.id,
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