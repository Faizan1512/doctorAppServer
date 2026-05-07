import express from "express";
import path from "path";
import cors from "cors";
import { createServer } from "http";
import { serve } from "inngest/express";

import { initWebRTC } from "./webrtc.js";
import { initChat } from "./chat.js";

import { functions, inngest } from "./config/inngest.js";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import authRoute from "./routes/auth.route.js";
import patientRoute from "./routes/patient.route.js";
import doctorRoute from "./routes/doctor.route.js";
import appointmentRoute from "./routes/appointment.route.js";
import slotsRoute from "./routes/slots.route.js";

const app = express();
const __dirname = path.resolve();

// IMPORTANT FOR SOCKET.IO
const httpServer = createServer(app);

// ====================
// CORS
// ====================
const allowedOrigins = [
  ENV.CLIENT_URL,
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// ====================
// SOCKET.IO / WEBRTC
// ====================
initWebRTC(httpServer, allowedOrigins);
initChat(httpServer, allowedOrigins);

// ====================
// INNGEST
// ====================
app.use("/api/inngest", serve({ client: inngest, functions }));

// ====================
// ROUTES
// ====================
app.use("/api/patient/auth", patientRoute);
app.use("/api/doctor/auth", doctorRoute);
app.use("/api/appointment", appointmentRoute);
app.use("/api/slots", slotsRoute);

app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// ====================
// HEALTH CHECK
// ====================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server Running",
  });
});

// ====================
// FRONTEND BUILD
// ====================
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../admin/dist")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../admin/dist/index.html"));
});
}

// ====================
// START SERVER
// ====================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Railway Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
};

startServer();