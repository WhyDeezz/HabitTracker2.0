import { NextFunction, Request, Response } from "express";
import User from "../models/User";

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
    }).select("displayName username friendCode _id streak lastCompletedDate");

    if (!user) {
       res.status(404).json({ message: "User not found" });
       return;
    }

    // Don't return self
    if (user._id.toString() === req.user._id.toString()) {
        res.status(400).json({ message: "You cannot add yourself" });
        return;
    }

    res.json(user);
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

        res.json({ 
            message: "Friend added successfully",
            friend: {
                _id: friendToAdd._id,
                displayName: friendToAdd.displayName,
                username: friendToAdd.username,
                friendCode: friendToAdd.friendCode,
                streak: friendToAdd.streak,
                lastCompletedDate: friendToAdd.lastCompletedDate
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
        const user = await User.findById(req.user._id).populate("friends", "displayName username friendCode streak lastCompletedDate");
        
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json(user.friends);
    } catch (error) {
        next(error);
    }
};
