import express from "express";
import Customer from "../models/Customer.js";

const router = express.Router();

// --------------------- MIDDLEWARE ---------------------
// Verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Received token:", token);
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ success: false, message: "Forbidden: Admin only" });
  }
  next();
};


// --------------------- ROUTES ---------------------

// ADD CUSTOMER
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const customer = new Customer({ name, email, phone });
    await customer.save();

    console.log("Customer added:", customer);
    res.status(201).json({ success: true, message: "Customer added successfully", customer });
  } catch (err) {
    console.error("Error adding customer:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET ALL CUSTOMERS
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({ success: true, data: customers });
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE CUSTOMER
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Attempting to delete customer ID:", id);

    // Check if customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      console.log("Customer not found in DB");
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    await Customer.findByIdAndDelete(id);
    console.log("Customer deleted:", customer);

    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (err) {
    console.error("Error deleting customer:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------- EXPORT ROUTER ---------------------
export default router;
