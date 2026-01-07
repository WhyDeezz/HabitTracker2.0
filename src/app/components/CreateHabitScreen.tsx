import { useState, useRef } from 'react';
import { X, User, Clock, Globe, Lock, Minus, Plus, Info } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';

interface CreateHabitScreenProps {
  onBack: () => void;
  onCreate: (habit: any) => void;
}

export function CreateHabitScreen({ onBack, onCreate }: CreateHabitScreenProps) {
  const [habitType, setHabitType] = useState<'build' | 'break'>('build');
  const [microIdentity, setMicroIdentity] = useState('');
  const [habitName, setHabitName] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [duration, setDuration] = useState<number>(21);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const days = [
    { num: 1, label: 'M' },
    { num: 2, label: 'T' },
    { num: 3, label: 'W' },
    { num: 4, label: 'T' },
    { num: 5, label: 'F' },
    { num: 6, label: 'S' },
    { num: 7, label: 'S' },
  ];

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleCreate = () => {
    if (!microIdentity || !habitName) return;

    onCreate({
      microIdentity,
      name: habitName,
      type: habitType,
      days: selectedDays,
      reminderEnabled,
      reminderTime,
      visibility,
      duration,
      progress: 0,
      goal: 1,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-6 border-b border-[#3d2f26]">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#2a1f19] rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
        <h1 className="text-xl font-semibold">New Habit</h1>
        <div className="w-10"></div> {/* Spacer to keep title centered if needed, or just nothing. Let's use a spacer or just remove it. */ }
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Build / Break Toggle */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm text-[#8a7a6e] uppercase tracking-wide">
              Habit Type
            </label>
            <div className="group relative">
              <Info 
                size={16} 
                className="text-[#8a7a6e] hover:text-[#ff5722] cursor-help transition-colors" 
              />
              {/* Tooltip */}
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-[#1a1410] border border-[#3d2f26] rounded-xl p-3 shadow-lg transition-all duration-200 z-10">
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-[#ff5722]">Build:</span>
                    <span className="text-[#b8a89d] ml-1">Create good habits</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#8a7a6e]">Break:</span>
                    <span className="text-[#b8a89d] ml-1">Remove bad ones</span>
                  </div>
                </div>
                {/* Arrow pointing down */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#3d2f26]"></div>
              </div>
            </div>
          </div>
          <div className="inline-flex bg-[#2a1f19] rounded-full p-1 w-full">
            <button
              onClick={() => setHabitType('build')}
              className={`flex-1 px-6 py-2 rounded-full transition-colors ${
                habitType === 'build'
                  ? 'bg-[#ff5722] text-white'
                  : 'text-[#8a7a6e]'
              }`}
            >
              Build
            </button>
            <button
              onClick={() => setHabitType('break')}
              className={`flex-1 px-6 py-2 rounded-full transition-colors ${
                habitType === 'break'
                  ? 'bg-[#3d2f26] text-white'
                  : 'text-[#8a7a6e]'
              }`}
            >
              Break
            </button>
          </div>
        </div>

        {/* Habit Name */}
        <div>
          <label className="block text-sm text-[#8a7a6e] mb-2 uppercase tracking-wide">
            Habit Name
          </label>
          <input
            type="text"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            placeholder="Morning Run"
            className="w-full bg-[#2a1f19] border border-[#3d2f26] rounded-xl px-4 py-3 text-white placeholder:text-[#8a7a6e] focus:outline-none focus:border-[#ff5722] transition-colors"
          />
        </div>

        {/* Micro-Identity */}
        <div>
          <label className="block text-sm text-[#8a7a6e] mb-2 uppercase tracking-wide">
            Micro-Identity
          </label>
          <div className="relative">
            <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7a6e]" />
            <input
              type="text"
              value={microIdentity}
              onChange={(e) => setMicroIdentity(e.target.value)}
              placeholder="e.g. The Athlete"
              className="w-full bg-[#2a1f19] border border-[#3d2f26] rounded-xl px-10 py-3 text-white placeholder:text-[#8a7a6e] focus:outline-none focus:border-[#ff5722] transition-colors"
            />
          </div>
          <p className="text-xs text-[#8a7a6e] mt-2">
            Who are you becoming by doing this?
          </p>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm text-[#8a7a6e] mb-2 uppercase tracking-wide">
            Visibility
          </label>
          <div className="bg-[#2a1f19] p-1 rounded-2xl flex relative">
              {/* Sliding background could be added here for animation, but simple state switching works for now */}
             <button
              onClick={() => setVisibility('public')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${
                visibility === 'public'
                  ? 'bg-[#3d2f26] text-[#ff5722] shadow-sm'
                  : 'text-[#8a7a6e]'
              }`}
            >
              <Globe size={18} />
              <span className="font-medium">Public</span>
            </button>
            <button
              onClick={() => setVisibility('private')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${
                visibility === 'private'
                  ? 'bg-[#3d2f26] text-[#ff5722] shadow-sm'
                  : 'text-[#8a7a6e]'
              }`}
            >
              <Lock size={18} />
              <span className="font-medium">Private</span>
            </button>
          </div>
          <p className="text-xs text-[#8a7a6e] mt-2 text-center">
            Public habits are visible to your friends for accountability.
          </p>
        </div>

        {/* Frequency */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-[#8a7a6e] uppercase tracking-wide">
              Frequency
            </label>
            <button 
              onClick={() => setSelectedDays([1, 2, 3, 4, 5, 6, 7])}
              className="text-sm text-[#ff5722] hover:text-[#ff6b3d] transition-colors"
            >
              Daily
            </button>
          </div>
          <div className="flex gap-2 justify-between">
            {days.map((day) => (
              <button
                key={day.num}
                onClick={() => toggleDay(day.num)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  selectedDays.includes(day.num)
                    ? 'bg-[#ff5722] text-white scale-105'
                    : 'bg-[#2a1f19] text-[#8a7a6e] border border-[#3d2f26]'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
           <label className="block text-sm text-[#8a7a6e] mb-3 uppercase tracking-wide">
            Duration
          </label>
           <div className="bg-[#2a1f19] rounded-2xl p-6 flex flex-col items-center">
             
             {/* Large Input Display with Controls */}
             <div className="flex items-center gap-6 mb-2">
                <button
                  onClick={() => setDuration(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-[#1a1410] text-[#8a7a6e] hover:text-[#ff5722] hover:bg-[#3d2f26] flex items-center justify-center transition-colors"
                >
                  <Minus size={18} />
                </button>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-32 bg-transparent text-center text-5xl font-bold text-white focus:outline-none placeholder:text-[#3d2f26]"
                  />
                </div>

                <button
                  onClick={() => setDuration(prev => prev + 1)}
                  className="w-10 h-10 rounded-xl bg-[#1a1410] text-[#8a7a6e] hover:text-[#ff5722] hover:bg-[#3d2f26] flex items-center justify-center transition-colors"
                >
                  <Plus size={18} />
                </button>
             </div>
             
             {/* Divider & Label */}
             <div className="w-16 h-1 bg-[#ff5722] rounded-full mb-3 opacity-80"></div>
             <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a7a6e] font-medium mb-8">
               Days Target
             </p>

             {/* Presets */}
             <div className="flex gap-3 w-full justify-center">
               {[21, 48, 66].map((days) => (
                 <button
                   key={days}
                   onClick={() => setDuration(days)}
                   className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                     duration === days
                       ? 'bg-[#ff5722] text-white shadow-[0_4px_12px_rgba(255,87,34,0.3)] transform scale-105'
                       : 'bg-[#1a1410] text-[#8a7a6e] hover:bg-[#3d2f26] hover:text-white'
                   }`}
                 >
                   {days} Days
                 </button>
               ))}
             </div>
           </div>
        </div>

        {/* Reminder */}
        <div className="bg-[#2a1f19] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${reminderEnabled ? 'bg-[#ff5722]/20' : 'bg-[#3d2f26]'}`}>
                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 6V10L12 12M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z"
                    stroke={reminderEnabled ? "#ff5722" : "#8a7a6e"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium mb-1">Reminder</p>
                {reminderEnabled ? (
                  <button 
                    onClick={() => timeInputRef.current?.showPicker()}
                    className="relative inline-flex items-center gap-2 bg-[#ff5722]/10 px-3 py-1.5 rounded-lg border border-[#ff5722]/20 hover:bg-[#ff5722]/20 transition-colors"
                  >
                    <Clock size={14} className="text-[#ff5722]" />
                    <span className="text-sm font-medium text-[#ff5722]">
                      {(() => {
                        if (!reminderTime) return 'Set time';
                        const [hours, minutes] = reminderTime.split(':');
                        const h = parseInt(hours, 10);
                        const period = h >= 12 ? 'PM' : 'AM';
                        const h12 = h % 12 || 12;
                        return `${h12}:${minutes} ${period}`;
                      })()}
                    </span>
                    <input 
                        ref={timeInputRef}
                        type="time" 
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
                    />
                  </button>
                ) : (
                  <p className="text-sm text-[#8a7a6e]">Off</p>
                )}
              </div>
            </div>
            
            <Switch.Root
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
                className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${
                  reminderEnabled ? 'bg-[#ff5722]' : 'bg-[#3d2f26]'
                }`}
              >
                <Switch.Thumb className={`block w-4 h-4 bg-white rounded-full shadow transition-transform duration-100 will-change-transform ${
                  reminderEnabled ? 'translate-x-[26px]' : 'translate-x-1'
                }`} />
            </Switch.Root>
          </div>
        </div>

        {/* Start Habit Button */}
        <button
          onClick={handleCreate}
          disabled={!microIdentity || !habitName}
          className="w-full bg-[#ff5722] hover:bg-[#ff6b3d] disabled:bg-[#3d2f26] disabled:text-[#8a7a6e] text-white rounded-full py-4 flex items-center justify-center gap-2 transition-colors mt-8"
        >
          Start Habit
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M7.5 15L12.5 10L7.5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
