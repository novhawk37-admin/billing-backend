// routes/invoiceRoutes.js
import express from "express";
import Invoice from "../models/Invoice.js";

const router = express.Router();

// -------------------- CREATE INVOICE --------------------
router.post("/", async (req, res) => {
  try {
    const { customer, email, amount, status, date } = req.body;

    // Basic validation
    if (!customer || !email || !amount) {
      return res.status(400).json({
        success: false,
        message: "Customer, email, and amount are required",
      });
    }

    // Generate unique invoice ID
    let invoiceId;
    let exists = true;

    // Retry if random ID already exists (rare)
    while (exists) {
      invoiceId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
      exists = await Invoice.exists({ id: invoiceId });
    }

    // Prepare invoice data safely
    const invoiceData = {
      id: invoiceId,
      customer: customer.trim(),
      email: email.trim(),
      amount: Number(amount),
      status: status || "Pending",
      date: date && date.trim() !== "" && !isNaN(new Date(date))
        ? new Date(date)
        : Date.now(),
    };

    // Create and save invoice
    const invoice = await Invoice.create(invoiceData);
    console.log("✅ Invoice saved to DB:", invoice);

    res.status(201).json({
      success: true,
      message: `Invoice ${invoice.id} created successfully`,
      data: invoice,
    });
  } catch (error) {
    console.error("❌ Invoice Save Error:", error);

    // Duplicate ID error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate invoice ID. Please try again.",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create invoice",
      error: error.message,
    });
  }
});

// -------------------- GET ALL INVOICES --------------------
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error("❌ Fetch Invoices Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
});

export default router;
