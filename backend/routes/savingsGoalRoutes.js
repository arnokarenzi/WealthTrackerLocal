import express from "express";
import * as controller from "../controllers/savingsGoalController.js";
const router = express.Router();
router.get("/", controller.getGoals);
router.put("/:id", controller.updateGoal);
export default router;
