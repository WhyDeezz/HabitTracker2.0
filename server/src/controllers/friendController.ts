import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import Streak from "../models/Streak";

// @desc    Search for a user by Friend Code
// @route   GET /api/friends/search?code=HABIT-XXXXXX
// @access  Private
export const searchUser = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code } = req.query;

    if (!code) {
      res.status(400).json({ message: "Friend code is required" });
      return;
    }

    const user = await User.findOne({ 
        friendCode: code.toUpperCase() 
    }).select("displayName username friendCode _id"); // Removed stale streak/lastCompletedDate

    if (!user) {
       res.status(404).json({ message: "User not found" });
       return;
    }

    // Don't return self
    if (user._id.toString() === req.user._id.toString()) {
        res.status(400).json({ message: "You cannot add yourself" });
        return;
    }

    // Fetch real streak
    const streakDoc = await Streak.findOne({ user: user._id });
    const streakCount = streakDoc ? streakDoc.streakCount : 0;
    const lastCompletedDate = streakDoc ? streakDoc.lastCompletedDate : null;

    res.json({
        _id: user._id,
        displayName: user.displayName,
        username: user.username,
        friendCode: user.friendCode,
        streak: streakCount,
        lastCompletedDate
    });
  } catch (error) {
    next(error); 
  }
};

// @desc    Add a friend (Mutual)
// @route   POST /api/friends/add
// @access  Private
export const addFriend = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { friendId } = req.body;

        const currentUser = await User.findById(req.user._id);
        const friendToAdd = await User.findById(friendId);

        if (!currentUser || !friendToAdd) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Check if already friends
        if (currentUser.friends.includes(friendId)) {
            res.status(400).json({ message: "User is already your friend" });
            return;
        }

        // Mutual Add
        currentUser.friends.push(friendId);
        friendToAdd.friends.push(currentUser._id);

        await currentUser.save();
        await friendToAdd.save();

        // Fetch real streak for the added friend
        const streakDoc = await Streak.findOne({ user: friendToAdd._id });
        const streakCount = streakDoc ? streakDoc.streakCount : 0;
        const lastCompletedDate = streakDoc ? streakDoc.lastCompletedDate : null;

        res.json({ 
            message: "Friend added successfully",
            friend: {
                _id: friendToAdd._id,
                displayName: friendToAdd.displayName,
                username: friendToAdd.username,
                friendCode: friendToAdd.friendCode,
                streak: streakCount,
                lastCompletedDate: lastCompletedDate
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove a friend (Mutual)
// @route   POST /api/friends/remove
// @access  Private
export const removeFriend = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { friendId } = req.body;

        const currentUser = await User.findById(req.user._id);
        const friendToRemove = await User.findById(friendId);

        if (!currentUser || !friendToRemove) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Remove from both lists
        currentUser.friends = currentUser.friends.filter(id => id.toString() !== friendId);
        friendToRemove.friends = friendToRemove.friends.filter(id => id.toString() !== currentUser._id.toString());

        await currentUser.save();
        await friendToRemove.save();

        res.json({ message: "Friend removed successfully" });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's friends
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        // First populate user friends data (basic info)
        const user = await User.findById(req.user._id).populate("friends", "displayName username friendCode");
        
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const friendsList: any[] = user.friends;
        
        // Extract friend IDs
        const friendIds = friendsList.map(f => f._id);

        // Fetch Streaks for all friends
        const streakDocs = await Streak.find({ user: { $in: friendIds } });

        // Map streaks to a dictionary for O(1) lookup
        const streakMap: { [key: string]: { streakCount: number, lastCompletedDate: any, lastCompletedDateIST: string } } = {};
        streakDocs.forEach(doc => {
            streakMap[doc.user.toString()] = {
                streakCount: doc.streakCount,
                lastCompletedDate: doc.lastCompletedDate,
                lastCompletedDateIST: doc.lastCompletedDateIST || ""
            };
        });

        // Merge data
        const friendsWithStreak = friendsList.map(f => ({
            _id: f._id,
            displayName: f.displayName,
            username: f.username,
            friendCode: f.friendCode,
            streak: streakMap[f._id.toString()] ? streakMap[f._id.toString()].streakCount : 0,
            lastCompletedDate: streakMap[f._id.toString()] ? streakMap[f._id.toString()].lastCompletedDate : null,
            lastCompletedDateIST: streakMap[f._id.toString()] ? streakMap[f._id.toString()].lastCompletedDateIST : null
        }));

        res.json(friendsWithStreak);
    } catch (error) {
        next(error);
    }
};
