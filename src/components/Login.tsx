import React, { useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

// Supabase config
const SUPABASE_URL = "https://zbjaizgdknbkuuatfdjp.supabase.co";
const SUPABASE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiamFpemdka25ia3V1YXRmZGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDI2NDQsImV4cCI6MjA2ODgxODY0NH0.bvncA5QvD0aTVPRMhEIBT9kZHT7vP9CR7zzQzNQ03CI";

const Login: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/users?username=eq.${username}`,
        {
          headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.length === 0) {
        setError("User not found.");
      } else {
        const user = data[0];
        if (user.password === password) {
          document.cookie = `username=${username}; path=/; max-age=86400`;
          window.location.href = "/";
        } else {
          setError("Incorrect password.");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-black shadow-md"
        title="Toggle theme"
      >
        {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      </button>

      {/* Login Card */}
      <form
        onSubmit={handleSubmit}
        className="relative p-8 z-10 w-full max-w-md rounded-xl shadow-xl border border-gray-300 bg-white"
      >
        <div className="px-6 pt-4">
          <h2 className="text-3xl font-bold uppercase text-center tracking-wide text-gray-800">
            Login
          </h2>
        </div>

        <div className="px-6 pt-6 pb-2">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Username */}
          <label htmlFor="username" className="block mb-2 text-sm font-semibold text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-5 px-4 py-3 rounded-md border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-white"
          />

          {/* Password */}
          <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 px-4 py-3 rounded-md border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-white"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold tracking-wide transition duration-300 ${
              loading
                ? "bg-cyan-700/40 cursor-not-allowed text-white"
                : "bg-cyan-500 hover:bg-cyan-400 shadow-lg hover:shadow-cyan-500/50 text-white"
            }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
