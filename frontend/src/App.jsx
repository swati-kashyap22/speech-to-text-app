import { useEffect, useRef, useState } from "react";

function App() {
  const [transcription, setTranscription] = useState("");
  const [history, setHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const fetchHistory = async () => {
    const res = await fetch("http://localhost:5000/transcriptions");
    const data = await res.json();
    setHistory(data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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

      const res = await fetch("http://localhost:5000/upload-audio", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");

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
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];

    recorderRef.current.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    recorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const recordedFile = new File([blob], "recording.webm", {
        type: "audio/webm",
      });
      setFile(recordedFile);
      setMessage("Recording saved. Click Upload Audio.");
    };

    recorderRef.current.start();
    setRecording(true);
    setMessage("Recording...");
  };

  const stopRecording = () => {
    recorderRef.current.stop();
    setRecording(false);
  };

  const clearHistory = async () => {
    await fetch("http://localhost:5000/transcriptions", {
      method: "DELETE",
    });

    setHistory([]);
    setMessage("History cleared successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
            AI Powered MERN Project
          </p>
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
  EchoScript
</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
           Speak Naturally. Transcribe Instantly.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <h2 className="mb-4 text-2xl font-bold">Audio Input</h2>

            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-blue-300/40 bg-slate-900/60 p-6 text-center hover:border-blue-300">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              <span className="text-lg font-semibold">Choose Audio File</span>
              <p className="mt-2 text-sm text-slate-400">
                MP3, WAV, WEBM, M4A supported
              </p>
            </label>

            <p className="mt-4 rounded-xl bg-slate-900/70 p-3 text-sm text-slate-300">
              {file ? `Selected: ${file.name}` : "No file selected"}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => uploadAudio()}
                disabled={loading}
                className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {loading ? "Processing..." : "Upload Audio"}
              </button>

              {!recording ? (
                <button
                  onClick={startRecording}
                  className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-900/40 hover:bg-emerald-500"
                >
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white shadow-lg shadow-red-900/40 hover:bg-red-500"
                >
                  Stop Recording
                </button>
              )}
            </div>

            {recording && (
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-red-500/20 p-3 text-red-200">
                <span className="h-3 w-3 animate-pulse rounded-full bg-red-400"></span>
                Recording in progress...
              </div>
            )}

            {message && (
              <div className="mt-5 rounded-xl bg-white/10 p-4 text-slate-200">
                {message}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <h2 className="mb-4 text-2xl font-bold">Latest Transcription</h2>

            {transcription ? (
              <div className="rounded-2xl bg-slate-950/70 p-5 leading-relaxed text-slate-200">
                {transcription}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/20 p-8 text-center text-slate-400">
                Your transcription will appear here.
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Transcription History</h2>
              <p className="text-sm text-slate-400">
                Saved records from MongoDB Atlas
              </p>
            </div>

            <button
              onClick={clearHistory}
              className="rounded-xl bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-500"
            >
              Clear History
            </button>
          </div>

          {history.length === 0 ? (
            <p className="rounded-2xl bg-slate-950/60 p-6 text-center text-slate-400">
              No transcriptions yet.
            </p>
          ) : (
            <div className="grid gap-4">
              {history.map((item) => (
                <div
                  key={item._id || item.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-blue-300">{item.fileName}</h3>
                    <span className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-300">{item.transcription}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;