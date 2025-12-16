// backend/routes/reports.js
import express from 'express';
import Customer from '../models/Customer.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// Example: Generate sales summary report
router.get('/sales-summary', async (req, res) => {
  try {
    const invoices = await Invoice.find();
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    res.json({
      totalInvoices: invoices.length,
      totalRevenue,
      currency: 'INR',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Example: Customer report
router.get('/customer-report', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json({ totalCustomers: customers.length, customers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;
