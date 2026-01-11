import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { v4 as uuidv4 } from "uuid";

import { HabitsScreen } from "./components/HabitsScreen";
import { CreateHabitScreen } from "./components/CreateHabitScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { SocialScreen } from "./components/SocialScreen";
import { BottomNav } from "./components/BottomNav";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { LoginScreen } from "./components/LoginScreen";

type Screen = "habits" | "create" | "profile" | "social";

interface Habit {
  _id: string; // Changed from id to _id for MongoDB compatibility
  name: string;
  microIdentity: string | null; // Mapped from backend 'microIdentity'
  habit_type: string;
  goal: number;
  activeDays: number[]; // Matches backend activeDays [1..7]
  created_at: string;
  completions: string[]; // List of ISO date strings (YYYY-MM-DD)
  visibility?: 'public' | 'private';
  reminderTime?: string | null; // Backend uses reminderTime (camelCase)
  duration: number; // Duration in days
}

// Normalized for UI
interface UIHabit {
  id: string;
  name: string;
  micro_identity: string | null;
  goal: number;
  completed_today: boolean;
  reminder_time?: string | null;
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
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);

  useEffect(() => {
    // Check for existing session
    const storedSession = localStorage.getItem(STORAGE_KEY_SESSION);
    if (storedSession) {
      setSession(JSON.parse(storedSession));
    }
    
    // Check onboarding status
    const hasOnboarded = localStorage.getItem("HAS_COMPLETED_ONBOARDING");
    if (hasOnboarded === "true") {
      setOnboardingComplete(true);
    }
    
    setAuthLoading(false);
  }, []);

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleOnboardingComplete = (target: "login" | "signup") => {
    localStorage.setItem("HAS_COMPLETED_ONBOARDING", "true");
    setAuthMode(target);
    setOnboardingComplete(true);
  };

  const handleLogin = (user: any) => {
    setSession(user);
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
  };

  const updateSession = (updatedUser: any) => {
    const newSession = { ...session, ...updatedUser };
    setSession(newSession);
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newSession));
  };


  /* ---------------------------
     LOAD HABITS
  ---------------------------- */
  useEffect(() => {
    if (!session?.token) return;

    const loadHabits = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/habits', {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
        const allHabits: Habit[] = await res.json();
        // FIX: Use local date parts to avoid UTC shift problems
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        
        // Filter by Active Days (1=Mon ... 7=Sun)
        const currentDayIndex = now.getDay(); // 0 (Sun) to 6 (Sat)
        const todayNum = currentDayIndex === 0 ? 7 : currentDayIndex;

        const todaysHabits = allHabits.filter(h => 
            h.activeDays && h.activeDays.includes(todayNum)
        );

        const normalized: UIHabit[] = todaysHabits.map((h) => ({
          id: h._id, // MongoDB uses _id
          name: h.name,
          micro_identity: h.microIdentity,
          goal: h.goal,
          completed_today: h.completions.includes(today),
          reminder_time: h.reminderTime, // Map reminderTime from backend
        }));

        setHabits(normalized);
      } catch (err) {
        console.error("Failed to load habits", err);
      }
    };

    loadHabits();
  }, [session, currentScreen]); // Reload when screen changes (e.g. back from create)

  /* ---------------------------
     HABIT REMINDER NOTIFICATIONS
  ---------------------------- */
  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check reminders every minute
    const checkReminders = () => {
      if (!session || habits.length === 0) return;
      
      const now = new Date();
      const currentHour = now.getHours(); // 0-23
      const currentMinute = now.getMinutes();
      // Use local date format for "today" comparison
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;


      habits.forEach(habit => {
        // Check if habit has a reminder set
        if (habit.reminder_time && !habit.completed_today) {

          // Parse 12-hour format (e.g., "12:46 AM" or "13:30")
          const timeStr = habit.reminder_time.trim();
          let reminderHour: number;
          let reminderMinute: number;
          
          if (timeStr.includes('AM') || timeStr.includes('PM')) {
            // 12-hour format
            const isPM = timeStr.includes('PM');
            const [time] = timeStr.split(' ');
            const [hourStr, minuteStr] = time.split(':');
            let hour = parseInt(hourStr);
            const minute = parseInt(minuteStr);
            
            // Convert to 24-hour format
            if (isPM && hour !== 12) {
              hour += 12;
            } else if (!isPM && hour === 12) {
              hour = 0;
            }
            
            reminderHour = hour;
            reminderMinute = minute;
          } else {
            // Already in 24-hour format
            const [hourStr, minuteStr] = timeStr.split(':');
            reminderHour = parseInt(hourStr);
            reminderMinute = parseInt(minuteStr);
          }

          
          // Check if current time matches reminder time
          if (currentHour === reminderHour && currentMinute === reminderMinute) {

            // Check if we haven't already notified today (prevent multiple notifications)
            const lastNotifiedKey = `lastNotified_${habit.id}`;
            const lastNotified = localStorage.getItem(lastNotifiedKey);
            

            if (lastNotified !== today) {
              // Show notification
              if ('Notification' in window && Notification.permission === 'granted') {

                try {
                  const notification = new Notification('Time for your habit! 🔥', {
                    body: `${habit.name} - Let's keep the streak going!`,
                    icon: '/icon-192x192.png',
                    badge: '/icon-192x192.png',
                    tag: habit.id,
                    requireInteraction: false,
                    silent: false
                  });

                  // Mark as notified today
                  localStorage.setItem(lastNotifiedKey, today);

                } catch (error) {

                }
              } else {

              }
            } else {

            }
          }
        }
      });
    };

    // Check immediately
    checkReminders();

    // Then check every minute
    const intervalId = setInterval(checkReminders, 60000); // 60000ms = 1 minute

    return () => clearInterval(intervalId);
  }, [habits, session]);

  /* ---------------------------
     RELOAD SESSION (for profile updates)
  ---------------------------- */
  useEffect(() => {
    // Reload session from localStorage when switching screens
    // This ensures profile changes (like display_name) are reflected
    const storedSession = localStorage.getItem(STORAGE_KEY_SESSION);
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      // Only update if changed (avoid infinite loop)
      if (JSON.stringify(parsedSession) !== JSON.stringify(session)) {
        setSession(parsedSession);
      }
    }
  }, [currentScreen]); // Reload when screen changes


  /* ---------------------------
     CREATE HABIT
  ---------------------------- */
  const handleCreateHabit = async (habitData: any): Promise<void> => {
    try {
      const res = await fetch('http://localhost:5000/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(habitData),
      });
      
      if (res.ok) {
         const data = await res.json();
         // Update session streak/lastCompletedDate if returned
         if (data.streak !== undefined && session) {
             const updatedSession = {
                 ...session,
                 streak: data.streak,
                 lastCompletedDate: data.lastCompletedDate
             };
             updateSession(updatedSession);
         }
         setCurrentScreen("habits");
      } else {
        console.error("Failed to create habit");
      }
    } catch (err) {
      console.error("Error creating habit", err);
    }
  };


  /* ---------------------------
     COMPLETE HABIT (TODAY)
  ---------------------------- */
  const handleCompleteHabit = async (habitId: string): Promise<void> => {
    // FIX: Use local date parts to avoid UTC shift problems (toISOString uses UTC)
    // This aligns better with "Today" for the user's device time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    // Optimistic update
    setHabits(prev => 
        prev.map(h => h.id === habitId ? { ...h, completed_today: true } : h)
    );

    try {
        // First get the habit to append completion
        // ideally backend handles "toggle completion for today" logic to be race-condition safe
        // For now, let's fetch, append, and update.
        // OR, we can just send the new completions list.
        // BETTER: Let the backend handle logic?
        // CURRENT CONTROLLER: expects "completions" array update.
        
        // Let's implement a quick fetch-modify-save pattern for now or just append blindly?
        // Safest with current controller:
        const token = session.token;
        const res = await fetch(`http://localhost:5000/api/habits?id=${habitId}`, /* This is GET all, need GET ONE or just filter from state? */
        /* Actually we already have the state? No, we have UIHabit */
        /* Let's construct the update. Ideally we need the full habit. */
        /* Let's simplify: WE need to change the backend to support "mark complete" endpoint OR just push the date. */
        /* Given the constraints, let's assume we can push the current date to the 'completions' array via PUT */
        
        /* WAIT: Current controller updateHabit replaces the completions array. */
        /* So we need the OLD completions array. */
        /* Quick fix: Add specific 'toggle-completion' endpoint or logic to controller later? */
        /* For now: read from server, update, write back. */
        
         {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Since we don't have GET /:id in the list exposed to UI (we used GET / for all), 
        // we can find it if we kept full habits in state. But we only kept UIHabit.
        // Let's fetch the list again to find it is inefficient but safe.
        // Actually, let's just make the Update controller smarter in a further step or accept that we need to fetch first.
        
        // Simpler for this step: Do nothing backend side? No, must persist.
        // Let's re-fetch all habits to find the one we need?
        
        const allRes = await fetch('http://localhost:5000/api/habits', {
             headers: { Authorization: `Bearer ${token}` }
        });
        const allHabits: Habit[] = await allRes.json();
        const targetHabit = allHabits.find((h:any) => h._id === habitId);
        
        if (targetHabit && !targetHabit.completions.includes(today)) {
             const updatedCompletions = [...targetHabit.completions, today];
             const updateRes = await fetch(`http://localhost:5000/api/habits/${habitId}`, {
                 method: 'PUT',
                 headers: {
                     'Content-Type': 'application/json',
                     Authorization: `Bearer ${token}`
                 },
                 body: JSON.stringify({ completions: updatedCompletions })
             });
             
              if (updateRes.ok) {
                  const data = await updateRes.json();
                  // Update session streak and lastCompletedDate if returned
                  if (data.streak !== undefined && session) {
                      const updatedSession = {
                        ...session,
                        streak: data.streak,
                        lastCompletedDate: data.lastCompletedDate || session.lastCompletedDate
                      };
                      updateSession(updatedSession);
                  }
              }
        }

    } catch (err) {
        console.error("Failed to complete habit", err);
        // Revert optimistic update?
        // For now, ignore.
    }
  };

  /* ---------------------------
     DELETE HABIT
  ---------------------------- */
  const handleDeleteHabit = async (habitId: string) => {
      try {
          const res = await fetch(`http://localhost:5000/api/habits/${habitId}`, {
              method: 'DELETE',
              headers: {
                  Authorization: `Bearer ${session.token}`
              }
          });
          
          if (res.ok) {
              const data = await res.json();
              setHabits(prev => prev.filter(h => h.id !== habitId));
              // Update session streak if returned and changed
              if (data.streak !== undefined && session) {
                   updateSession({ 
                       ...session, 
                       streak: data.streak,
                       lastCompletedDate: data.lastCompletedDate 
                   });
              }
          }
      } catch (err) {
          console.error("Failed to delete habit", err);
      }
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
    if (!onboardingComplete) {
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }
    return <LoginScreen onLogin={handleLogin} initialMode={authMode} />;
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
                    userName={session?.display_name || session?.username}
                    onCompleteHabit={handleCompleteHabit}
                    onDeleteHabit={handleDeleteHabit}
                    onNavigate={setCurrentScreen}
                    updateSession={updateSession}
                    streak={session?.streak || 0}
                    lastCompletedDate={session?.lastCompletedDate}
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
                <ProfileScreen 
                    onNavigate={setCurrentScreen} 
                    updateSession={updateSession}
                    streak={session?.streak || 0}
                />
              </motion.div>
            )}

            {currentScreen === "social" && (
              <motion.div key="social">
                <SocialScreen 
                    onNavigate={setCurrentScreen} 
                    habits={habits}
                    streak={session?.streak || 0}
                />
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
