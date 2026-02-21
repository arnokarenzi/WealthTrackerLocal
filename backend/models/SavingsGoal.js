import { pool } from "./MonthlyBudget.js";

const SavingsGoal = {
  getAll: () => pool.query("SELECT * FROM SavingsGoal"),
  update: (id, data) => {
    const sql = `UPDATE SavingsGoal SET 
      goalName=?, targetAmount=?, currentSaved=?, remaining=?, progress=?, status=? 
      WHERE id=?`;
    return pool.query(sql, [...data, id]);
  },
};

export default SavingsGoal;
