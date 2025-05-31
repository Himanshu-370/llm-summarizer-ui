import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [docs, setDocs] = useState([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`${apiUrl}/query`);
      const data = await res.json();
      setDocs(data);
    } catch {
      setError("Failed to load documents.");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoadingUpload(true);
    setMessage("Uploading...");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessage(`Uploaded: ${data.filename}`);
      fetchDocs();
    } catch {
      setError("Upload failed.");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleSummarize = async (id) => {
    setLoadingSummary(true);
    setMessage("Summarizing...");
    setError("");

    try {
      const res = await fetch(`${apiUrl}/summarize/${id}`, {
        method: "POST",
      });
      const data = await res.json();
      setSummary(data.summary);
      setMessage("Summary generated!");
    } catch {
      setError("Failed to summarize.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="container">
      <h1>📚 AI Document Summarizer</h1>

      <div className="upload-section">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loadingUpload}>
          {loadingUpload ? "Please wait..." : "Upload"}
        </button>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}

      {loadingDocs ? (
        <p>Loading documents...</p>
      ) : (
        <div className="doc-list">
          {docs.map((doc) => (
            <div key={doc.id} className="doc-item">
              <span>{doc.filename}</span>
              <button onClick={() => handleSummarize(doc.id)} disabled={loadingSummary}>
                {loadingSummary ? "Please wait..." : "Summarize"}
              </button>
            </div>
          ))}
        </div>
      )}

      {summary && (
        <div className="summary">
          <h3>📝 Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
