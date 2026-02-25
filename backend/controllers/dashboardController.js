import { pool } from "../models/MonthlyBudget.js";

const n = (v) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

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
    const actualSpent = n(expensesRows[0].totalSpent);
    const emergencyPct =
      templates.length > 0 ? n(templates[0].emergency_pct) : 0;

    // --- 1. DYNAMIC CALENDAR SHIFT LOGIC ---
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
    const remainingToMax = 750 - shiftLetters;

    // --- 2. DYNAMIC PACE TARGETS ---
    const dailyMax = 750 / totalDaysInShift;
    const dailyMin = 600 / totalDaysInShift;

    const maxPace = shiftDay * dailyMax;
    const minPace = shiftDay * dailyMin;

    // Initialize shiftStatus
    let shiftStatus = {
      medal: "None",
      message: "",
      variant: "light",
      behind: 0,
      isLastDay: day === 15 || day === lastDayOfMonth,
      shiftDay,
      totalDaysInShift,
      isShift1,
    };

    // --- 3. PERFORMANCE ZONE LOGIC ---
    if (shiftLetters >= maxPace) {
      shiftStatus.medal = "🥇 Gold";
      shiftStatus.message = `Elite Performance! Only ${remainingToMax} letters left to reach your shift cap.`;
      shiftStatus.variant = "warning";
    } else if (shiftLetters >= minPace) {
      const toGold = Math.ceil(maxPace - shiftLetters);
      shiftStatus.medal = "🥈 Silver";
      shiftStatus.message = `Optimal Pace. You need ${toGold} more letters to hit the Gold track!`;
      shiftStatus.variant = "secondary";
    } else if (shiftLetters >= minPace * 0.8) {
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

    // --- 4. PROJECTED EARNINGS ENGINE ---
    const RATE_PER_LETTER = 230;
    let projectedPay = 0;

    // Logic: If you hit a medal, you get that tier's payout. Otherwise, pay per letter.
    if (shiftStatus.medal.includes("Gold")) {
      projectedPay = 750 * RATE_PER_LETTER;
    } else if (shiftStatus.medal.includes("Silver")) {
      projectedPay = 600 * RATE_PER_LETTER;
    } else if (shiftStatus.medal.includes("Bronze")) {
      projectedPay = 450 * RATE_PER_LETTER;
    } else {
      projectedPay = shiftLetters * RATE_PER_LETTER;
    }

    // Attach money metrics to status
    shiftStatus.projectedPay = projectedPay;
    shiftStatus.potentialLoss = 750 * RATE_PER_LETTER - projectedPay;

    // --- 5. WEALTH SCORE CALCULATIONS ---
    const totalIncome = n(b.salary) + n(b.otherIncome);
    const essentials =
      n(b.rent) +
      n(b.phoneInternet) +
      n(b.electricityWater) +
      n(b.food) +
      n(b.miscellaneous) +
      n(b.medical) +
      n(b.familySupport);

    const emergencyTarget = (totalIncome * emergencyPct) / 100;
    const efCompletionPct =
      emergencyTarget > 0
        ? Math.min((n(b.emergencyFund) / emergencyTarget) * 100, 100)
        : 100;

    const investRatio =
      totalIncome > 0 ? (n(b.investment) / totalIncome) * 100 : 0;
    const disciplineMargin =
      totalIncome > 0 ? (n(b.balance) / totalIncome) * 100 : 0;

    let score = 0;
    score += (efCompletionPct / 100) * 40;
    score += Math.min((investRatio / 20) * 30, 30);
    score += Math.min((disciplineMargin / 10) * 20, 20);
    if (n(b.balance) > 0) score += 10;

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
      essentials,
      shiftStatus,
      monthlyBudget: { ...b, remainingBalance: b.balance },
    });
  } catch (err) {
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

    if (currentShift > 750) {
      return res.status(400).json({
        error: `Limit reached! You can only add ${750 - rows[0].shiftLetters} more letters this shift.`,
      });
    }

    const newSalary = currentTotal * 230;

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
