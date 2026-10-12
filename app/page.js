"use client";

import { useState } from "react";

function ScoreRing({ label, value }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const tone = value >= 75 ? "good" : value >= 50 ? "ok" : "bad";

  return (
    <div className="ring">
      <svg viewBox="0 0 100 100" width="110" height="110" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} className="ring-bg" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={`ring-fg ${tone}`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="56" textAnchor="middle" className="ring-text">
          {value}
        </text>
      </svg>
      <span className="ring-label">{label}</span>
    </div>
  );
}

function Chips({ items, kind }) {
  if (!items.length) return <p className="muted">None found.</p>;
  return (
    <div className="chips">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className={`chip ${kind}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function List({ items }) {
  if (!items.length) return <p className="muted">Nothing to show.</p>;
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function Home() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!file && !resumeText.trim()) {
      setError("Upload a PDF resume or paste your resume text first.");
      return;
    }

    const body = new FormData();
    if (file) body.append("file", file);
    if (resumeText.trim()) body.append("resumeText", resumeText);
    if (jobDescription.trim()) body.append("jobDescription", jobDescription);

    setLoading(true);
    try {
      const res = await fetch("/api/analyze", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const picked = e.target.files?.[0] || null;
    if (picked && picked.size > 4 * 1024 * 1024) {
      setError("PDF is too large. Please keep it under 4 MB.");
      e.target.value = "";
      setFile(null);
      return;
    }
    setError("");
    setFile(picked);
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>AI Resume Analyzer</h1>
        <p>
          Get an ATS score, keyword gaps and concrete rewrites in seconds. Add a job description to
          see how well you match the role.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card">
        <label className="field">
          <span>Resume (PDF, max 4 MB)</span>
          <input type="file" accept="application/pdf,.pdf" onChange={handleFileChange} />
          {file && <small className="muted">Selected: {file.name}</small>}
        </label>

        <label className="field">
          <span>Or paste resume text</span>
          <textarea
            rows={6}
            placeholder="Paste your resume text here if you don't have a PDF..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            disabled={!!file}
          />
        </label>

        <label className="field">
          <span>Job description (optional)</span>
          <textarea
            rows={6}
            placeholder="Paste the job description to get a match score and missing keywords..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze resume"}
        </button>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </form>

      {result && (
        <section className="results">
          <div className="card rings">
            <ScoreRing label="Overall" value={result.overallScore} />
            <ScoreRing label="ATS" value={result.atsScore} />
            {result.jobMatchScore !== null && (
              <ScoreRing label="Job match" value={result.jobMatchScore} />
            )}
          </div>

          <div className="card">
            <h2>Summary</h2>
            <p>{result.summary}</p>
          </div>

          <div className="grid">
            <div className="card">
              <h2>Strengths</h2>
              <List items={result.strengths} />
            </div>
            <div className="card">
              <h2>Weaknesses</h2>
              <List items={result.weaknesses} />
            </div>
          </div>

          <div className="grid">
            <div className="card">
              <h2>Matched keywords</h2>
              <Chips items={result.matchedKeywords} kind="match" />
            </div>
            <div className="card">
              <h2>Missing keywords</h2>
              <Chips items={result.missingKeywords} kind="missing" />
            </div>
          </div>

          {result.sections.length > 0 && (
            <div className="card">
              <h2>Section breakdown</h2>
              {result.sections.map((s, i) => (
                <div key={`${s.name}-${i}`} className="section-row">
                  <div className="section-head">
                    <strong>{s.name}</strong>
                    <span>{s.score}/100</span>
                  </div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${s.score}%` }} />
                  </div>
                  <p className="muted">{s.feedback}</p>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <h2>How to improve</h2>
            {result.improvements.map((imp, i) => (
              <div key={i} className="improvement">
                <span className={`badge ${imp.priority}`}>{imp.priority}</span>
                <div>
                  <p>{imp.suggestion}</p>
                  {imp.example && <blockquote>{imp.example}</blockquote>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="footer">
        Your resume is sent to Google Gemini for analysis and is not stored by this app.
      </footer>
    </main>
  );
}
