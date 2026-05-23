import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [transcription, setTranscription] = useState("");
  const [history, setHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
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

    const formData = new FormData();
    formData.append("audio", audioFile);

    const res = await fetch("http://localhost:5000/upload-audio", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setMessage(data.message);
    setTranscription(data.transcription || "");
    fetchHistory();
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

  return (
    <div className="app">
      <h1>Speech to Text</h1>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={() => uploadAudio()}>Upload Audio</button>

      {!recording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}

      <p>{file ? `Selected: ${file.name}` : "No file selected"}</p>
      <p>{message}</p>

      {transcription && (
        <div>
          <h2>Transcription:</h2>
          <p>{transcription}</p>
        </div>
      )}

      <h2>Transcription History</h2>

      {history.length === 0 ? (
        <p>No transcriptions yet.</p>
      ) : (
        history.map((item) => (
          <div key={item.id}>
            <h3>{item.fileName}</h3>
            <p>{item.transcription}</p>
            <small>{item.createdAt}</small>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default App;