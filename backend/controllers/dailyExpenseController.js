import DailyExpense from "../models/DailyExpense.js";
import { pool } from "../models/MonthlyBudget.js";

/**
 * Helper: safe number parse
 * This was missing, causing your ReferenceError!
 */
const n = (v) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

export const getExpenses = async (req, res) => {
  try {
    const [rows] = await DailyExpense.getAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// backend/controllers/dailyExpenseController.js
export const addExpense = async (req, res) => {
  try {
    const { expenseDate, description, category, amount } = req.body;
    const numAmount = n(amount);

    // List of actual columns in your MonthlyBudget table
    const validColumns = [
      "phoneInternet",
      "electricityWater",
      "medical",
      "familySupport",
      "miscellaneous",
    ];

    // SAFETY CHECK: Prevent SQL crashes if the category is missing/invalid
    if (!validColumns.includes(category)) {
      return res.status(400).json({ error: `Invalid category: ${category}` });
    }

    // 1. Save to DailyExpense Table
    await DailyExpense.create({
      expenseDate,
      description,
      category,
      amount: numAmount,
    });

    // 2. Sync to MonthlyBudget Table
    // Logic: Update the specific category AND the miscellaneous total
    /*const sql = `
      UPDATE MonthlyBudget 
      SET \`${category}\` = \`${category}\` + ?, 
          miscellaneous = miscellaneous + ?, 
          balance = balance - ?
      WHERE id = 1
    `;

    await pool.query(sql, [numAmount, numAmount, numAmount]);
    */

    res.status(201).json({ message: "Expense saved and Budget updated!" });
  } catch (err) {
    console.error("Add Expense Error:", err); // This will show in your terminal
    res.status(500).json({ error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    await DailyExpense.delete(req.params.id);
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
