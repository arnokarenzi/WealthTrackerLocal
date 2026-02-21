import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

import budgetRoutes from "./routes/monthlyBudgetRoutes.js";
import expenseRoutes from "./routes/dailyExpenseRoutes.js";
import savingRoutes from "./routes/savingsGoalRoutes.js";
import schoolRoutes from "./routes/schoolFeesRoutes.js";
import gratitudeRoutes from "./routes/gratitudeRoutes.js";
import allocationRoutes from "./routes/allocationRoutes.js";
import alertsRoutes from "./routes/alertsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/budget", budgetRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/savings", savingRoutes);
app.use("/api/school-fees", schoolRoutes);
app.use("/api/gratitude", gratitudeRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/alerts", alertsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
