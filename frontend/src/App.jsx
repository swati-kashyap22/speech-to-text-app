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
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-4xl font-bold text-slate-800">
          Speech to Text App
        </h1>

        <p className="mt-3 text-center text-slate-500">
          Upload or record audio and generate transcription records.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 p-6">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full rounded-lg border border-slate-300 p-3"
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
  onClick={() => uploadAudio()}
  disabled={loading}
  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
>
  {loading ? "Processing..." : "Upload Audio"}
</button>

            {!recording ? (
              <button
                onClick={startRecording}
                className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
              >
                Stop Recording
              </button>
            )}
          </div>

          <p className="mt-4 text-sm text-slate-600">
            {file ? `Selected: ${file.name}` : "No file selected"}
          </p>

          {message && (
            <p className="mt-3 rounded-lg bg-slate-100 p-3 text-slate-700">
              {message}
            </p>
          )}
        </div>

        {transcription && (
          <div className="mt-6 rounded-xl bg-blue-50 p-5">
            <h2 className="text-xl font-bold text-blue-800">Transcription</h2>
            <p className="mt-2 text-slate-700">{transcription}</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-slate-800">
            Transcription History
          </h2>
          <button
  onClick={clearHistory}
  className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
>
  Clear History
</button>

          {history.length === 0 ? (
            <p className="mt-3 text-slate-500">No transcriptions yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {history.map((item) => (
                <div
                  key={item._id || item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <h3 className="font-semibold text-slate-800">
                    {item.fileName}
                  </h3>
                  <p className="mt-2 text-slate-700">{item.transcription}</p>
                  <small className="mt-2 block text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </small>
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