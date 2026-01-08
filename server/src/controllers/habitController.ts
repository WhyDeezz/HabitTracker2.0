import { Request, Response } from "express";
import Habit from "../models/Habit";
import User from "../models/User";
import Group from "../models/Group";

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
      days, // Frontend sends 'days', map to activeDays
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

    res.status(201).json(habit);
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
        // Streak Reset Logic (Lazy check)
        // Streak Reset Logic (Lazy check)
        const user = req.user;
        // The user object on req is likely a Mongoose document if using a good middleware, 
        // but sometimes it's a POJO. If it's a doc, we can call methods.
        // If our auth middleware fetches with findById, it's a doc.
        if (user.checkStreak) {
             await user.checkStreak();
        }

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
        
        let streakUpdated = false;
        let newStreak = req.user.streak;

        // Check for completion update
        if (req.body.completions) {
            habit.completions = req.body.completions;

            // Check if this update makes all habits complete for TODAY
            const today = new Date().toISOString().slice(0, 10);
            
            if (habit.completions.includes(today)) {
                // Fetch all active habits for this user
                const allHabits = await Habit.find({ user: req.user._id });
                
                // Check if ALL active habits are completed today
                const allComplete = allHabits.every(h => {
                    // If it's the one we just updated, use the updated 'habit' object
                    if (h._id.toString() === habit._id.toString()) {
                        return habit.completions.includes(today);
                    }
                    return h.completions.includes(today);
                });



                if (allComplete) {
                     // Check if already incremented today
                     const user = req.user;
                     const todayDate = new Date();
                     todayDate.setHours(0, 0, 0, 0);
                     
                     const lastDate = user.lastCompletedDate ? new Date(user.lastCompletedDate) : null;
                     let lastDateStr = null;
                     if (lastDate) {
                         lastDate.setHours(0, 0, 0, 0);
                         lastDateStr = lastDate.toISOString().slice(0, 10);
                     }
                     


                     if (lastDateStr !== today) {
                         // Check if this is consecutive (yesterday)
                         const yesterday = new Date(todayDate);
                         yesterday.setDate(yesterday.getDate() - 1);
                         const yesterdayStr = yesterday.toISOString().slice(0, 10);
                         
                         if (lastDateStr === yesterdayStr) {
                             // Consecutive day - increment streak
                             user.streak += 1;

                         } else {
                             // Not consecutive - reset to 1
                             user.streak = 1;

                         }
                         
                         user.lastCompletedDate = new Date();
                         await user.save();
                         streakUpdated = true;
                         newStreak = user.streak;

                     } else {

                     }
                     
                     // ===== GROUP STREAK LOGIC =====
                     // Check if this user is part of any groups and update group streaks
                     const userGroups = await Group.find({ members: req.user._id, isActive: true });
                     
                     for (const group of userGroups) {
                         // Check if ALL members of this group completed their habits today
                         const members = await User.find({ _id: { $in: group.members } });
                         
                         const allMembersComplete = members.every(member => {
                             const memberLastDate = member.lastCompletedDate ? new Date(member.lastCompletedDate).toISOString().slice(0, 10) : null;
                             return memberLastDate === today;
                         });
                         

                         
                         if (allMembersComplete) {
                             const groupLastDate = group.lastGroupCompletedDate ? new Date(group.lastGroupCompletedDate).toISOString().slice(0, 10) : null;
                             
                             if (groupLastDate !== today) {
                                 group.groupStreak += 1;
                                 group.lastGroupCompletedDate = new Date();
                                 await group.save();

                             }
                         }
                     }
                 }
            }
        }

        const updatedHabit = await habit.save();
        
        // Return updated habit AND streak info if changed
        res.json({
            ...updatedHabit.toObject(),
            streak: newStreak, // Send back streak so frontend can update
            streakUpdated,
            lastCompletedDate: streakUpdated ? req.user.lastCompletedDate : null
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

        // Check for streak reversion
        let streakUpdated = false;
        let newStreak = req.user.streak;
        const today = new Date().toISOString().slice(0, 10);
        const user = req.user;
        const lastDate = user.lastCompletedDate ? new Date(user.lastCompletedDate).toISOString().slice(0, 10) : null;
        
        // Only if the streak was incremented TODAY
        if (lastDate === today) {
            // Check remaining habits (excluding the one being deleted)
            const remainingHabits = await Habit.find({ 
                user: req.user._id, 
                _id: { $ne: habit._id } 
            });

            if (remainingHabits.length === 0) {
                 // No habits left -> Revert streak
                 if (user.streak > 0) {
                     user.streak -= 1;
                     user.lastCompletedDate = null; // Or set to yesterday? null is safer to force re-earn
                     await user.save();
                     streakUpdated = true;
                     newStreak = user.streak;
                 }
            } else {
                 // Check if remaining are all complete
                 const allComplete = remainingHabits.every(h => h.completions.includes(today));
                 if (!allComplete) {
                     // Streak no longer valid -> Revert
                     if (user.streak > 0) {
                         user.streak -= 1;
                         user.lastCompletedDate = null;
                         await user.save();
                         streakUpdated = true;
                         newStreak = user.streak;
                     }
                 }
                 // If allComplete is still true, streak stays!
            }
        }

        await habit.deleteOne();
        res.json({ message: "Habit removed", streak: newStreak, streakUpdated });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
}
