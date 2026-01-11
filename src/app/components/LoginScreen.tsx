import { useState, useEffect } from "react";
import api from "../../lib/api";

type Props = {
  onLogin: (user: any) => void;
  initialMode?: "login" | "signup";
};

export function LoginScreen({ onLogin, initialMode = "login" }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  // username is now auto-generated
  const [isSignup, setIsSignup] = useState(initialMode === "signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Google Auth callback parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const id = params.get("id");
    const username = params.get("username");
    
    if (token && id && username) {
      onLogin({
        id,
        username,
        display_name: params.get("displayName") || username,
        email: "google-auth-user",
        token,
        friendCode: params.get("friendCode") || undefined,
        streak: parseInt(params.get("streak") || "0", 10),
        lastCompletedDate: params.get("lastCompletedDate") || null,
      });
      window.history.replaceState({}, document.title, "/");
    }
  }, [onLogin]);

  const handleSubmit = async () => {
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (isSignup && !displayName) {
      setError("Display name is required");
      return;
    }

    setLoading(true);

    try {
      let response;
      if (isSignup) {
        // Use displayName directly as username
        // This enforces uniqueness on the display name
        response = await api.post("/auth/signup", {
          username: displayName,
          displayName,
          email,
          password,
        });
      } else {
        response = await api.post("/auth/login", {
          email,
          password,
        });
      }

      setLoading(false);
      
      const sessionUser = {
        id: response.data._id,
        username: response.data.username,
        display_name: response.data.displayName || response.data.username,
        email: response.data.email,
        token: response.data.token,
        friendCode: response.data.friendCode,
        streak: response.data.streak,
        lastCompletedDate: response.data.lastCompletedDate,
      };
      
      onLogin(sessionUser);
    } catch (err: any) {
      setLoading(false);
      const msg = err.response?.data?.message || "Something went wrong";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1410] to-[#0d0906] text-white px-4">
      <div className="w-full max-w-sm">
        
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 drop-shadow-lg">🔥</div>
          <h1 className="text-2xl font-bold mb-2">Don't Break the Chain</h1>
          <p className="text-sm text-gray-400">
            Join your friends and build better habits together.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-[#2d1f17]/90 backdrop-blur-md p-6 shadow-2xl border border-[#3d2817]">
          
          {/* Streak Counter - Show on both login and signup */}
          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <span>🔥</span>
              <span>🔥</span>
            </span>
            <span className="font-semibold">10k+ active streaks</span>
          </div>

          {/* Google Auth Button - Show on both login and signup */}
          <button
            onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
            className="w-full bg-[#2d1f17] hover:bg-[#3d2817] border border-[#4d3827] text-white py-3.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 mb-4 shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#fff"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#fff"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fff"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#fff"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
          
          <div className="text-center text-xs text-gray-500 mb-5">
            Fastest way — no password needed
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-[#4d3827]"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-xs font-medium uppercase tracking-wider">
              Or continue with email
            </span>
            <div className="flex-grow border-t border-[#4d3827]"></div>
          </div>

          {/* Signup Fields - Show first on signup mode */}
          {isSignup && (
            <div className="space-y-3 mb-4">
              <input
                placeholder="Display Name"
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}

          {/* Email Input with Icon */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 mb-2">Email address</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                className="input !pl-14"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input with Icon */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 mb-2">Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="input !pl-14"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#ff5e1a] to-[#ff4500] hover:from-[#ff6b2b] hover:to-[#ff5722] disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              "Please wait…"
            ) : (
              <>
                {isSignup ? "Start Your Journey" : "Start Your Streak"}
                <span>→</span>
              </>
            )}
          </button>

          {/* Terms & Privacy - Only on Login */}
          {!isSignup && (
            <p className="text-xs text-center text-gray-500 mt-4">
              By continuing, you agree to our{" "}
              <a href="#" className="text-gray-400 hover:text-gray-300 underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-gray-400 hover:text-gray-300 underline">
                Privacy Policy
              </a>
            </p>
          )}

          {/* Toggle Login/Signup */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              {isSignup ? "Already have an account?" : "New here?"}{" "}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError(null);
                }}
                className="text-[#ff5e1a] hover:text-[#ff6b2b] font-semibold hover:underline transition-colors"
              >
                {isSignup ? "Log in" : "Create account"}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
