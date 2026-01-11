import { Request, Response } from "express";
import User from "../models/User";
import generateToken from "../utils/generateToken";
import { generateFriendCode } from "../utils/generateFriendCode";
import Streak from "../models/Streak"; // New Streak model

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // We no longer use user.checkStreak() here as logic is moved to updateHabit/Streak Model
    
    // Fetch Streak Data
    let streakDoc = await Streak.findOne({ user: user._id });
    
    if (!streakDoc) {
        // Create if missing (migration)
        streakDoc = await Streak.create({
            user: user._id,
            username: user.username,
            streakCount: 0,
            history: []
        });
    }

    res.json({
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      friendCode: user.friendCode,
      email: user.email,
      streak: streakDoc.streakCount, // Return from Streak collection
      lastCompletedDate: streakDoc.lastCompletedDate,
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { username, displayName, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const user = await User.create({
    username,
    displayName,
    email,
    password,
    friendCode: generateFriendCode(),
  });

  if (user) {
    // Create initial Streak document
    const streakDoc = await Streak.create({
        user: user._id,
        username: user.username,
        streakCount: 0,
        history: []
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      friendCode: user.friendCode,
      email: user.email,
      streak: streakDoc.streakCount,
      lastCompletedDate: null,
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req: any, res: Response): Promise<void> => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.displayName = req.body.displayName || user.displayName;
    if (req.body.email) {
        user.email = req.body.email;
    }
    if (req.body.username) {
        user.username = req.body.username;
        
        // Also update username in Streak collection for consistency
        await Streak.findOneAndUpdate({ user: user._id }, { username: req.body.username });
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    
    // Fetch latest streak
    let streakDoc = await Streak.findOne({ user: updatedUser._id });
    // Should exist, but handle safety
    const currentStreak = streakDoc ? streakDoc.streakCount : 0;

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      friendCode: updatedUser.friendCode,
      email: updatedUser.email,
      streak: currentStreak,
      token: generateToken(updatedUser._id.toString()),
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
