import express from "express";
import { protect } from "../middleware/authMiddleware";
import { createGroup, getUserGroups, leaveGroup, deleteGroup, addMemberToGroup } from "../controllers/groupController";

const router = express.Router();

router.post("/create", protect, createGroup);
router.get("/", protect, getUserGroups);
router.post("/leave", protect, leaveGroup);
router.post("/add-member", protect, addMemberToGroup);
router.delete("/:groupId", protect, deleteGroup);

export default router;
