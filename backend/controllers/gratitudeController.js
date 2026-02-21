import { pool } from "../models/MonthlyBudget.js";

export const saveGratitude = async (req, res) => {
  const { reflection } = req.body;
  try {
    if (!reflection)
      return res.status(400).json({ message: "Reflection cannot be empty" });

    await pool.query("INSERT INTO DailyGratitude (reflection) VALUES (?)", [
      reflection,
    ]);
    res.json({ message: "Gratitude saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGratitudes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM DailyGratitude ORDER BY created_at DESC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
