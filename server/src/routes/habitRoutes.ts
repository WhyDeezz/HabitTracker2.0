import express from "express";
import { protect } from "../middleware/authMiddleware";
import { 
    createHabit, 
    getHabits, 
    updateHabit, 
    deleteHabit 
} from "../controllers/habitController";

const router = express.Router();

router.route("/")
    .post(protect, createHabit)
    .get(protect, getHabits);

router.route("/:id")
    .put(protect, updateHabit)
    .delete(protect, deleteHabit);

export default router;
