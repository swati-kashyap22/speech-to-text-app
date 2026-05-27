import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { supabase } from "./supabase";

function Auth() {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

     if (error) {
  if (error.message === "Invalid login credentials") {
    setMessage("Invalid email or password. If you don't have an account, please sign up first.");
  } else {
    setMessage(error.message);
  }
}
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMode("verify");
        setMessage("Verification code sent to your email.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Email verified successfully.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setMessage("");

    try {
      setLoading(true);

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("New verification code sent.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="hidden w-1/2 flex-col justify-center px-16 lg:flex">
        <h1 className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 bg-clip-text text-7xl font-extrabold text-transparent">
          EchoScript
        </h1>

        <p className="mt-6 max-w-lg text-2xl font-light leading-relaxed text-slate-300">
          Speak Naturally. Transcribe Instantly.
        </p>

        <div className="mt-12 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h3 className="text-xl font-semibold">AI Voice Transcription</h3>
            <p className="mt-2 text-slate-400">
              Convert speech into accurate text using Deepgram AI.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h3 className="text-xl font-semibold">Secure User Access</h3>
            <p className="mt-2 text-slate-400">
              Verify your account and keep transcription history private.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 bg-clip-text text-5xl font-extrabold text-transparent">
              EchoScript
            </h1>
            <p className="mt-3 text-slate-300">
              Speak Naturally. Transcribe Instantly.
            </p>
          </div>

          {mode !== "verify" && (
            <div className="mb-8 flex rounded-2xl bg-slate-900/60 p-1">
              <button
                onClick={() => {
  setMode("login");
  setEmail("");
  setPassword("");
  setConfirmPassword("");
  setMessage("");
}}
                className={`w-1/2 rounded-xl py-3 font-semibold transition ${
                  mode === "login" ? "bg-blue-600 text-white" : "text-slate-400"
                }`}
              >
                Login
              </button>
              


              <button
                onClick={() => {
  setMode("signup");
  setEmail("");
  setPassword("");
  setConfirmPassword("");
  setMessage("");
}}
                className={`w-1/2 rounded-xl py-3 font-semibold transition ${
                  mode === "signup" ? "bg-blue-600 text-white" : "text-slate-400"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-3xl font-bold">
              {mode === "login" && "Welcome Back"}
              {mode === "signup" && "Create Account"}
              {mode === "verify" && "Verify Email"}
            </h2>

            <p className="mt-2 text-slate-400">
              {mode === "login" && "Login to continue using EchoScript."}
              {mode === "signup" &&
                "Create your account and verify it with an email code."}
              {mode === "verify" &&
                "Enter the verification code sent to your email."}
            </p>
          </div>

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <input
  type="email"
  placeholder="Enter email"
  autoComplete="off"
  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 text-white outline-none transition focus:border-blue-500"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>
             <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter password"
    autoComplete="new-password"
    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 pr-12 text-white outline-none transition focus:border-blue-500"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
  >
    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
  </button>
</div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-500 disabled:bg-blue-300"
              >
                {loading ? "Please wait..." : "Login"}
              </button>
              <button
  type="button"
  onClick={async () => {
    if (!email) {
      setMessage("Please enter your email first.");
      return;
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          "https://speech-to-text-app-mu.vercel.app",
      });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Password reset email sent. Check your inbox."
      );
    }
  }}
  className="mt-4 w-full text-sm text-blue-300 hover:text-blue-200"
>
  Forgot Password?
</button>
            </form>
          )}

{/* sing up */}


          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-5">
              <input
  type="email"
  placeholder="Enter email"
  autoComplete="off"
  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 text-white outline-none transition focus:border-blue-500"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

  <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Create password"
    autoComplete="new-password"
    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 pr-12 text-white outline-none transition focus:border-blue-500"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
  >
    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
  </button>
</div>


      <div className="relative">
  <input
    type={showConfirmPassword ? "text" : "password"}
    placeholder="Confirm password"
    autoComplete="new-password"
    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 pr-12 text-white outline-none transition focus:border-blue-500"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
  />

  <button
    type="button"
    onClick={() =>
      setShowConfirmPassword(!showConfirmPassword)
    }
    className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
  >
    {showConfirmPassword ? (
      <EyeOff size={22} />
    ) : (
      <Eye size={22} />
    )}
  </button>
</div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-500 disabled:bg-blue-300"
              >
                {loading ? "Sending Code..." : "Create Account"}
              </button>
            </form>
          )}

          {mode === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <input
  type="email"
  placeholder="Email"
  autoComplete="off"
  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 text-white outline-none transition focus:border-blue-500"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

              <input
                type="text"
                placeholder="Enter verification code"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 text-white outline-none transition focus:border-blue-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-500 disabled:bg-blue-300"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <button
                type="button"
                onClick={resendCode}
                disabled={loading}
                className="w-full rounded-2xl border border-white/10 py-4 text-lg font-bold text-white transition hover:bg-white/10"
              >
                Resend Code
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
                className="w-full text-sm text-blue-300"
              >
                Back to Login
              </button>
            </form>
          )}

          {message && (
  <div
    className={`mt-6 rounded-2xl p-4 text-center text-sm font-semibold ${
      message.toLowerCase().includes("invalid") ||
      message.toLowerCase().includes("passwords do not match") ||
      message.toLowerCase().includes("error")
        ? "border border-red-400/40 bg-red-500/20 text-red-200"
        : "border border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
    }`}
  >
    {message}
  </div>
)}
        </div>
      </div>
    </div>
  );
}

export default Auth;