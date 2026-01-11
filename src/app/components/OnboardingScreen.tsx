import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Fingerprint, Flame, Users } from "lucide-react";

interface OnboardingScreenProps {
  onComplete: (target: 'login' | 'signup') => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: "intro",
      content: (
        <div className="flex flex-col items-center justify-between h-full pt-10 pb-6 px-6">
          {/* Visual - Glowing Network Simulation */}
          <div className="relative w-full aspect-square max-w-[320px] mx-auto mb-8">
            <div className="absolute inset-0 bg-[#ff5722]/20 rounded-full blur-3xl animate-pulse" />
            
            {/* Main Card */}
            <div className="relative h-full w-full bg-gradient-to-br from-[#1a1410] to-[#000000] rounded-3xl border border-[#3d2f26] overflow-hidden flex items-center justify-center shadow-2xl">
              
              {/* Abstract Nodes/Network CSS Art */}
              <div className="absolute inset-0 opacity-80">
                 {/* Random nodes/lines simulation */}
                 <svg className="w-full h-full text-[#ff5722]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="2" fill="currentColor" className="animate-ping" style={{ animationDuration: '3s' }} />
                    <circle cx="30" cy="30" r="1.5" fill="currentColor" />
                    <circle cx="70" cy="70" r="1.5" fill="currentColor" />
                    <circle cx="70" cy="30" r="1.5" fill="currentColor" />
                    <circle cx="30" cy="70" r="1.5" fill="currentColor" />
                    <circle cx="50" cy="20" r="1.5" fill="currentColor" />
                    <circle cx="50" cy="80" r="1.5" fill="currentColor" />
                    <circle cx="20" cy="50" r="1.5" fill="currentColor" />
                    <circle cx="80" cy="50" r="1.5" fill="currentColor" />
                    
                    {/* Connecting lines */}
                    <path d="M50 50 L30 30 M50 50 L70 70 M50 50 L70 30 M50 50 L30 70 M30 30 L50 20 L70 30 L80 50 L70 70 L50 80 L30 70 L20 50 Z" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.6" />
                    <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="0.2" fill="none" opacity="0.4" />
                 </svg>
                 
                 {/* Glowing Core */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#ff5722]/30 rounded-full blur-xl" />
              </div>

              {/* Tag */}
              <div className="absolute top-4 right-4 bg-[#2a1f19]/80 backdrop-blur-md border border-[#3d2f26] rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg z-10">
                <Flame size={12} className="text-[#ff5722] fill-[#ff5722]" />
                <span className="text-[10px] font-bold text-white tracking-wide">32 Day Streak</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-center w-full max-w-sm">
            <div>
                <h1 className="text-3xl font-bold leading-tight mb-3">
                Because habits stick <br />
                <span className="text-[#ff5722]">with accountability.</span>
                </h1>
                <p className="text-[#8a7a6e] text-sm leading-relaxed px-4">
                Track your habits, protect your streak, and stay consistent — together.
                </p>
            </div>

            <div className="flex gap-2 justify-center mb-6">
                <div className="w-6 h-1.5 rounded-full bg-[#ff5722]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#3d2f26]" />
            </div>

            <div className="space-y-4">
                <button
                onClick={() => setCurrentSlide(1)}
                className="w-full bg-[#ff5722] hover:bg-[#ff6b3d] text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                Get Started
                <ArrowRight size={20} />
                </button>
                <button
                    onClick={() => onComplete('login')}
                    className="text-[#8a7a6e] text-sm font-medium hover:text-white transition-colors"
                >
                    I already have an account
                </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "features",
      content: (
        <div className="flex flex-col h-full pt-16 pb-6 px-6 relative">
          {/* Background Elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5722]/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="space-y-2 mb-12">
            <h1 className="text-4xl font-bold leading-tight">
              Build Better
              <br />
              <span className="text-[#ff5722]">Habits</span>
            </h1>
            <p className="text-[#8a7a6e] text-base leading-relaxed max-w-[280px]">
              Small actions, repeated daily, create the momentum for a new you.
            </p>
          </div>

          <div className="space-y-8 flex-1">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2a1f19] border border-[#3d2f26] flex items-center justify-center shrink-0">
                <Fingerprint className="text-[#ff5722]" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Create & break habits</h3>
                <p className="text-sm text-[#8a7a6e] leading-relaxed">
                  Build good habits and break bad ones with a simple daily system.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2a1f19] border border-[#3d2f26] flex items-center justify-center shrink-0">
                <Flame className="text-[#ff5722] fill-[#ff5722]/20" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Designed to make quitting harder</h3>
                <p className="text-sm text-[#8a7a6e] leading-relaxed">
                  Streaks and proven habit-tracking techniques help you stay consistent and build momentum over time.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2a1f19] border border-[#3d2f26] flex items-center justify-center shrink-0">
                <Users className="text-[#ff5722]" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Do it with friends</h3>
                <p className="text-sm text-[#8a7a6e] leading-relaxed">
                  Track habits together, form groups, and keep each other going.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
             <div className="flex gap-2 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3d2f26]" />
                <div className="w-6 h-1.5 rounded-full bg-[#ff5722]" />
            </div>

            <button
              onClick={() => onComplete('signup')}
              className="w-full bg-[#ff5722] hover:bg-[#ff6b3d] text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Get Started
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a1410] text-white overflow-x-hidden relative">
      <div className="max-w-md mx-auto min-h-screen relative">
         <AnimatePresence mode="wait">
            <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="min-h-screen"
            >
                {slides[currentSlide].content}
            </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
}
