// controllers/doctorAuth.controller.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Doctor } from "../models/doctor.model.js";
import { ENV } from "../config/env.js";
// Register doctor
export const registerDoctor = async (req, res) => {
  try {
    const { name, phone, cnic, password } = req.body;

    if (!name || !phone || !cnic || !password)
      return res.status(400).json({ status: 400, message: "Please provide all required fields" });

    const existingDoctor = await Doctor.findOne({ cnic });
    if (existingDoctor)
      return res.status(400).json({ status: 400, message: "Doctor already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = await Doctor.create({
      name,
      phone,
      cnic,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newDoctor._id, role: "doctor" }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN || "7d",
    });

    res.status(201).json({
      status: 201,
      message: "Doctor registered successfully",
      token,
      doctor: {
        id: newDoctor._id,
        name: newDoctor.name,
        phone: newDoctor.phone,
        cnic: newDoctor.cnic,
      },
    });
  } catch (error) {
    console.error("Error in registerDoctor:", error);
    res.status(500).json({ status: 500, message: "Server error during doctor registration" });
  }
};

// Login doctor
export const loginDoctor = async (req, res) => {
  try {
    const { cnic, password } = req.body;

    if (!cnic || !password)
      return res.status(400).json({ status: 400, message: "Please provide CNIC and password" });

    const doctor = await Doctor.findOne({ cnic }).select("+password");
    if (!doctor)
      return res.status(401).json({ status: 401, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch)
      return res.status(401).json({ status: 401, message: "Invalid credentials" });

    const token = jwt.sign({ id: doctor._id, role: "doctor" }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN || "7d",
    });

    res.status(200).json({
      status: 200,
      message: "Doctor logged in successfully",
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        phone: doctor.phone,
        cnic: doctor.cnic,
      },
    });
  } catch (error) {
    console.error("Error in loginDoctor:", error);
    res.status(500).json({ status: 500, message: "Server error during doctor login" });
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).select("name phone cnic");

    if (!doctor) {
      return res.status(404).json({
        status: 404,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Doctor fetched successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        phone: doctor.phone,
        cnic: doctor.cnic,
      },
    });
  } catch (error) {
    console.error("Error in getDoctorById:", error);
    res.status(500).json({ status: 500, message: "Server error while fetching doctor" });
  }
};

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("name phone cnic");

    res.status(200).json({
      status: 200,
      message: "Doctors fetched successfully",
      doctors: doctors.map((doc) => ({
        id: doc._id,
        name: doc.name,
        phone: doc.phone,
        cnic: doc.cnic,
      })),
    });
  } catch (error) {
    console.error("Error in getAllDoctors:", error);
    res.status(500).json({ status: 500, message: "Server error while fetching doctors" });
  }
};
