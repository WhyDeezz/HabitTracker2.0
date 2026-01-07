import { useState, useEffect } from "react";
import { UserPlus, MoreVertical, Check, X, Menu, Pencil, Users, User, Search, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as Switch from "@radix-ui/react-switch";

type Screen = "habits" | "create" | "profile" | "social";

interface SocialScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface Friend {
  id: string;
  name: string;
  emoji: string;
  streak: number;
  isOnline: boolean;
  friendCode: string;
}

interface Group {
  id: string;
  name: string;
  avatar: string;
  daysToGoal: number;
  description: string;
}

interface FriendToAdd {
  id: string;
  name: string;
  lastActive: string;
  avatar: string;
}

export function SocialScreen({ onNavigate }: SocialScreenProps) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [showCreateSquad, setShowCreateSquad] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const [searchedFriend, setSearchedFriend] = useState<{name: string; friendCode: string; streak: number} | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [squadName, setSquadName] = useState("");
  const [trackingType, setTrackingType] = useState<"shared" | "individual">("shared");
  const [duration, setDuration] = useState(30);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<{display_name: string; friendCode?: string} | null>(null);

  // Load user profile
  useEffect(() => {
    const storedSession = localStorage.getItem("habit-tracker-session");
    if (storedSession) {
      const profile = JSON.parse(storedSession);
      setUserProfile(profile);
    }
  }, []);
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "g1",
      name: "Manya B.",
      avatar: "👩‍💼",
      daysToGoal: 1,
      description: "Start a Group Streak: you're not alone. Track your habits with your accountability crew in real-time.",
    },
    {
      id: "g2",
      name: "The Gym Bros",
      avatar: "💪",
      daysToGoal: 3,
      description: "Pushing each other to new limits. 5 members crushing fitness goals together.",
    },
    {
      id: "g3",
      name: "Early Birds",
      avatar: "🌅",
      daysToGoal: 2,
      description: "Waking up at 5 AM every day. Accountability makes it easier.",
    },
    {
      id: "g4",
      name: "Study Squad",
      avatar: "📚",
      daysToGoal: 4,
      description: "Learning together, growing together. Daily study sessions with friends.",
    },
  ]);

  // Dummy data
  const dailyGoalFriends = [
    { id: "1", avatar: "👨‍💼" },
    { id: "2", avatar: "👩‍💻" },
    { id: "3", avatar: "👨‍🎨" },
  ];

  const friends: Friend[] = [
    { id: "f1", name: "Sarah J.", emoji: "👑", streak: 21, isOnline: true, friendCode: "HABIT-A3X9Z2" },
    { id: "f2", name: "Mike T.", emoji: "🔥", streak: 7, isOnline: true, friendCode: "HABIT-B7K#M1" },
  ];

  const availableFriends: FriendToAdd[] = [
    { id: "af1", name: "Sarah", lastActive: "", avatar: "👩" },
    { id: "af2", name: "James", lastActive: "", avatar: "👨" },
    { id: "af3", name: "Emily Chen", lastActive: "", avatar: "👱‍♀️" },
    { id: "af4", name: "Sarah Williams", lastActive: "", avatar: "👩‍🦰" },
    { id: "af5", name: "Marcus Johnson", lastActive: "Last active 2d ago", avatar: "👨‍🦱" },
  ];

  const currentGroup = groups[currentGroupIndex];

  const handleSwipe = (direction: number) => {
    setCurrentGroupIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return groups.length - 1;
      if (next >= groups.length) return 0;
      return next;
    });
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const selectAllFriends = () => {
    if (selectedFriends.length === availableFriends.length) {
      setSelectedFriends([]);
    } else {
      setSelectedFriends(availableFriends.map((f) => f.id));
    }
  };

  const filteredFriends = availableFriends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen px-5 pt-6 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Social</h1>
          <button
            onClick={() => setShowAddFriend(true)}
            className="flex items-center gap-2 bg-[#ff5722] hover:bg-[#ff6b3d] px-4 py-2 rounded-full transition-colors"
          >
            <UserPlus size={18} />
            <span className="text-sm font-semibold">Add Friend</span>
          </button>
        </div>

        {/* User Profile Card */}
        <div className="bg-[#2a1f19] rounded-2xl p-5 mb-4 border border-[#3d2f26]">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center border-2 border-[#1a1410]">
                <span className="text-2xl">🧑</span>
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1a1410]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg">You</p>
              <p className="text-xs text-[#8a7a6e] font-mono">{userProfile?.friendCode || "HABIT-XXXXXX"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#8a7a6e]">Today</p>
              <p className="text-lg font-bold text-[#ff5722]">3/5</p>
            </div>
          </div>
          <div className="h-2 bg-[#3d2f26] rounded-full overflow-hidden">
            <div className="h-full bg-[#ff5722]" style={{ width: "60%" }} />
          </div>
        </div>

        {/* Daily Goal */}
        <div className="bg-[#2a1f19] rounded-2xl p-5 mb-4 border border-[#3d2f26]">
          <p className="text-xs text-[#ff5722] uppercase tracking-wider mb-2 font-semibold">
            Daily Goal
          </p>
          <h2 className="text-lg font-bold mb-1">
            {dailyGoalFriends.length} friends completed all habits today
          </h2>
          <p className="text-sm text-[#8a7a6e] mb-3">
            Tap to see who crushed it!
          </p>
          <div className="flex gap-2">
            {dailyGoalFriends.map((friend) => (
              <div
                key={friend.id}
                className="relative w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-lg border-2 border-[#1a1410]"
              >
                {friend.avatar}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#1a1410]">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Group Shared Streak - Swipeable Carousel */}
        <div className="bg-[#2a1f19] rounded-2xl p-5 mb-4 border border-[#3d2f26] relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-[#8a7a6e] uppercase tracking-wider font-semibold">
              Your Squads
            </p>
            <button
              onClick={() => setShowCreateSquad(true)}
              className="text-xs text-[#ff5722] font-semibold px-3 py-1.5 bg-[#ff5722]/10 rounded-full border border-[#ff5722]/20 hover:bg-[#ff5722]/20 transition-colors"
            >
              Create Squad
            </button>
          </div>

          {/* Carousel Container with Peek */}
          <div className="relative -mx-5 px-5 overflow-visible">
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {groups.map((group, index) => (
                <motion.div
                  key={group.id}
                  className="flex-shrink-0 w-[85%] snap-center"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-[#1a1410] rounded-xl p-4 border border-[#3d2f26]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center border-2 border-[#1a1410]">
                        <span className="text-lg">{group.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{group.name}</p>
                        <p className="text-xs text-[#ff5722]">
                          {group.daysToGoal} day{group.daysToGoal !== 1 ? 's' : ''} to 7-Day Streak! 🔥
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-[#8a7a6e] mb-3 leading-relaxed line-clamp-2">
                      {group.description}
                    </p>

                    <button 
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowGroupDetails(true);
                      }}
                      className="w-full bg-[#ff5722]/10 hover:bg-[#ff5722]/20 border border-[#ff5722]/20 text-[#ff5722] rounded-lg py-2 text-xs font-semibold transition-colors"
                    >
                      View Group
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Your Crew */}
        <div>
          <h2 className="text-xl font-bold mb-4">Your Crew</h2>
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="bg-[#2a1f19] rounded-2xl p-4 flex items-center justify-between border border-[#3d2f26] hover:border-[#ff5722]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center border-2 border-[#1a1410]">
                      <span className="text-lg">🧑</span>
                    </div>
                    {friend.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#1a1410]" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-1.5">
                      {friend.name} <span>{friend.emoji}</span>
                    </p>
                    <p className="text-xs text-[#8a7a6e] font-mono mb-0.5">{friend.friendCode}</p>
                    <p className="text-sm text-[#ff5722] flex items-center gap-1">
                      {friend.streak} Day Streak <span>🔥</span>
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-[#3d2f26] rounded-lg transition-colors">
                  <MoreVertical size={18} className="text-[#8a7a6e]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Squad Modal */}
      <AnimatePresence>
        {showCreateSquad && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 bg-gradient-to-b from-[#3d2817] to-[#1a1410] z-50 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="max-w-md mx-auto min-h-screen px-5 pt-6 pb-32">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setShowCreateSquad(false)}
                  className="p-2 hover:bg-[#2a1f19] rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
                <h1 className="text-xl font-semibold">Create Squad</h1>
                <div className="w-10" />
              </div>

              {/* Squad Name */}
              <div className="mb-6">
                <label className="block text-sm text-[#8a7a6e] mb-2 uppercase tracking-wide">
                  Squad Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={squadName}
                    onChange={(e) => setSquadName(e.target.value)}
                    placeholder="e.g., The 5AM Club"
                    className="w-full bg-[#2a1f19] border border-[#3d2f26] rounded-xl px-4 py-3 pr-12 text-white placeholder:text-[#8a7a6e] focus:outline-none focus:border-[#ff5722] transition-colors"
                  />
                  <Pencil size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ff5722]" />
                </div>
              </div>

              {/* How will you track? */}
              <div className="mb-6">
                <label className="block text-sm text-[#8a7a6e] mb-3 uppercase tracking-wide">
                  How will you track?
                </label>
                <div className="space-y-3">
                  <div
                    onClick={() => setTrackingType("shared")}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      trackingType === "shared"
                        ? "bg-[#ff5722]/10 border-[#ff5722]"
                        : "bg-[#2a1f19] border-[#3d2f26]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        trackingType === "shared" ? "bg-[#ff5722]/20" : "bg-[#3d2f26]"
                      }`}>
                        <Users size={20} className={trackingType === "shared" ? "text-[#ff5722]" : "text-[#8a7a6e]"} />
                      </div>
                      <div>
                        <p className="font-semibold">Shared Habit</p>
                        <p className="text-xs text-[#8a7a6e]">Everyone tracks the same goal</p>
                      </div>
                    </div>
                    <Switch.Root
                      checked={trackingType === "shared"}
                      onCheckedChange={(checked) => setTrackingType(checked ? "shared" : "individual")}
                      className={`w-11 h-6 rounded-full relative transition-colors ${
                        trackingType === "shared" ? "bg-[#ff5722]" : "bg-[#3d2f26]"
                      }`}
                    >
                      <Switch.Thumb className={`block w-5 h-5 bg-white rounded-full transition-transform ${
                        trackingType === "shared" ? "translate-x-[22px]" : "translate-x-0.5"
                      }`} />
                    </Switch.Root>
                  </div>

                  <div
                    onClick={() => setTrackingType("individual")}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      trackingType === "individual"
                        ? "bg-blue-500/10 border-blue-500"
                        : "bg-[#2a1f19] border-[#3d2f26]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        trackingType === "individual" ? "bg-blue-500/20" : "bg-[#3d2f26]"
                      }`}>
                        <User size={20} className={trackingType === "individual" ? "text-blue-500" : "text-[#8a7a6e]"} />
                      </div>
                      <div>
                        <p className="font-semibold">Individual Habits</p>
                        <p className="text-xs text-[#8a7a6e]">Guide supports each member's unique...</p>
                      </div>
                    </div>
                    <Switch.Root
                      checked={trackingType === "individual"}
                      onCheckedChange={(checked) => setTrackingType(checked ? "individual" : "shared")}
                      className={`w-11 h-6 rounded-full relative transition-colors ${
                        trackingType === "individual" ? "bg-blue-500" : "bg-[#3d2f26]"
                      }`}
                    >
                      <Switch.Thumb className={`block w-5 h-5 bg-white rounded-full transition-transform ${
                        trackingType === "individual" ? "translate-x-[22px]" : "translate-x-0.5"
                      }`} />
                    </Switch.Root>
                  </div>
                </div>
              </div>

              {/* How many days? */}
              <div className="mb-6">
                <label className="block text-sm text-[#8a7a6e] mb-3 uppercase tracking-wide">
                  How many days?
                </label>
                <div className="bg-[#2a1f19] border border-[#3d2f26] rounded-xl p-4">
                  <div className="relative mb-3">
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full bg-transparent text-white text-2xl font-bold focus:outline-none"
                    />
                    <Calendar size={18} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#8a7a6e]" />
                  </div>
                  <div className="flex gap-2">
                    {[7, 21, 30, 66].map((days) => (
                      <button
                        key={days}
                        onClick={() => setDuration(days)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          duration === days
                            ? "bg-[#ff5722] text-white"
                            : "bg-[#3d2f26] text-[#8a7a6e] hover:bg-[#4a3f36]"
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Who's in? */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-[#8a7a6e] uppercase tracking-wide">
                    Who's in?
                  </label>
                  <button
                    onClick={selectAllFriends}
                    className="text-sm text-[#ff5722] font-semibold"
                  >
                    Select All
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7a6e]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search friends..."
                    className="w-full bg-[#2a1f19] border border-[#3d2f26] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-[#8a7a6e] focus:outline-none focus:border-[#ff5722] transition-colors"
                  />
                </div>

                {/* Friends List */}
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {filteredFriends.map((friend) => {
                    const isSelected = selectedFriends.includes(friend.id);
                    return (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-3 bg-[#2a1f19] border border-[#3d2f26] rounded-xl hover:border-[#ff5722]/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center border-2 border-[#1a1410]">
                            <span className="text-lg">{friend.avatar}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{friend.name}</p>
                            {friend.lastActive && (
                              <p className="text-xs text-[#8a7a6e]">{friend.lastActive}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFriendSelection(friend.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-[#ff5722]"
                              : "bg-[#3d2f26] hover:bg-[#4a3f36]"
                          }`}
                        >
                          {isSelected ? (
                            <Check size={16} className="text-white" strokeWidth={3} />
                          ) : (
                            <span className="text-[#8a7a6e] text-xl leading-none">+</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Create Squad Button */}
              <button
                onClick={() => {
                  if (squadName.trim()) {
                    // Create new squad
                    const newSquad: Group = {
                      id: `g${Date.now()}`,
                      name: squadName,
                      avatar: "🚀",
                      daysToGoal: duration,
                      description: `${trackingType === "shared" ? "Shared" : "Individual"} habit tracking for ${selectedFriends.length} members. ${duration} day challenge!`,
                    };
                    
                    // Add to groups
                    setGroups([...groups, newSquad]);
                    setCurrentGroupIndex(groups.length); // Navigate to new group
                    
                    // Reset form and close modal
                    setSquadName("");
                    setTrackingType("shared");
                    setDuration(30);
                    setSelectedFriends([]);
                    setSearchQuery("");
                    setShowCreateSquad(false);
                  }
                }}
                disabled={!squadName.trim()}
                className="w-full bg-[#ff5722] hover:bg-[#ff6b3d] disabled:bg-[#3d2f26] disabled:text-[#8a7a6e] disabled:cursor-not-allowed text-white rounded-full py-4 flex items-center justify-center gap-2 transition-colors font-semibold"
              >
                Create Squad 🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Details Modal */}
      {showGroupDetails && selectedGroup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          onClick={() => setShowGroupDetails(false)}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-lg" />
          
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-md bg-gradient-to-b from-[#3d2817] to-[#1a1410] rounded-3xl shadow-2xl max-h-[75vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-6 border-b border-[#3d2f26]">
              <button
                onClick={() => setShowGroupDetails(false)}
                className="p-2 hover:bg-[#2a1f19] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
              <h1 className="text-sm font-semibold uppercase tracking-wider text-[#8a7a6e]">Group Details</h1>
              <button 
                onClick={() => setShowGroupMenu(true)}
                className="p-2 hover:bg-[#2a1f19] rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>

            <div className="px-5 py-6">
              {/* Group Header */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center border-4 border-[#1a1410]">
                    <span className="text-4xl">{selectedGroup.avatar}</span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Check size={12} strokeWidth={3} />
                    <span>3/10</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-1">{selectedGroup.name}</h2>
                <p className="text-sm text-[#8a7a6e]">Consistency is key 🔥</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#2a1f19] rounded-xl p-4 text-center border border-[#3d2f26]">
                  <p className="text-xs text-[#8a7a6e] uppercase tracking-wide mb-1">Total Streak</p>
                  <p className="text-2xl font-bold text-[#ff5722]">24 Days</p>
                </div>
                <div className="bg-[#2a1f19] rounded-xl p-4 text-center border border-[#3d2f26]">
                  <p className="text-xs text-[#8a7a6e] uppercase tracking-wide mb-1">Members</p>
                  <p className="text-2xl font-bold">4 / 10</p>
                </div>
              </div>

              {/* Squad Members */}
              <div>
                <h3 className="text-xs text-[#8a7a6e] uppercase tracking-wide mb-3">Squad Members</h3>
                <div className="space-y-2">
                  {/* You */}
                  <div className="bg-[#2a1f19] rounded-xl p-3 flex items-center justify-between border border-[#3d2f26]">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-lg font-bold border-2 border-[#1a1410]">
                          YU
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1410]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">You</p>
                        <p className="text-xs text-[#ff5722]">7 Day Streak</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>

                  {/* Alex Miller */}
                  <div className="bg-[#2a1f19] rounded-xl p-3 flex items-center justify-between border border-[#3d2f26]">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-lg font-bold border-2 border-[#1a1410]">
                          AM
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1410]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Alex Miller</p>
                        <p className="text-xs text-[#8a7a6e]">Road to Begun</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>

                  {/* Sarah Jenkins */}
                  <div className="bg-[#2a1f19] rounded-xl p-3 flex items-center justify-between border border-[#3d2f26]">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-lg font-bold border-2 border-[#1a1410]">
                          SJ
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1410]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Sarah Jenkins</p>
                        <p className="text-xs text-[#8a7a6e]">Done 21, Month</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>

                  {/* David Kim */}
                  <div className="bg-[#2a1f19] rounded-xl p-3 flex items-center justify-between border border-[#3d2f26] opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg font-bold border-2 border-[#1a1410]">
                        DK
                      </div>
                      <div>
                        <p className="font-semibold text-sm">David Kim</p>
                        <p className="text-xs text-[#8a7a6e]">Resolution Elite</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Group Menu Overlay */}
            {showGroupMenu && (
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl flex items-start justify-center pt-20 z-10"
                onClick={() => setShowGroupMenu(false)}
              >
                <div 
                  className="bg-[#2a1f19] rounded-2xl w-[90%] border border-[#3d2f26] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="w-full flex items-center gap-3 p-4 hover:bg-[#3d2f26] transition-colors border-b border-[#3d2f26]">
                    <Pencil size={18} className="text-[#8a7a6e]" />
                    <span className="text-sm">Change your habit</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 hover:bg-[#3d2f26] transition-colors border-b border-[#3d2f26]">
                    <UserPlus size={18} className="text-[#8a7a6e]" />
                    <span className="text-sm">Invite More Friends</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 hover:bg-[#3d2f26] transition-colors text-red-500">
                    <X size={18} />
                    <span className="text-sm">Leave Group</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          onClick={() => {
            setShowAddFriend(false);
            setFriendCode("");
            setSearchedFriend(null);
          }}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-lg" />
          
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-md bg-gradient-to-b from-[#3d2817] to-[#1a1410] rounded-3xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold">Add Friend</h1>
              <button
                onClick={() => {
                  setShowAddFriend(false);
                  setFriendCode("");
                  setSearchedFriend(null);
                }}
                className="p-2 hover:bg-[#2a1f19] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Friend Code Input */}
            <div className="mb-6">
              <label className="text-sm text-[#8a7a6e] mb-2 block">Enter Friend Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  placeholder="HABIT-XXXXXX"
                  className="flex-1 bg-[#2a1f19] border border-[#3d2f26] rounded-xl px-4 py-3 text-white placeholder:text-[#8a7a6e] focus:outline-none focus:border-[#ff5722] font-mono"
                />
                <button
                  onClick={() => {
                    // Simulate search - in real app, this would call an API
                    if (friendCode.trim()) {
                      // Mock search result
                      setSearchedFriend({
                        name: "John Doe",
                        friendCode: friendCode,
                        streak: 14
                      });
                    }
                  }}
                  disabled={!friendCode.trim()}
                  className="bg-[#ff5722] hover:bg-[#ff6b3d] disabled:bg-[#3d2f26] disabled:text-[#8a7a6e] px-6 py-3 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>

            {/* Search Result */}
            {searchedFriend && (
              <div className="bg-[#2a1f19] rounded-2xl p-4 border border-[#3d2f26]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-lg font-bold border-2 border-[#1a1410]">
                      {searchedFriend.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{searchedFriend.name}</p>
                      <p className="text-xs text-[#8a7a6e] font-mono">{searchedFriend.friendCode}</p>
                      <p className="text-xs text-[#ff5722] mt-1">{searchedFriend.streak} Day Streak 🔥</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Add friend to crew
                    alert(`Added ${searchedFriend.name} to your crew!`);
                    setShowAddFriend(false);
                    setFriendCode("");
                    setSearchedFriend(null);
                  }}
                  className="w-full bg-[#ff5722] hover:bg-[#ff6b3d] text-white rounded-xl py-3 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus size={18} />
                  Add to Your Crew
                </button>
              </div>
            )}

            {/* No Result */}
            {friendCode && !searchedFriend && friendCode.length >= 8 && (
              <div className="bg-[#2a1f19] rounded-2xl p-6 text-center border border-[#3d2f26]">
                <p className="text-sm text-[#8a7a6e]">No user found with this friend code</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
