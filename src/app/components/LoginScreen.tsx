import { useState, useEffect } from "react";
import api from "../../lib/api"; // Added api import


type Props = {
  onLogin: (user: any) => void;
};

export function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [isSignup, setIsSignup] = useState(false);
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
            email: "google-auth-user", // Placeholder or get from another call if needed
            token
        });
        // Clear URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onLogin]);

  const handleSubmit = async () => {
    setError(null);

    // Basic Validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (isSignup && (!displayName || !username)) {
      setError("Display name and username are required");
      return;
    }

    setLoading(true);

    try {
      let response;
      if (isSignup) {
        // Sign Up
        response = await api.post("/auth/signup", {
          username,
          displayName,
          email,
          password,
        });
      } else {
        // Login
        response = await api.post("/auth/login", {
          email,
          password,
        });
      }

      // Success
      setLoading(false);
      
      // Adapt backend response to frontend session shape
      const sessionUser = {
        id: response.data._id,
        username: response.data.username,
        display_name: response.data.displayName || response.data.username,
        email: response.data.email,
        token: response.data.token,
      };
      
      onLogin(sessionUser);
    } catch (err: any) {
      setLoading(false);
      const msg = err.response?.data?.message || "Something went wrong";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#3d2817] to-[#1a1410] text-white px-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#1f1611]/80 backdrop-blur p-6 shadow-xl space-y-6">

        {/* Title */}
        <h1 className="text-2xl font-semibold text-center">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>

        {/* Signup-only fields */}
        {isSignup && (
          <div className="space-y-3">
            <input
              placeholder="Display name"
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <input
              placeholder="Username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}

        {/* Google Auth Button */}
        {!isSignup && (
            <button
            onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
            className="w-full bg-white text-black py-3 rounded-xl font-medium transition hover:bg-gray-100 flex items-center justify-center gap-2"
            >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.16-7.27c3.27 0 6.17 2.37 7.15 5.44z" // Simplified Google G path
                />
            </svg>
            Continue with Google
            </button>
        )}

        {/* Divider */}
        {!isSignup && (
             <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">Or</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-900/50 py-3 rounded-xl font-medium transition"
        >
          {loading
            ? "Please wait…"
            : isSignup
            ? "Start Journey"
            : "Login"}
        </button>

        {/* Toggle */}
        <p className="text-sm text-center text-neutral-400">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError(null);
            }}
            className="text-orange-400 hover:underline"
          >
            {isSignup ? "Login" : "Create account"}
          </button>
        </p>
      </div>
    </div>
  );
}
