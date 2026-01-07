import {
  ChevronLeft,
  Bell,
  UserPlus,
  LogOut,
  Trash2,
  ChevronRight,
  Pencil,
  Check,
} from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import { useEffect, useState } from "react";

type Screen = "habits" | "create" | "profile" | "social";

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void;
  isModal?: boolean;
  onClose?: () => void;
  updateSession?: (updatedUser: any) => void;
}

interface Profile {
  id: string;
  display_name: string;
  username: string | null;
  email?: string;
  token?: string;
  friendCode?: string;
}

const STORAGE_KEY_SESSION = "habit-tracker-session";
const STORAGE_KEY_HABITS = "habit-tracker-habits";

export function ProfileScreen({ onNavigate, isModal = false, onClose, updateSession }: ProfileScreenProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
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

  /* ---------------------------
     EDIT DISPLAY NAME
  ---------------------------- */
  const handleStartEdit = () => {
    if (!profile) return;
    setEditName(profile.display_name);
    setIsEditing(true);
  };

  const handleSaveName = async () => {
    if (!profile || !editName.trim()) return;

    try {
      // 1. Optimistic Update (Local)
      const updatedProfile = { ...profile, display_name: editName.trim() };
      setProfile(updatedProfile);
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedProfile));
      
      // Update parent session explicitly if function provided
      if (updateSession) {
        updateSession(updatedProfile);
      }

      setIsEditing(false);

      // 2. API Update (Backend)
      if (profile.token) {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${profile.token}`,
            },
            body: JSON.stringify({ displayName: editName.trim() }),
        });

        if (!res.ok) {
            console.error("Failed to update profile on server");
            // Optionally revert local change or show error
        } else {
             const data = await res.json();
             // Update with server response to be sure (sync source of truth)
             // We need to map server response fields to frontend Profile shape if different
             // Server returns: { _id, username, displayName, email, token }
             const newProfile = {
                 ...updatedProfile,
                 display_name: data.displayName,
                 username: data.username,
                 email: data.email,
                 // Ensure we keep the token if server returns a new one or use old
                 token: data.token || profile.token, 
             };
             setProfile(newProfile);
             localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newProfile));
        }
      }
    } catch (error) {
        console.error("Error updating profile:", error);
    }
  };

  if (!profile) return null;

  const profileContent = (
    <div className={!isModal ? "min-h-screen" : ""}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-6">
        <button
          onClick={isModal && onClose ? onClose : () => onNavigate("habits")}
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
            <button 
              onClick={isEditing ? handleSaveName : handleStartEdit}
              className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#1a1410] transition-colors ${
                isEditing ? "bg-green-500 hover:bg-green-600" : "bg-[#ff5722] hover:bg-[#ff6b3d]"
              }`}
            >
              {isEditing ? (
                <Check size={14} className="text-white" />
              ) : (
                <Pencil size={14} className="text-white" />
              )}
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-1">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                }}
                className="bg-transparent border-b border-[#ff5722] text-2xl font-bold text-center focus:outline-none text-white w-full"
                autoFocus
              />
            ) : (
              profile.display_name
            )}
          </h2>
          <p className="text-[#8a7a6e] mb-2">
            @{profile.username ?? "user"}
          </p>
          
          {/* Friend Code */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#2a1f19] rounded-lg border border-[#3d2f26]">
            <span className="text-xs text-[#8a7a6e] font-mono">Friend Code:</span>
            <span className="text-sm font-mono text-[#ff5722] font-semibold">
              {profile.friendCode || "HABIT-XXXXXX"}
            </span>
          </div>
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
              className="w-full flex items-center justify-between p-4 hover:bg-[#3d2f26]">
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

  if (isModal) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center px-5"
        onClick={onClose}
      >
        {/* Backdrop with blur */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-lg" />
        
        {/* Modal Content */}
        <div 
          className="relative w-full max-w-md bg-gradient-to-b from-[#3d2817] to-[#1a1410] rounded-3xl shadow-2xl max-h-[75vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onClick={(e) => e.stopPropagation()}
        >
          {profileContent}
        </div>
      </div>
    );
  }

  return profileContent;
}
