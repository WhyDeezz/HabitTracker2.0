import express from "express";
import { protect } from "../middleware/authMiddleware";
import { searchUser, addFriend, getFriends } from "../controllers/friendController";

const router = express.Router();

router.get("/search", protect, searchUser);
router.post("/add", protect, addFriend);
router.get("/", protect, getFriends);

export default router;
