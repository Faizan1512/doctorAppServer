// controllers/patientAuth.controller.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Patient } from "../models/patient.modal.js";
import { ENV } from "../config/env.js";
// Register patient
export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, age, gender, address } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ status: 400, message: "Please provide all required fields" });

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient)
      return res.status(400).json({ status: 400, message: "Patient already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      phone,
      age,
      gender,
      address,
    });

    const token = jwt.sign({ id: newPatient._id, role: "patient" }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN || "7d",
    });

    res.status(201).json({
      status: 201,
      message: "Patient registered successfully",
      token,
      patient: {
        id: newPatient._id,
        name: newPatient.name,
        email: newPatient.email,
        phone: newPatient.phone,
        age: newPatient.age,
        gender: newPatient.gender,
        address: newPatient.address,
      },
    });
  } catch (error) {
    console.error("Error in registerPatient:", error);
    res.status(500).json({ status: 500, message: "Server error during patient registration" });
  }
};

// Login patient
export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ status: 400, message: "Please provide email and password" });

    const patient = await Patient.findOne({ email }).select("+password");
    if (!patient)
      return res.status(401).json({ status: 401, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch)
      return res.status(401).json({ status: 401, message: "Invalid credentials" });

    const token = jwt.sign({ id: patient._id, role: "patient" }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN || "7d",
    });

    res.status(200).json({
      status: 200,
      message: "Patient logged in successfully",
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        address: patient.address,
      },
    });
  } catch (error) {
    console.error("Error in loginPatient:", error);
    res.status(500).json({ status: 500, message: "Server error during patient login" });
  }
};
// Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id).select(
      'name email phone age gender address'
    );

    if (!patient) {
      return res.status(404).json({
        status: 404,
        message: 'Patient not found',
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Patient fetched successfully',
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        address: patient.address,
      },
    });
  } catch (error) {
    console.error('Error in getPatientById:', error);
    res.status(500).json({
      status: 500,
      message: 'Server error while fetching patient',
    });
  }
};
