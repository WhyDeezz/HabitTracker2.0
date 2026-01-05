import { Flame, Settings, Plus } from "lucide-react";
import { motion } from "motion/react";
import { HabitCard } from "./HabitCard";
import { useMemo } from "react";

export interface Habit {
  id: string;
  name: string;
  micro_identity: string | null;
  goal: number;
  completed_today: boolean;
}

interface Quote {
  text: string;
  category: string;
}

const MENTAL_MODELS: Quote[] = [
  // Category A: The "Elastic" mindset
  { text: "Bad day? Just do the Mini version. One pushup is better than zero.", category: "Elastic Mindset" },
  { text: "Don't break the chain. If you can't run a mile, walk a block.", category: "Elastic Mindset" },
  { text: "Focus on the identity, not the outcome. Today, you are a person who doesn't miss.", category: "Elastic Mindset" },
  { text: "A 10-minute workout beats the 60-minute workout you didn't do.", category: "Elastic Mindset" },
  
  // Category B: The "Two-Day Rule"
  { text: "Missing once is an accident. Missing twice is the start of a new habit. Don't miss today.", category: "Recovery" },
  { text: "Your streak isn't a number; it's a momentum. If it falls to 0, pick it up immediately.", category: "Recovery" },
  { text: "Life happens. Use your Streak Freeze wisely, but never miss two days in a row.", category: "Recovery" },
  
  // Category C: Habit Stacking (Quote 8 removed as requested)
  { text: "Design your environment. Make the cue for your habit impossible to miss.", category: "Habit Stacking" },
  { text: "Small habits + Consistency + Time = Radical Transformation.", category: "Habit Stacking" },
  
  // Category D: Social Accountability
  { text: "Your friends are watching. Show them what showing up looks like.", category: "Social Accountability" },
  { text: "Accountability is the shortcut to willpower. Check in so they don't have to nudge you.", category: "Social Accountability" },
  { text: "A shared habit is twice as likely to stick. Invite a 'Streak Partner' today.", category: "Social Accountability" },
];

interface HabitsScreenProps {
  habits: Habit[];
  onCompleteHabit: (id: string) => void;
  onNavigate: (screen: "habits" | "create" | "profile" | "social") => void;
}

export function HabitsScreen({
  habits,
  onCompleteHabit,
  onNavigate,
}: HabitsScreenProps) {
  // Select a random quote only once on mount
  const currentQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MENTAL_MODELS.length);
    return MENTAL_MODELS[randomIndex];
  }, []);

  const streakDays = 12; // replace later with real streak logic
  const hasIncompleteHabits = habits.some((h) => !h.completed_today);
  const remainingCount = habits.filter((h) => !h.completed_today).length;

  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
          <div>
            <p className="text-sm text-[#b5a79a]">Welcome back,</p>
            <p className="font-medium">Alex</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate("profile")}
          className="p-2 hover:bg-[#2a1f19] rounded-lg transition-colors"
        >
          <Settings size={24} className="text-[#b5a79a]" />
        </button>
      </div>

      {/* Streak */}
      <div className="flex flex-col items-center mb-8">
        <motion.div
          className="mb-4"
          animate={
            hasIncompleteHabits
              ? { scale: [1, 1.05, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flame size={64} className="text-[#ff5722]" fill="#ff5722" />
        </motion.div>
        <h1 className="text-3xl font-bold mb-2">{streakDays} Day Streak</h1>
        <p className="text-[#b5a79a]">Keep the fire burning!</p>
      </div>

      {/* Today */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Today's Focus</h2>
        <span className="text-sm text-[#ff5722]">
          {remainingCount} Remaining
        </span>
      </div>

      {/* Habits */}
      <div className="space-y-4 mb-8">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={{
              id: habit.id,
              name: habit.name,
              microIdentity: habit.micro_identity ?? "",
              progress: habit.completed_today ? 1 : 0,
              goal: habit.goal,
              completed: habit.completed_today,
            }}
            onComplete={() => onCompleteHabit(habit.id)}
          />
        ))}
      </div>

      {/* Add Habit */}
      <button
        onClick={() => onNavigate("create")}
        className="w-full bg-[#2a1f19] hover:bg-[#3d2f26] border border-[#3d2f26] rounded-2xl p-4 flex items-center justify-center gap-2 transition-colors mb-6"
      >
        <Plus size={20} className="text-[#ff5722]" />
        <span className="text-[#b5a79a]">Add New Habit</span>
      </button>

      {/* Mental Models */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Daily Wisdom</h2>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-[#2a1f19] rounded-2xl p-6 border border-orange-500/30 relative overflow-hidden shadow-lg shadow-orange-900/20">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Flame size={48} className="text-orange-500" />
          </div>
          
          <div className="relative z-10">
             <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full mb-3 border border-orange-500/20">
              {currentQuote.category}
            </span>
            <p className="text-xl font-medium leading-relaxed mb-2 text-white">
              "{currentQuote.text}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
