// routes/invoiceRoutes.js
import express from "express";
import Invoice from "../models/Invoice.js";
import transporter from "../utils/mailer.js";

const router = express.Router();

// -------------------- CREATE INVOICE --------------------
router.post("/", async (req, res) => {
  try {
    const { customer, email, amount, status, date } = req.body;

    if (!customer || !email || !amount) {
      return res.status(400).json({
        success: false,
        message: "Customer, email, and amount are required",
      });
    }

    let invoiceId;
    let exists = true;

    while (exists) {
      invoiceId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
      exists = await Invoice.exists({ id: invoiceId });
    }

    const invoiceData = {
      id: invoiceId,
      customer: customer.trim(),
      email: email.trim(),
      amount: Number(amount),
      status: status || "Pending",
      date:
        date && date.trim() !== "" && !isNaN(new Date(date))
          ? new Date(date)
          : Date.now(),
    };

    const invoice = await Invoice.create(invoiceData);
    console.log("✅ Invoice saved:", invoice.id);

    res.status(201).json({
      success: true,
      message: `Invoice ${invoice.id} created successfully`,
      data: invoice,
    });
  } catch (error) {
    console.error("❌ Invoice Save Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate invoice ID. Please try again.",
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

// -------------------- SEND INVOICE EMAIL --------------------
router.post("/send/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ id: req.params.id });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const mailOptions = {
      from: `NovHawk Billing <${process.env.EMAIL_USER}>`,
      to: invoice.email,
      subject: `Invoice ${invoice.id}`,
      html: `
        <h2>Invoice Details</h2>
        <p><strong>Invoice ID:</strong> ${invoice.id}</p>
        <p><strong>Customer:</strong> ${invoice.customer}</p>
        <p><strong>Amount:</strong> ₹${invoice.amount}</p>
        <p><strong>Status:</strong> ${invoice.status}</p>
        <p><strong>Date:</strong> ${new Date(
          invoice.date
        ).toDateString()}</p>
        <br/>
        <p>Thank you for choosing <b>NovHawk Billing</b>.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("📧 Invoice email sent:", invoice.id);

    res.json({
      success: true,
      message: `Invoice ${invoice.id} sent successfully`,
    });
  } catch (error) {
    console.error("❌ Email Send Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send invoice email",
      error: error.message,
    });
  }
});

export default router;
