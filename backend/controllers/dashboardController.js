import { pool } from "../models/MonthlyBudget.js";

const n = (v) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

const RATE_PER_LETTER = 245;
const MAX_SHIFT_LETTERS = 817;

// backend/controllers/dashboardController.js

export const getDashboard = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM MonthlyBudget WHERE id = 1");
    const [templates] = await pool.query(
      "SELECT emergency_pct FROM AllocationTemplates WHERE user_id = 1 LIMIT 1",
    );
    const [expensesRows] = await pool.query(
      "SELECT IFNULL(SUM(amount),0) AS totalSpent FROM DailyExpense",
    );

    if (!rows.length)
      return res.status(404).json({ error: "Budget row not found" });

    const b = rows[0];
    const actualSpentFromDaily = n(expensesRows[0].totalSpent);
    const emergencyPct =
      templates.length > 0 ? n(templates[0].emergency_pct) : 0;

    // --- 1. INJECT LIVE BALANCE LOGIC ---
    // Recalculate salary based on TOTAL letters recorded for the month
    const liveSalary = n(b.translatedLetters) * RATE_PER_LETTER;
    const liveIncome = liveSalary + n(b.otherIncome);

    // Sum up all planned outgoings
    const plannedEssentials =
      n(b.rent) +
      n(b.phoneInternet) +
      n(b.electricityWater) +
      n(b.food) +
      n(b.miscellaneous) + // This is where your 11,500 likely lives
      n(b.medical) +
      n(b.familySupport);

    const plannedSavings =
      n(b.schoolSaving) + n(b.emergencyFund) + n(b.investment);

    // Total Out = All Planned Costs + Any extra daily spending recorded
    const totalOut = plannedEssentials + plannedSavings + actualSpentFromDaily;
    const liveBalance = liveIncome - totalOut;

    // AUTO-SYNC: Update the database so other pages see this same truth
    await pool.query(
      "UPDATE MonthlyBudget SET salary = ?, balance = ? WHERE id = 1",
      [liveSalary, liveBalance],
    );

    // --- 2. DYNAMIC CALENDAR SHIFT LOGIC (Medals) ---
    const now = new Date();
    const day = now.getDate();
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();

    const isShift1 = day <= 15;
    const totalDaysInShift = isShift1 ? 15 : lastDayOfMonth - 15;
    const shiftDay = isShift1 ? day : day - 15;

    const shiftLetters = n(b.shiftLetters);
    const remainingToMax = MAX_SHIFT_LETTERS - shiftLetters;

    const dailyMax = MAX_SHIFT_LETTERS / totalDaysInShift;
    const dailyMin = 700 / totalDaysInShift;

    const maxPace = shiftDay * dailyMax;
    const minPace = shiftDay * dailyMin;

    // --- REUSING EXISTING VARIABLES FOR PACING ---
    const remainingDaysInShift = Math.max(1, totalDaysInShift - shiftDay + 1);
    const chunkPacingTarget = Math.round(remainingToMax / remainingDaysInShift);

    let shiftStatus = {
      medal: "None",
      message: "",
      variant: "light",
      behind: 0,
      isLastDay: day === 15 || day === lastDayOfMonth,
      shiftDay,
      totalDaysInShift,
      isShift1,
      currentDay: day,
      chunkPacingTarget, // <--- Sent to frontend using existing data elements
    };

    if (shiftLetters >= maxPace) {
      shiftStatus.medal = "🥇 Gold";
      shiftStatus.message = `Elite Performance! Only ${remainingToMax} letters left to reach your shift cap.`;
      shiftStatus.variant = "warning";
    } else if (shiftLetters >= minPace) {
      const toGold = Math.ceil(maxPace - shiftLetters);
      shiftStatus.medal = "🥈 Silver";
      shiftStatus.message = `Optimal Pace. You need ${toGold} more letters to hit the Gold track!`;
      shiftStatus.variant = "secondary";
    } else if (shiftLetters >= minPace * 0.875) {
      const toSilver = Math.ceil(minPace - shiftLetters);
      shiftStatus.medal = "🥉 Bronze";
      shiftStatus.message = `Slightly behind pace. Add ${toSilver} more letters to reach Silver territory.`;
      shiftStatus.variant = "success";
    } else {
      shiftStatus.behind = Math.round(minPace - shiftLetters);
      shiftStatus.medal = "⚠️ Danger";
      shiftStatus.message = `DANGER: You are ${shiftStatus.behind} letters behind the safety guard!`;
      shiftStatus.variant = "danger";
    }

    // Projected Pay Calculation
    let projectedPay = 0;
    if (shiftStatus.medal.includes("Gold"))
      projectedPay = MAX_SHIFT_LETTERS * RATE_PER_LETTER;
    else if (shiftStatus.medal.includes("Silver"))
      projectedPay = 600 * RATE_PER_LETTER;
    else if (shiftStatus.medal.includes("Bronze"))
      projectedPay = 450 * RATE_PER_LETTER;
    else projectedPay = shiftLetters * RATE_PER_LETTER;

    shiftStatus.projectedPay = projectedPay;
    shiftStatus.potentialLoss =
      MAX_SHIFT_LETTERS * RATE_PER_LETTER - projectedPay;

    // --- 3. WEALTH SCORE (Using Live Data) ---
    const emergencyTarget = (liveIncome * emergencyPct) / 100;
    const efCompletionPct =
      emergencyTarget > 0
        ? Math.min((n(b.emergencyFund) / emergencyTarget) * 100, 100)
        : 100;

    const investRatio =
      liveIncome > 0 ? (n(b.investment) / liveIncome) * 100 : 0;
    const disciplineMargin =
      liveIncome > 0 ? (liveBalance / liveIncome) * 100 : 0;

    let score = 0;
    score += (efCompletionPct / 100) * 40;
    score += Math.min((investRatio / 20) * 30, 30);
    score += Math.min((disciplineMargin / 10) * 20, 20);
    if (liveBalance > 0) score += 10;

    const stages = [
      "Priority: Build Safety",
      "Stability Phase",
      "Investing Mode",
      "Wealth Builder",
    ];
    const stageIndex = score <= 40 ? 0 : score <= 60 ? 1 : score <= 80 ? 2 : 3;

    res.json({
      wealthScore: Math.round(score),
      financialStage: stages[stageIndex],
      emergencyTarget,
      efCompletionPct: Math.round(efCompletionPct),
      seedRatio: Math.round(investRatio),
      essentials: plannedEssentials,
      shiftStatus,
      monthlyBudget: {
        ...b,
        salary: liveSalary,
        balance: liveBalance,
        remainingBalance: liveBalance,
      },
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateLetters = async (req, res) => {
  const { newLetters } = req.body;
  const num = Number(newLetters);

  try {
    const [rows] = await pool.query(
      "SELECT translatedLetters, shiftLetters FROM MonthlyBudget WHERE id = 1",
    );
    const currentTotal = rows[0].translatedLetters + num;
    const currentShift = rows[0].shiftLetters + num;

    if (currentShift > MAX_SHIFT_LETTERS) {
      return res.status(400).json({
        error: `Limit reached! You can only add ${MAX_SHIFT_LETTERS - rows[0].shiftLetters} more letters this shift.`,
      });
    }

    const newSalary = currentTotal * RATE_PER_LETTER;

    await pool.query(
      "UPDATE MonthlyBudget SET translatedLetters = ?, shiftLetters = ?, salary = ? WHERE id = 1",
      [currentTotal, currentShift, newSalary],
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD THIS NEW FUNCTION to the bottom of dashboardController.js
export const resetShift = async (req, res) => {
  try {
    // This command TELLS the database to wipe the numbers
    await pool.query(`
      UPDATE MonthlyBudget 
      SET shiftLetters = 0, 
          translatedLetters = 0, 
          salary = 0 
      WHERE id = 1
    `);

    res.json({ message: "Shift reset successful!" });
  } catch (err) {
    console.error("Reset Shift Error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateMonthlyBudget = async (req, res) => {
  const { id } = req.params;
  const incoming = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM MonthlyBudget WHERE id = ?",
      [id],
    );
    const [templates] = await pool.query(
      "SELECT emergency_pct FROM AllocationTemplates WHERE user_id = 1 LIMIT 1",
    );

    const current = { ...rows[0], ...incoming };
    const emergencyPct =
      templates.length > 0 ? n(templates[0].emergency_pct) : 0;

    const income = n(current.salary) + n(current.otherIncome);
    const emergencyTarget = (income * emergencyPct) / 100;

    // ENGINE RULE: Auto-Lock Investment
    let finalInvestment = n(current.investment);
    let locked = false;

    // If investment is attempted but EF is below the percentage-based target
    if (n(current.emergencyFund) < emergencyTarget) {
      if (finalInvestment > 0) {
        finalInvestment = 0;
        locked = true;
      }
    }

    const essentials =
      n(current.rent) +
      n(current.phoneInternet) +
      n(current.electricityWater) +
      n(current.food) +
      n(current.miscellaneous) +
      n(current.medical) +
      n(current.familySupport);

    const out =
      essentials +
      n(current.schoolSaving) +
      n(current.emergencyFund) +
      finalInvestment;
    const balance = income - out;

    const sql = `UPDATE MonthlyBudget SET 
      salary=?, otherIncome=?, rent=?, schoolSaving=?, phoneInternet=?, electricityWater=?, 
      food=?, miscellaneous=?, medical=?, familySupport=?, emergencyFund=?, investment=?, balance=? 
      WHERE id=?`;

    await pool.query(sql, [
      n(current.salary),
      n(current.otherIncome),
      n(current.rent),
      n(current.schoolSaving),
      n(current.phoneInternet),
      n(current.electricityWater),
      n(current.food),
      n(current.miscellaneous),
      n(current.medical),
      n(current.familySupport),
      n(current.emergencyFund),
      finalInvestment,
      balance,
      id,
    ]);

    res.json({
      message: locked
        ? `Investment Locked: $${(emergencyTarget - n(current.emergencyFund)).toLocaleString()} more needed in Emergency Fund.`
        : "Budget updated.",
      investmentLocked: locked,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
