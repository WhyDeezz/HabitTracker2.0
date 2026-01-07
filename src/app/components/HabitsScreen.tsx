import { Flame, Menu, Plus } from "lucide-react";
import { motion } from "motion/react";
import{ HabitCard } from "./HabitCard";
import { useMemo, useState } from "react";
import { ProfileScreen } from "./ProfileScreen";

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
  userName?: string; // Added
  onCompleteHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
  onNavigate: (screen: "habits" | "create" | "profile" | "social") => void;
  updateSession?: (updatedUser: any) => void;
}

export function HabitsScreen({
  habits,
  userName,
  onCompleteHabit,
  onDeleteHabit,
  onNavigate,
  updateSession,
}: HabitsScreenProps) {
  // Select a random quote only once on mount
  const currentQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MENTAL_MODELS.length);
    return MENTAL_MODELS[randomIndex];
  }, []);

  const streakDays = 12; // replace later with real streak logic
  const hasIncompleteHabits = habits.some((h) => !h.completed_today);
  const remainingCount = habits.filter((h) => !h.completed_today).length;

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateString = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="px-5 pt-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 shadow-sm border-2 border-[#2a1f19]" />
          <div>
            <p className="text-sm text-[#b5a79a] font-medium mb-0.5">Welcome back,</p>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {userName || 'Guest'} 
              <span className="animate-pulse">👋</span>
            </h1>
          </div>
        </div>
        <button
          onClick={() => setShowProfileModal(true)}
          className="p-3 hover:bg-[#2a1f19] rounded-xl transition-all active:scale-95 border border-transparent hover:border-[#3d2f26]"
        >
          <Menu size={24} className="text-[#b5a79a]" />
        </button>
      </div>

      {/* ... (Date Display, Streak, Weekly Calendar, Habits, Add Habit unchanged) ... */}

      {/* Date Display */}
      <div className="mb-8">
        <p className="text-[#ff5722] text-md font-medium tracking-wide">
          {dayName} ~ {dateString}
        </p>
      </div>

      {/* Streak */}
      <div className="bg-[#2a1f19] rounded-3xl border border-[#3d2f26] p-6 mb-8 shadow-lg shadow-black/20 flex flex-col items-center">
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
        <h1 className="text-3xl font-bold mb-2 text-white">{streakDays} Day Streak</h1>
        <p className="text-[#b5a79a]">Keep the fire burning!</p>
      </div>

      {/* Weekly Calendar */}
      <div className="bg-[#2a1f19] rounded-3xl border border-[#3d2f26] p-5 mb-8 shadow-lg shadow-black/20">
        <h3 className="text-xs font-semibold text-[#b5a79a] uppercase tracking-wider mb-4 ml-1">This Week</h3>
        <div className="flex justify-between items-center">
          {(() => {
            const current = new Date();
            const currentDay = current.getDay(); // 0-6
            const startOfWeek = new Date(current);
            startOfWeek.setDate(current.getDate() - currentDay); // Assuming Sunday start

            return Array.from({ length: 7 }).map((_, i) => {
              const date = new Date(startOfWeek);
              date.setDate(startOfWeek.getDate() + i);
              const isToday = date.getDate() === current.getDate() && 
                            date.getMonth() === current.getMonth();
              const dateNum = date.getDate();
              const dayInitial = date.toLocaleDateString('en-US', { weekday: 'narrow' });

              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className={`text-xs font-medium ${isToday ? 'text-orange-500' : 'text-[#8a7a6e]'}`}>
                    {dayInitial}
                  </span>
                  <div 
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all
                      ${isToday 
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/40' 
                        : 'bg-[#2a1f19] text-[#b5a79a] border border-[#3d2f26]'
                      }`}
                  >
                    {dateNum}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Today */}
      {habits.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Today's Focus</h2>
          <span className="text-sm text-[#ff5722]">
            {remainingCount} Remaining
          </span>
        </div>
      )}

      {/* Habits */}
      <div className="space-y-4 mb-8">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-4">
            <span className="text-4xl filter drop-shadow-lg">✨</span>
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-white">Start your journey</h3>
              <p className="text-sm text-[#b5a79a] max-w-[200px] mx-auto">
                Add your first daily habit to begin building your streak
              </p>
            </div>
          </div>
        ) : (
          habits.map((habit) => (
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
              onDelete={() => onDeleteHabit(habit.id)}
            />
          ))
        )}
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
        <div className="bg-gradient-to-br from-orange-500/10 to-[#2a1f19] rounded-2xl p-6 border border-orange-500/20 relative overflow-hidden shadow-lg shadow-black/20">
          <div className="absolute -top-4 -right-4 text-orange-500/10 rotate-12">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
               <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9.01703C7.91246 16 7.01703 16.8954 7.01703 18L7.01703 21H5.01703V18C5.01703 15.7909 6.80789 14 9.01703 14H12.017C14.2262 14 16.017 15.7909 16.017 18V21H14.017ZM19.017 10L19.017 13C19.017 14.1046 18.1216 15 17.017 15H14.017C12.9125 15 12.017 14.1046 12.017 13V10H10.017V13C10.017 15.2091 11.8079 17 14.017 17H17.017C19.2262 17 21.017 15.2091 21.017 13V10H19.017ZM7.01703 10L7.01703 13C7.01703 14.1046 6.1216 15 5.01703 15H2.01703C0.912458 15 0.0170288 14.1046 0.0170288 13V10H2.01703V13C2.01703 14.6569 3.36017 16 5.01703 16H6.18873C6.70054 16.6346 6.82855 17.5144 6.50571 18.2676L6.01703 19.4079L7.85243 20.1944L8.34111 19.0541C9.07065 17.3518 8.79051 15.3415 7.55835 13.9113L7.01703 13.282V10Z" />
            </svg>
          </div>
          
          <div className="relative z-10">
             <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-400 text-xs font-medium rounded-full mb-4 border border-orange-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
              {currentQuote.category}
            </span>
            <p className="text-xl font-serif italic leading-relaxed mb-2 text-white/90">
              "{currentQuote.text}"
            </p>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileScreen 
          onNavigate={onNavigate}
          isModal={true}
          onClose={() => setShowProfileModal(false)}
          updateSession={updateSession}
        />
      )}
    </div>
  );
}
