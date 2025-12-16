// server.js – NovHawk Billing Backend
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import customerRoutes from "./routes/customers.js";
//import authRoutes from "./routes/auth.js";
import invoiceRoutes from "./routes/invoices.js";
import nodemailer from "nodemailer";
import reportsRoutes from './routes/reports.js';



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- MONGODB CONNECTION ----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// ---------------- ROUTES ----------------
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use('/api/reports', reportsRoutes);

// ---------------- SEND INVOICE EMAIL ----------------
app.post("/api/send-invoice", async (req, res) => {
  const { name, email, paid = 0, pending = 0, invoiceId } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: "Name and email are required" });
  }

  // Configure Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,      // Your Gmail address
      pass: process.env.EMAIL_PASS,      // App password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Invoice ${invoiceId} from NovHawk`,
    html: `
      <h2>Invoice Details</h2>
      <p><strong>Invoice ID:</strong> ${invoiceId}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Paid Amount:</strong> ₹${paid}</p>
      <p><strong>Pending Amount:</strong> ₹${pending}</p>
      <p>Thank you for doing business with us!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: `Invoice ${invoiceId} sent successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send invoice", error: err.message });
  }
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
