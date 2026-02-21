import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "personal_finance",
  waitForConnections: true,
  connectionLimit: 10,
});

export const MonthlyBudget = {
  get: async () => {
    return await pool.query("SELECT * FROM MonthlyBudget LIMIT 1");
  },

  update: async (values) => {
    return await pool.query(
      `UPDATE MonthlyBudget 
       SET salary=?, otherIncome=?, rent=?, schoolSaving=?, 
           phoneInternet=?, electricityWater=?, food=?, miscellaneous=?, 
           medical=?, familySupport=?, emergencyFund=?, investment=?, 
           month=?, year=?, balance=? 
       WHERE id=?`,
      values,
    );
  },
};
