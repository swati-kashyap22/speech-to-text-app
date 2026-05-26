import { motion } from "framer-motion";import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";

function App() {
  const [user, setUser] = useState(null);
  const [isRecovery, setIsRecovery] = useState(false);
 const [authLoading, setAuthLoading] = useState(false);

  const [transcription, setTranscription] = useState("");
  const [history, setHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

 useEffect(() => {
  let mounted = true;

  const loadUser = async () => {
    try {
      const { data } = await supabase.auth.getSession();

      if (mounted) {
        setUser(data.session?.user || null);
      }
    } catch (error) {
      console.log(error);

      if (mounted) {
        setUser(null);
      }
    } finally {
      if (mounted) {
        setAuthLoading(false);
      }
    }
  };

  loadUser();

  const timeout = setTimeout(() => {
    setAuthLoading(false);
  }, 2000);

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    setIsRecovery(true);
  }

  setUser(session?.user || null);
  setAuthLoading(false);
});

  return () => {
    mounted = false;
    clearTimeout(timeout);
    subscription.unsubscribe();
  };
}, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `https://speech-to-text-app-z349.onrender.com/transcriptions?email=${user.email}`
      );

      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthLoading(false);
  };

  const uploadAudio = async (audioFile = file) => {
    if (!audioFile) {
      setMessage("Please select or record an audio file first");
      return;
    }

    try {
      setLoading(true);
      setMessage("Transcribing audio...");
      setTranscription("");

      const formData = new FormData();

      formData.append("audio", audioFile);
      formData.append("userEmail", user.email);

      const res = await fetch("https://speech-to-text-app-z349.onrender.com/upload-audio", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(data.message);
      setTranscription(data.transcription || "");

      fetchHistory();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    streamRef.current = stream;

    recorderRef.current = new MediaRecorder(stream);

    chunksRef.current = [];

    recorderRef.current.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    recorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: "audio/webm",
      });

      const recordedFile = new File(
        [blob],
        "recording.webm",
        {
          type: "audio/webm",
        }
      );

      setFile(recordedFile);

      setMessage("Recording saved. Click Upload Audio.");
    };

    recorderRef.current.start();

    setRecording(true);

    setMessage("Recording...");
  };

  const stopRecording = () => {
  recorderRef.current.stop();
  streamRef.current.getTracks().forEach((track) => track.stop());
  setRecording(false);
};

  const clearHistory = async () => {
    await fetch(
      `https://speech-to-text-app-z349.onrender.com/transcriptions?email=${user.email}`,
      {
        method: "DELETE",
      }
    );

    setHistory([]);

    setMessage("History cleared successfully");
  };
  const updatePassword = async (e) => {
  e.preventDefault();

  const newPassword = e.target.password.value;

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Password updated successfully. Please login again.");
    await supabase.auth.signOut();
    setIsRecovery(false);
    setUser(null);
  }
};

if (isRecovery) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 text-white">
      <form
        onSubmit={updatePassword}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur"
      >
        <h1 className="mb-3 text-4xl font-bold">Reset Password</h1>

        <p className="mb-6 text-slate-300">
          Enter your new password for EchoScript.
        </p>

        <input
          name="password"
          type="password"
          placeholder="New password"
          className="mb-5 w-full rounded-2xl bg-slate-900/70 px-5 py-4 text-white outline-none"
          required
        />

        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-500"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}

  if (!user) {
    return <Auth />;
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 py-10 text-white">
      <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="mx-auto max-w-6xl"
>

        {/* HEADER */}
        <div className="relative mb-16 text-center">

          {/* LOGOUT */}
       <button
  onClick={logout}
  className="absolute right-0 top-0 rounded-xl border border-blue-300/40 bg-white/10 px-5 py-2 font-bold text-blue-200 transition hover:bg-blue-500/20 hover:text-white"
>
  Logout
</button>

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.4em] text-blue-300">
            AI Powered MERN Project
          </p>
<h1 className="group relative inline-block cursor-default text-7xl font-extrabold tracking-tight">

  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent blur-xl opacity-70 transition duration-500 group-hover:opacity-100">
    EchoScript
  </span>

  <span className="relative animate-pulse bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
    EchoScript
  </span>

</h1>

          <p className="mx-auto mt-5 max-w-2xl text-xl text-slate-300">
            Speak Naturally. Transcribe Instantly.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* AUDIO INPUT */}
          <div className="h-fit rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.45)]">
            <h2 className="mb-6 text-3xl font-bold">
              Audio Input
            </h2>

            <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-blue-300/30 bg-slate-900/60 p-10 text-center transition hover:border-blue-400">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />

              <span className="text-2xl font-bold">
                Choose Audio File
              </span>

              <p className="mt-3 text-slate-400">
                MP3, WAV, WEBM, M4A supported
              </p>
            </label>

            <div className="mt-5 rounded-2xl bg-slate-900/70 p-4 text-slate-300">
              {file
                ? `Selected: ${file.name}`
                : "No file selected"}
            </div>

            <div className="mt-6 flex flex-wrap gap-4">

              <button
                onClick={() => uploadAudio()}
                disabled={loading || recording}
                className="rounded-2xl bg-blue-600 px-7 py-4 text-lg font-bold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500 disabled:bg-blue-300"
              >
                {loading
                  ? "Processing..."
                  : "Upload Audio"}
              </button>

              {!recording ? (
                <button
                  onClick={startRecording}
                  className="rounded-2xl bg-emerald-600 px-7 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-500"
                >
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="rounded-2xl bg-red-600 px-7 py-4 text-lg font-bold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500"
                >
                  Stop Recording
                </button>
              )}
            </div>

            {recording && (
  <div className="mt-4 flex items-center gap-3 rounded-2xl bg-red-500/20 p-3 text-red-200">
                <span className="h-3 w-3 animate-pulse rounded-full bg-red-400"></span>

                Recording in progress...
              </div>
            )}

            {message && !recording && (
  <div className="mt-4 rounded-2xl bg-white/10 p-3 text-slate-200">
    {message}
  </div>
)}
          </div>

          {/* TRANSCRIPTION */}
          <div className="min-h-[440px] rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.45)]">
            <h2 className="mb-6 text-3xl font-bold">
              Latest Transcription
            </h2>

            {transcription ? (
              <div className="rounded-3xl bg-slate-950/70 p-6 leading-relaxed text-slate-200">
                {transcription}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/20 p-12 text-center text-slate-400">
                Your transcription will appear here.
              </div>
            )}
          </div>
        </div>

        {/* HISTORY */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.45)]">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

            <div>
              <h2 className="text-3xl font-bold">
                Transcription History
              </h2>

              <p className="mt-2 text-slate-400">
                Your private transcription records
              </p>
            </div>

            <button
              onClick={clearHistory}
              className="rounded-2xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-500"
            >
              Clear History
            </button>
          </div>

          {history.length === 0 ? (
            <div className="rounded-3xl bg-slate-950/60 p-10 text-center text-slate-400">
              No transcriptions yet.
            </div>
          ) : (
            <div className="grid gap-5">
              {history.map((item) => (
                <div
                  key={item._id || item.id}
                  className="rounded-3xl border border-white/10 bg-slate-950/60 p-6"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-blue-300">
                      {item.fileName}
                    </h3>

                    <span className="text-sm text-slate-500">
                      {new Date(
                        item.createdAt
                      ).toLocaleString()}
                    </span>
                  </div>

                  <p className="leading-relaxed text-slate-300">
                    {item.transcription}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
     </motion.div>
</div>
  );
}

export default App;