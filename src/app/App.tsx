import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { v4 as uuidv4 } from "uuid";

import { HabitsScreen } from "./components/HabitsScreen";
import { CreateHabitScreen } from "./components/CreateHabitScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { SocialScreen } from "./components/SocialScreen";
import { BottomNav } from "./components/BottomNav";
import { LoginScreen } from "./components/LoginScreen";

type Screen = "habits" | "create" | "profile" | "social";

interface Habit {
  id: string;
  name: string;
  micro_identity: string | null;
  habit_type: string;
  goal: number;
  active_days: string[];
  created_at: string;
  completions: string[]; // List of ISO date strings (YYYY-MM-DD)
}

// Normalized for UI
interface UIHabit {
  id: string;
  name: string;
  micro_identity: string | null;
  goal: number;
  completed_today: boolean;
}

const STORAGE_KEY_HABITS = "habit-tracker-habits";
const STORAGE_KEY_SESSION = "habit-tracker-session";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [currentScreen, setCurrentScreen] = useState<Screen>("habits");
  const [habits, setHabits] = useState<UIHabit[]>([]);

  /* ---------------------------
     AUTH SESSION (LOCAL STORAGE)
  ---------------------------- */
  useEffect(() => {
    // Check for existing session
    const storedSession = localStorage.getItem(STORAGE_KEY_SESSION);
    if (storedSession) {
      setSession(JSON.parse(storedSession));
    }
    setAuthLoading(false);
  }, []);

  const handleLogin = (user: any) => {
    setSession(user);
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
  };


  /* ---------------------------
     LOAD HABITS
  ---------------------------- */
  useEffect(() => {
    if (!session) return;

    const loadHabits = () => {
      const stored = localStorage.getItem(STORAGE_KEY_HABITS);
      const allHabits: Habit[] = stored ? JSON.parse(stored) : [];
      const today = new Date().toISOString().slice(0, 10);

      // Filter habits (could implement user-specific filtering if needed)
      // For now, assuming single user on local device or shared
      
      const normalized: UIHabit[] = allHabits.map((h) => ({
        id: h.id,
        name: h.name,
        micro_identity: h.micro_identity,
        goal: h.goal,
        completed_today: h.completions.includes(today),
      }));

      setHabits(normalized);
    };

    loadHabits();
  }, [session, currentScreen]); // Reload when screen changes (e.g. back from create)


  /* ---------------------------
     CREATE HABIT
  ---------------------------- */
  const handleCreateHabit = async (habitData: any): Promise<void> => {
    // New Habit Object
    const newHabit: Habit = {
      id: uuidv4(),
      name: habitData.name,
      micro_identity: habitData.microIdentity,
      habit_type: habitData.type,
      goal: habitData.goal,
      active_days: habitData.days,
      created_at: new Date().toISOString(),
      completions: [],
    };

    // Save to Local Storage
    const stored = localStorage.getItem(STORAGE_KEY_HABITS);
    const allHabits: Habit[] = stored ? JSON.parse(stored) : [];
    allHabits.push(newHabit);
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(allHabits));

    setCurrentScreen("habits");
  };


  /* ---------------------------
     COMPLETE HABIT (TODAY)
  ---------------------------- */
  const handleCompleteHabit = async (habitId: string): Promise<void> => {
    const today: string = new Date().toISOString().slice(0, 10);
    
    const stored = localStorage.getItem(STORAGE_KEY_HABITS);
    let allHabits: Habit[] = stored ? JSON.parse(stored) : [];

    allHabits = allHabits.map(h => {
        if (h.id === habitId) {
            // Avoid duplicates
            if (!h.completions.includes(today)) {
                return { ...h, completions: [...h.completions, today] };
            }
        }
        return h;
    });

    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(allHabits));
    
    // Update local state immediately
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, completed_today: true } : h));
  };

  /* ---------------------------
     AUTH GATE
  ---------------------------- */
  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-white">
        Loading…
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3d2817] to-[#1a1410] text-white overflow-x-hidden">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
        <main className="flex-1 pb-20 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentScreen === "habits" && (
              <motion.div
                key="habits"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <HabitsScreen
                  habits={habits}
                  onCompleteHabit={handleCompleteHabit}
                  onNavigate={setCurrentScreen}
                />
              </motion.div>
            )}

            {currentScreen === "create" && (
              <motion.div key="create">
                <CreateHabitScreen
                  onBack={() => setCurrentScreen("habits")}
                  onCreate={handleCreateHabit}
                />
              </motion.div>
            )}

            {currentScreen === "profile" && (
              <motion.div key="profile">
                <ProfileScreen onNavigate={setCurrentScreen} />
              </motion.div>
            )}

            {currentScreen === "social" && (
              <motion.div key="social">
                <SocialScreen onNavigate={setCurrentScreen} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <BottomNav
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
        />
        

      </div>
    </div>

  );
}
