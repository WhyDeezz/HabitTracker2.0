import { Flame, Users } from 'lucide-react';

type Screen = 'habits' | 'create' | 'profile' | 'social';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#2a1f19] border-t border-[#3d2f26] max-w-md mx-auto z-50">
      <div className="flex items-center justify-around py-3">
        <button
          onClick={() => onNavigate('habits')}
          className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
            currentScreen === 'habits' ? 'text-[#ff5722]' : 'text-[#8a7a6e]'
          }`}
        >
          <Flame size={24} fill={currentScreen === 'habits' ? '#ff5722' : 'none'} />
          <span className="text-xs">Habits</span>
        </button>
        
        <button
          onClick={() => onNavigate('social')}
          className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
            currentScreen === 'social' ? 'text-[#ff5722]' : 'text-[#8a7a6e]'
          }`}
        >
          <Users size={24} />
          <span className="text-xs">Social</span>
        </button>
      </div>
    </nav>
  );
}