// server.js – NovHawk Billing Backend
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import customerRoutes from "./routes/customers.js";
import invoiceRoutes from "./routes/invoices.js";
import reportsRoutes from "./routes/reports.js";

dotenv.config();

const app = express();

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(express.json());

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.status(200).send("NovHawk Billing Backend is running 🚀");
});

// ---------------- MONGODB CONNECTION ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ---------------- ROUTES ----------------
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes); // includes send-mail route
app.use("/api/reports", reportsRoutes);

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
