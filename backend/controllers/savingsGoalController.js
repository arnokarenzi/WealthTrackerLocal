import SavingsGoal from "../models/SavingsGoal.js";

export const getGoals = async (req, res) => {
  try {
    const [rows] = await SavingsGoal.getAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateGoal = async (req, res) => {
  const goalName = req.body.goalName;
  const targetAmount = Number(req.body.targetAmount);
  const addedAmount = Number(req.body.currentSaved);

  try {
    const [rows] = await SavingsGoal.getAll();
    const goal = rows.find((g) => g.id == req.params.id);

    const currentSaved = goal.currentSaved + addedAmount;

    const remaining = targetAmount - currentSaved;
    const progress = (currentSaved / targetAmount) * 100;

    let status = "In progress";
    if (progress >= 100) status = "Completed";
    else if (progress < 25) status = "Below 25% progress";

    await SavingsGoal.update(req.params.id, [
      goalName,
      targetAmount,
      currentSaved,
      remaining,
      progress,
      status,
    ]);

    res.json({ message: "Goal updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
