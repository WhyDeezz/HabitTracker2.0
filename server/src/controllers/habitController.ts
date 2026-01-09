import { Request, Response } from "express";
import Habit from "../models/Habit";
import User from "../models/User";
import Group from "../models/Group";
import Streak from "../models/Streak"; // New Streak model
import { getISTDate, getYesterdayISTDate } from "../utils/dateUtils";

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

    // --- Streak Reversion Logic ---
    // Rule: "If you add a new habit, your 'All Habits Done' status for today becomes FALSE."
    // So if we already incremented streak for today, we must revert it.
    
    const todayIST = getISTDate();
    const streakDoc = await Streak.findOne({ user: req.user._id });

    if (streakDoc && streakDoc.lastCompletedDateIST === todayIST) {
        // Revert the day
        const index = streakDoc.history.indexOf(todayIST);
        if (index > -1) {
             streakDoc.history.splice(index, 1);
        }
        
        // Find previous completed date from history
        const newLastDate = streakDoc.history.length > 0 
            ? streakDoc.history[streakDoc.history.length - 1] 
            : null;
            
        streakDoc.lastCompletedDateIST = newLastDate || undefined; // TS fix: use undefined instead of null
        
        if (streakDoc.streakCount > 0) {
            streakDoc.streakCount -= 1;
        }
        
        await streakDoc.save();
    }

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
        // We don't need to check streak here anymore as it's decoupled
        // But if we wanted to be double sure, we could lazily check broken streaks.
        // For now, let's just return habits.
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
        let finalStreakCount = 0;
        const todayIST = getISTDate(); // YYYY-MM-DD in IST

        // Check for completion update
        if (req.body.completions) {
            habit.completions = req.body.completions;
            
            // 1. Fetch all active habits for this user
            const allHabits = await Habit.find({ user: req.user._id });
            
            // 2. Check if ALL active habits are completed for TODAY (IST)
            // Note: The frontend sends YYYY-MM-DD strings. 
            // We assume frontend allows completion based on local time, 
            // but we compare against IST date for valid "streak" enforcement if desired.
            // Or we just check if the array includes *today's IST date string*.
            
            const allComplete = allHabits.every(h => {
                const completions = (h._id.toString() === habit._id.toString()) ? habit.completions : h.completions;
                return completions.includes(todayIST);
            });

            // 3. Update Streak Collection Logic
            let streakDoc = await Streak.findOne({ user: req.user._id });
            
            // Initialize if missing (Migration/Safety)
            if (!streakDoc) {
                 streakDoc = await Streak.create({
                     user: req.user._id,
                     username: req.user.username, // Assumption: user populated
                     streakCount: 0,
                     history: []
                 });
            }

            finalStreakCount = streakDoc.streakCount;
            const lastDateIST = streakDoc.lastCompletedDateIST;

            if (allComplete) {
                 // If not already updated for today
                 if (lastDateIST !== todayIST) {
                     const yesterdayIST = getYesterdayISTDate(todayIST);
                     
                     if (lastDateIST === yesterdayIST) {
                         // Consecutive: Increment
                         streakDoc.streakCount += 1;
                     } else {
                         // Gap: Reset to 1 (Since today is done)
                         // Exception: If lastDateIST is NULL (first time ever), set to 1
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
                     finalStreakCount = streakDoc.streakCount;
                 }
                 // If already today, do nothing (keep current streak)
            } else {
                 // Not all habits complete. 
                 // We DON'T decrease the streak here immediately. 
                 // Streak is "broken" only if they miss the whole day, which checks on next login/update.
                 // OR, if they *uncheck* a habit, we might want to revert?
                 // Complexity: If user unchecks a habit after getting a streak increment, strictly we should revert.
                 
                 // Revert Logic: Check if we previously credited this day
                 if (streakDoc.lastCompletedDateIST === todayIST) {
                     // They HAD all complete, now they don't.
                     // Revert the day.
                     
                     // Determine previous state is hard without complex history.
                     // Simple heuristic: If history contains today, remove it.
                     const index = streakDoc.history.indexOf(todayIST);
                     if (index > -1) {
                         streakDoc.history.splice(index, 1);
                         
                         // Determine new streak count
                         // If we are reverting today, did we behave as 1 (reset) or N+1 (increment)?
                         // We can look at the *new* last history item (yesterday or older).
                         
                         const newLastDate = streakDoc.history[streakDoc.history.length - 1]; // could be undefined
                         
                         if (!newLastDate) {
                             streakDoc.streakCount = 0;
                             streakDoc.lastCompletedDateIST = null as any;
                         } else {
                             streakDoc.lastCompletedDateIST = newLastDate;
                             
                             // We don't explicitly know what the count WAS before increment.
                             // But usually: Streak was N. We made it N+1 (or 1). Now we revert.
                             // If it was 1 (reset), previous was 0? Or N (broken)?
                             // Safe bet: Decrement by 1, but min 0.
                             if (streakDoc.streakCount > 0) {
                                 streakDoc.streakCount -= 1;
                             }
                         }
                         await streakDoc.save();
                         streakUpdated = true;
                         finalStreakCount = streakDoc.streakCount;
                     }
                 }
            }
        }

        const updatedHabit = await habit.save();
        
        res.json({
            ...updatedHabit.toObject(),
            streak: finalStreakCount,
            streakUpdated,
            lastCompletedDate: streakUpdated ? todayIST : null // Sending IST string for clarity
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

        // Initialize return variables
        let newStreak = 0; // Default if no streak doc
        let streakUpdated = false;

        // --- Smart Streak Update (Personal) ---
        // Rule: "Streak depends on ALL CURRENT habits."
        // 1. Fetch remaining active habits
        const remainingHabits = await Habit.find({ 
            user: req.user._id, 
            _id: { $ne: habit._id } 
        });

        const todayIST = getISTDate();
        const streakDoc = await Streak.findOne({ user: req.user._id });
        
        if (streakDoc) {
             newStreak = streakDoc.streakCount; // Initialize with current
             
             const allRemainingComplete = remainingHabits.length > 0 && remainingHabits.every(h => h.completions && h.completions.includes(todayIST));
             const alreadyIncremented = streakDoc.lastCompletedDateIST === todayIST;

             // Scenario A: Deleting the only blocker. All remaining are done.
             // We should RESTORE/INCREMENT the streak if it wasn't already.
             if (allRemainingComplete && !alreadyIncremented) {
                 const yesterdayIST = getYesterdayISTDate(todayIST);
                 // Verify continuity from yesterday to allow increment
                 if (streakDoc.lastCompletedDateIST === yesterdayIST || streakDoc.lastCompletedDateIST === null) {
                     streakDoc.streakCount += 1;
                     streakDoc.lastCompletedDateIST = todayIST;
                     if (!streakDoc.history.includes(todayIST)) {
                         streakDoc.history.push(todayIST);
                     }
                     await streakDoc.save();
                     newStreak = streakDoc.streakCount;
                     streakUpdated = true;
                 }
             }

             // Scenario B: Deleting a completed habit, but remaining are INCOMPLETE.
             if (remainingHabits.length === 0 && alreadyIncremented) {
                 // Revert
                 const index = streakDoc.history.indexOf(todayIST);
                 if (index > -1) streakDoc.history.splice(index, 1);
                 
                 const newLastDate = streakDoc.history.length > 0 ? streakDoc.history[streakDoc.history.length - 1] : null;
                 streakDoc.lastCompletedDateIST = newLastDate || undefined;
                 if (streakDoc.streakCount > 0) streakDoc.streakCount -= 1;
                 
                 await streakDoc.save();
                 newStreak = streakDoc.streakCount;
                 streakUpdated = true;
             }
        }
        
        // --- Group Cleanup & Streak Reversion ---
        const groupsWithHabit = await Group.find({ "memberHabits.habit": req.params.id });
        const yesterdayIST = getYesterdayISTDate(todayIST); // Utility from line 6

        for (const group of groupsWithHabit) {
            // Remove the linked habit entry
            if (group.memberHabits) {
                group.memberHabits = group.memberHabits.filter((mh: any) => mh.habit.toString() !== req.params.id);
            }
            
            // Revert Streak Logic:
            if (group.lastCompletedDateIST === todayIST) {
                if (group.groupStreak > 0) {
                    group.groupStreak -= 1;
                }
                group.lastCompletedDateIST = yesterdayIST;
            }
            
            await group.save();
        }

        await habit.deleteOne();
        res.json({ message: "Habit removed", streak: newStreak, streakUpdated });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
}
