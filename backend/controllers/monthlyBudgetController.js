// backend/controllers/monthlyBudgetController.js
import { MonthlyBudget, pool } from "../models/MonthlyBudget.js";

/**
 * Helper: safe number parse
 * Converts null, undefined, "", or invalid strings into 0
 */
const n = (v) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

/**
 * GET /api/budget
 */
// backend/controllers/monthlyBudgetController.js

export const getBudget = async (req, res) => {
  try {
    const [rows] = await MonthlyBudget.get();
    const [expensesRows] = await pool.query(
      "SELECT IFNULL(SUM(amount),0) AS totalSpent FROM DailyExpense",
    );
    const b = rows[0];
    const actualSpent = n(expensesRows[0].totalSpent);

    // DYNAMIC LOGIC:
    // We calculate costs using actual spending instead of the miscellaneous "plan"
    const fixedCosts =
      n(b.rent) +
      n(b.phoneInternet) +
      n(b.electricityWater) +
      n(b.food) +
      n(b.medical) +
      n(b.familySupport);

    const savingsAndInvest =
      n(b.schoolSaving) + n(b.emergencyFund) + n(b.investment);

    // Total out = Fixed + Savings + Actual Variable Spending
    const plannedCosts = fixedCosts + savingsAndInvest + actualSpent;
    const remainingBalance = n(b.salary) + n(b.otherIncome) - plannedCosts;

    res.json({
      ...b,
      miscellaneous: actualSpent, // Force the field to show actual spending
      remainingBalance,
      actualSpent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/budget
 * Fixes the "Incorrect decimal value" error by sanitizing inputs before the SQL call
 */
export const updateBudget = async (req, res) => {
  const b = req.body;
  try {
    // 1. Fetch the Allocation Template to get the % target
    const [templates] = await pool.query(
      "SELECT emergency_pct FROM AllocationTemplates WHERE user_id = 1 LIMIT 1",
    );
    const emergencyPct =
      templates.length > 0 ? n(templates[0].emergency_pct) : 0;

    const totalIncome = n(b.salary) + n(b.otherIncome);
    const emergencyTarget = (totalIncome * emergencyPct) / 100;
    const currentEF = n(b.emergencyFund);

    // 2. DISCIPLINE ENGINE: The Hard Lock
    if (n(b.investment) > 0 && currentEF < emergencyTarget) {
      const remaining = (emergencyTarget - currentEF).toLocaleString();
      return res.status(400).json({
        message: `⚠️ Investment Lock: You cannot invest yet. You still need $${remaining} in your Emergency Fund to reach your ${emergencyPct}% goal.`,
      });
    }

    // 3. Calculate Balance
    const costs =
      n(b.rent) +
      n(b.schoolSaving) +
      n(b.phoneInternet) +
      n(b.electricityWater) +
      n(b.food) +
      n(b.miscellaneous) + // 'miscellaneous' used instead of transport
      n(b.medical) +
      n(b.familySupport) +
      n(b.emergencyFund) +
      n(b.investment);

    const balance = totalIncome - costs;

    // Update SQL (Note: ensure your DB column 'transport' is renamed to 'miscellaneous' or mapped here)
    await MonthlyBudget.update([
      n(b.salary),
      n(b.otherIncome),
      n(b.rent),
      n(b.schoolSaving),
      n(b.phoneInternet),
      n(b.electricityWater),
      n(b.food),
      n(b.miscellaneous),
      n(b.medical),
      n(b.familySupport),
      n(b.emergencyFund),
      n(b.investment),
      n(b.month),
      n(b.year),
      balance,
      b.id || 1,
    ]);

    res.json({ message: "Budget saved successfully!", balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/budget/reset
 */
export const resetMonth = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [budgetRows] = await connection.query(
      "SELECT * FROM MonthlyBudget LIMIT 1",
    );

    if (budgetRows.length > 0) {
      const b = budgetRows[0];

      const goalsToUpdate = [
        { amount: n(b.schoolSaving), name: "School Fees Buffer" },
        { amount: n(b.emergencyFund), name: "Emergency Fund" },
        { amount: n(b.investment), name: "Business Capital" },
      ];

      for (const goal of goalsToUpdate) {
        if (goal.amount > 0) {
          await connection.query(
            `UPDATE SavingsGoal
   SET currentSaved = (@new := currentSaved + ?),
       remaining = targetAmount - @new,
       progress = LEAST(GREATEST((@new / targetAmount) * 100, 0), 100),
       status = CASE
         WHEN (@new / targetAmount) * 100 >= 100 THEN 'Completed'
         WHEN (@new / targetAmount) * 100 < 25 THEN 'Below 25% progress'
         ELSE 'In progress'
       END
   WHERE goalName = ?`,
            [goal.amount, goal.name],
          );
        }
      }

      await connection.query(
        "INSERT INTO SchoolFees (month, amountSaved, cumulative) VALUES (?, ?, (SELECT IFNULL(SUM(amountSaved), 0) + ? FROM SchoolFees AS tmp))",
        [b.month, n(b.schoolSaving), n(b.schoolSaving)],
      );
    }

    await connection.query(`
      UPDATE MonthlyBudget 
      SET salary = 0, 
          translatedLetters = 0, 
          shiftLetters = 0,
          otherIncome = 0, 
          rent = 0, 
          schoolSaving = 0, 
          phoneInternet = 0, 
          electricityWater = 0, 
          food = 0, 
          miscellaneous = 0,  -- Updated from transport
          medical = 0, 
          familySupport = 0, 
          emergencyFund = 0, 
          investment = 0, 
          balance = 0,
          translatedLetters = 0
      WHERE id = 1
    `);

    // 2. Clear the daily expenses log for the new month
    await connection.query("DELETE FROM DailyExpense");

    await connection.commit();
    res.json({ message: "All goals updated and month reset successfully." });
  } catch (err) {
    await connection.rollback();
    console.error("Reset Month Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

/**
 * POST /api/budget/initialize
 */
export const initializeProject = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM DailyExpense");
    await connection.query("DELETE FROM SchoolFees");
    await connection.query(`
      UPDATE SavingsGoal
      SET currentSaved = 0, remaining = targetAmount, progress = 0, status = 'In progress'
    `);
    await connection.query(`
      UPDATE MonthlyBudget
      SET translatedLetters = 0,
          shiftLetters = 0,
          salary = 0, 
          otherIncome = 0, 
          rent = 0, 
          schoolSaving = 0,
          phoneInternet = 0, 
          electricityWater = 0, 
          food = 0, 
          miscellaneous = 0,
          medical = 0, 
          familySupport = 0, 
          emergencyFund = 0, 
          investment = 0,
          balance = 0
      WHERE id = 1
    `);
    await connection.commit();
    res.json({
      message: "Project initialized successfully. All data has been cleared.",
    });
  } catch (err) {
    await connection.rollback();
    console.error("Initialize Project Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};
