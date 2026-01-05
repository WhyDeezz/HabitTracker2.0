import {
  ChevronLeft,
  Bell,
  UserPlus,
  LogOut,
  Trash2,
  ChevronRight,
  Pencil,
} from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import { useEffect, useState } from "react";

type Screen = "habits" | "create" | "profile" | "social";

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface Profile {
  id: string;
  display_name: string;
  username: string | null;
  email?: string;
}

const STORAGE_KEY_SESSION = "habit-tracker-session";
const STORAGE_KEY_HABITS = "habit-tracker-habits";

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);

  /* ---------------------------
     LOAD PROFILE + STREAK (MOCK)
  ---------------------------- */
  useEffect(() => {
    // 1. Load User Session
    const storedSession = localStorage.getItem(STORAGE_KEY_SESSION);
    if (storedSession) {
      setProfile(JSON.parse(storedSession));
    }

    // 2. Calculate Mock Streak (Simple logic: if verified active)
    // For a real app, calculate based on completions.
    setStreak(3); 
  }, []);

  /* ---------------------------
     LOGOUT
  ---------------------------- */
  const handleLogout = (): void => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    window.location.reload(); // Simple reload to reset state/auth guard
  };

  /* ---------------------------
     DELETE ACCOUNT
  ---------------------------- */
  const handleDeleteAccount = (): void => {
    const confirmed = window.confirm(
      "This will permanently delete your local data. Continue?"
    );
    if (!confirmed) return;

    localStorage.clear();
    window.location.reload();
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-6">
        <button
          onClick={() => onNavigate("habits")}
          className="p-2 hover:bg-[#2a1f19] rounded-lg transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">Profile & Settings</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#ff5722] rounded-full flex items-center justify-center border-2 border-[#1a1410]">
              <Pencil size={14} className="text-white" />
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-1">
            {profile.display_name}
          </h2>
          <p className="text-[#8a7a6e]">
            @{profile.username ?? "user"}
          </p>
        </div>

        {/* Current Streak */}
        <div className="bg-gradient-to-br from-[#ff5722] to-[#ff6b3d] rounded-2xl p-6 mb-6 text-center">
          <p className="text-sm text-white/80 mb-2 uppercase tracking-wide">
            Current Streak
          </p>
          <p className="text-5xl font-bold mb-2">{streak}</p>
          <p className="text-white/90">Days on fire 🔥</p>
        </div>

        {/* Preferences */}
        <div className="mb-6">
          <h3 className="text-xs text-[#8a7a6e] uppercase tracking-wide mb-3 px-1">
            Preferences
          </h3>
          <div className="bg-[#2a1f19] rounded-2xl overflow-hidden divide-y divide-[#3d2f26]">
            <div className="w-full flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ff5722]/20 flex items-center justify-center">
                  <Bell size={20} className="text-[#ff5722]" />
                </div>
                <span>Push Notifications</span>
              </div>
              <Switch.Root
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                className="w-11 h-6 bg-[#3d2f26] rounded-full relative data-[state=checked]:bg-[#ff5722]"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>

            <button className="w-full flex items-center justify-between p-4 hover:bg-[#3d2f26]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <UserPlus size={20} className="text-green-500" />
                </div>
                <span>Invite a friend</span>
              </div>
              <ChevronRight size={20} className="text-[#8a7a6e]" />
            </button>
          </div>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-xs text-[#8a7a6e] uppercase tracking-wide mb-3 px-1">
            Account
          </h3>
          <div className="bg-[#2a1f19] rounded-2xl overflow-hidden divide-y divide-[#3d2f26]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-[#3d2f26]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <LogOut size={20} className="text-blue-500" />
                </div>
                <span>Logout</span>
              </div>
              <ChevronRight size={20} className="text-[#8a7a6e]" />
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-between p-4 hover:bg-[#3d2f26]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 size={20} className="text-red-500" />
                </div>
                <span className="text-red-500">Delete data</span>
              </div>
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-[#8a7a6e]">Accountability Board v1.0.6 (Local)</p>
        </div>
      </div>
    </div>
  );
}
