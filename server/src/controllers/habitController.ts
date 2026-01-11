import { Request, Response } from "express";
import Habit from "../models/Habit";
import User from "../models/User";
import Group from "../models/Group";
import Streak from "../models/Streak"; // New Streak model
import { getISTDate, getYesterdayISTDate } from "../utils/dateUtils";

// --- Centralized Streak Sync Logic ---
// This function is the single source of truth for streak updates.
// It checks if ALL active habits are completed for today (IST) and updates the streak accordingly.
const syncStreakInternal = async (userId: string) => {
    const todayIST = getISTDate();
    
    // 1. Fetch ALL active habits for this user
    const allHabits = await Habit.find({ user: userId } as any);

    // 2. Check if ALL active habits are completed for TODAY (IST)
    let allComplete = false;
    if (allHabits.length > 0) {
        allComplete = allHabits.every((h: any) => h.completions && h.completions.includes(todayIST));
    }

    // 3. Update Streak Collection Logic
    let streakDoc: any = await Streak.findOne({ user: userId });
    
    // Initialize if missing
    if (!streakDoc) {
        const user = await User.findById(userId);
         streakDoc = await Streak.create({
             user: userId,
             username: user?.username || "User",
             streakCount: 0,
             history: []
         });
    }

    const lastDateIST = streakDoc.lastCompletedDateIST;
    let streakUpdated = false;

    if (allComplete) {
         // Scenario: User has completed everything for today.
         // Action: Ensure streak is incremented for today.
         
         if (lastDateIST !== todayIST) {
             const yesterdayIST = getYesterdayISTDate(todayIST);
             
             if (lastDateIST === yesterdayIST) {
                 // Consecutive: Increment
                 streakDoc.streakCount += 1;
             } else {
                 // Gap or First Time: Reset/Set to 1
                 streakDoc.streakCount = 1;
             }
             
             streakDoc.lastCompletedDate = new Date(); // Timestamp
             streakDoc.lastCompletedDateIST = todayIST;
             
             // Add to history if not exists
             if (!streakDoc.history.includes(todayIST)) {
                 streakDoc.history.push(todayIST);
             }
             
             await streakDoc.save();
             streakUpdated = true;
         }
    } else {
         // Scenario: User has NOT completed everything for today.
         // Action: Ensure streak is NOT credited for today. 
         
         if (streakDoc.lastCompletedDateIST === todayIST) {
             // Revert logic
             
             // 1. Remove today from history
             const index = streakDoc.history.indexOf(todayIST);
             if (index > -1) {
                 streakDoc.history.splice(index, 1);
             }
             
             // 2. Find previous completed date from history
             const newLastDate = streakDoc.history.length > 0 
                 ? streakDoc.history[streakDoc.history.length - 1] 
                 : undefined;
                 
             streakDoc.lastCompletedDateIST = newLastDate;
             
             // 3. Revert timestamp
             if (!newLastDate) {
                 streakDoc.lastCompletedDate = null as any;
             } else {
                 const yesterday = new Date();
                 yesterday.setDate(yesterday.getDate() - 1);
                 streakDoc.lastCompletedDate = yesterday;
             }

             // 4. Revert count
             if (streakDoc.streakCount > 0) {
                 streakDoc.streakCount -= 1;
             }
             
             await streakDoc.save();
             streakUpdated = true;
         }
    }
    
    return {
        streak: streakDoc.streakCount,
        streakUpdated,
        lastCompletedDate: streakDoc.lastCompletedDate
    };
};


// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
export const createHabit = async (req: any, res: Response): Promise<void> => {
  try {
    const {
      name,
      microIdentity,
      type,
      goal,
      days, 
      reminderEnabled,
      reminderTime,
      visibility,
      duration,
    } = req.body;

    const habit = await Habit.create({
      user: req.user._id,
      name,
      microIdentity,
      type,
      goal,
      activeDays: days,
      reminderEnabled,
      reminderTime,
      visibility,
      duration,
      completions: [],
    });

    // Sync streak (Adding a new habit might break "All Done" status)
    const streakInfo = await syncStreakInternal(req.user._id);

    res.status(201).json({
        ...habit.toObject(),
        streak: streakInfo.streak,
        lastCompletedDate: streakInfo.lastCompletedDate
    });
  } catch (error) {
    console.error("Error creating habit:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get user habits
// @route   GET /api/habits
// @access  Private
export const getHabits = async (req: any, res: Response): Promise<void> => {
    try {
        const habits = await Habit.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update habit (e.g. completions)
// @route   PUT /api/habits/:id
// @access  Private
export const updateHabit = async (req: any, res: Response): Promise<void> => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            res.status(404).json({ message: "Habit not found" });
            return;
        }

        // Authorize
        if (habit.user.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        // Update fields if provided
        habit.name = req.body.name || habit.name;
        
        // Check for completion update
        if (req.body.completions) {
            habit.completions = req.body.completions;
        }

        const updatedHabit = await habit.save();
        
        // Sync streak (Toggling completion might change "All Done" status)
        const streakInfo = await syncStreakInternal(req.user._id);
        
        res.json({
            ...updatedHabit.toObject(),
            streak: streakInfo.streak,
            streakUpdated: streakInfo.streakUpdated,
            lastCompletedDate: streakInfo.lastCompletedDate
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
}

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
export const deleteHabit = async (req: any, res: Response): Promise<void> => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
             res.status(404).json({ message: "Habit not found" });
             return;
        }

        if (habit.user.toString() !== req.user._id.toString()) {
             res.status(401).json({ message: "Not authorized" });
             return;
        }

        // --- Group Cleanup ---
        // TODO: Move this to a service or reusable function if it grows
        const groupsWithHabit = await Group.find({ "memberHabits.habit": req.params.id });
        const todayIST = getISTDate();
        const yesterdayIST = getYesterdayISTDate(todayIST);

        for (const group of groupsWithHabit) {
            // Remove the linked habit entry
            if (group.memberHabits) {
                group.memberHabits = group.memberHabits.filter((mh: any) => mh.habit.toString() !== req.params.id);
            }
            
            // Revert Group Streak Logic if needed:
            // This logic allows deleting a habit to REVERT a group streak if it was the only one contributing?
            // Or maybe just leave it safe. 
            // Existing logic was: if group last completed date is TODAY, revert it.
            if (group.lastCompletedDateIST === todayIST) {
                if (group.groupStreak > 0) {
                    group.groupStreak -= 1;
                }
                group.lastCompletedDateIST = yesterdayIST;
            }
            
            await group.save();
        }

        await habit.deleteOne();

        // Sync streak (Deleting a blocker might trigger "All Done" status)
        const streakInfo = await syncStreakInternal(req.user._id);

        res.json({ 
            message: "Habit removed", 
            streak: streakInfo.streak,
            lastCompletedDate: streakInfo.lastCompletedDate 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
}
