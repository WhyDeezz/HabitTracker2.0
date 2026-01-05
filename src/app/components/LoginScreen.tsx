import { useState } from "react";
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
