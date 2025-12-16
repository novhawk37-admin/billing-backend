// models/Invoice.js
import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true },            // Invoice ID (INV-1234)
  customer: { type: String, required: true },      // Customer Name
  email: { type: String, required: true },         // Customer Email
  amount: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  date: { type: String },                          // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Invoice", InvoiceSchema);
