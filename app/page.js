"use client";

import { useState, useEffect, useRef } from "react";

// Professional Sample Resume and Job Description for instant 1-click preview
const SAMPLE_RESUME = `ALEX CHEN
San Francisco, CA • alex.chen@example.com • linkedin.com/in/alexchen • github.com/alexchen

SUMMARY
Senior Full-Stack Software Engineer with 6+ years of experience engineering high-throughput microservices, scalable distributed web platforms, and cloud systems on AWS. Led cross-functional teams delivering resilient payment processing engines handling $40M+ in transactions.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL, HTML/CSS
Frameworks & Libraries: React, Next.js, Node.js, Express, NestJS, Tailwind CSS
Databases & Storage: PostgreSQL, Redis, MongoDB, Elasticsearch
Cloud & DevOps: AWS (ECS, Lambda, S3, RDS), Docker, Kubernetes, CI/CD, Terraform
Methodologies: Distributed Systems, REST APIs, GraphQL, Microservices, Agile/Scrum

EXPERIENCE
Staff Software Engineer | FinTech Cloud Corp | 2022 – Present
- Re-architected mission-critical checkout transaction pipeline in TypeScript and Node.js, reducing p99 response latency by 42% and preventing drop-offs.
- Led migration of legacy monolith to containerized microservices on AWS ECS, improving release velocity by 3x.
- Mentored 5 junior and mid-level engineers through regular code architecture reviews and design pair programming.

Full-Stack Developer | TechPulse Solutions | 2019 – 2022
- Developed customer-facing analytics dashboard using React, Next.js, and PostgreSQL serving 180,000 active monthly users.
- Designed caching layer using Redis that reduced database query load by 65%.
- Implemented automated end-to-end testing pipeline with Jest and Playwright, raising code test coverage from 45% to 88%.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2015 – 2019`;

const SAMPLE_JOB_DESC = `Senior Full-Stack Engineer (FinTech / Payments)
Requirements:
- 5+ years of software engineering experience with TypeScript, Node.js, and React / Next.js.
- Strong background in high-availability cloud infrastructure (AWS, Docker, Kubernetes).
- Deep experience in PostgreSQL, Redis, database query optimization, and RESTful API architecture.
- Track record of designing secure, fault-tolerant distributed systems.
- Experience with GraphQL, Terraform, and automated CI/CD pipelines is a strong plus.`;

function ScoreGauge({ label, value, description }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const validValue = Math.min(100, Math.max(0, value || 0));
  const offset = circumference - (validValue / 100) * circumference;

  let strokeColor = "#ef4444";
  let statusBadge = "Needs Work";
  if (validValue >= 80) {
    strokeColor = "#10b981";
    statusBadge = "Excellent";
  } else if (validValue >= 60) {
    strokeColor = "#f59e0b";
    statusBadge = "Competitive";
  }

  return (
    <div className="score-card">
      <div className="score-ring-wrap">
        <svg viewBox="0 0 100 100" width="115" height="115" className="score-svg" aria-hidden="true">
          <circle cx="50" cy="50" r={radius} className="score-bg-ring" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="score-progress-ring"
            stroke={strokeColor}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-number-overlay">
          <span className="score-number">{validValue}</span>
          <span className="score-number-total">/ 100</span>
        </div>
      </div>
      <div className="score-meta">
        <div className="score-title">{label}</div>
        <div className="score-desc">{statusBadge} • {description}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload"); // "upload" | "text"
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [theme, setTheme] = useState("dark");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("resume_theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("resume_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processSelectedFile(droppedFile);
    }
  }

  function processSelectedFile(selectedFile) {
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF document (.pdf).");
      return;
    }
    if (selectedFile.size > 4 * 1024 * 1024) {
      setError("File exceeds 4 MB limit. Please compress or select a smaller PDF.");
      return;
    }
    setError("");
    setFile(selectedFile);
    setActiveTab("upload");
  }

  function loadSampleData() {
    setActiveTab("text");
    setResumeText(SAMPLE_RESUME);
    setJobDescription(SAMPLE_JOB_DESC);
    setFile(null);
    setError("");
  }

  function resetAnalysis() {
    setResult(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    const hasFile = activeTab === "upload" && file;
    const hasText = activeTab === "text" && resumeText.trim().length > 0;

    if (!hasFile && !hasText) {
      setError(
        activeTab === "upload"
          ? "Please upload your resume PDF to proceed."
          : "Please paste your resume text before analyzing."
      );
      return;
    }

    const body = new FormData();
    if (hasFile) {
      body.append("file", file);
    } else {
      body.append("resumeText", resumeText.trim());
    }

    if (jobDescription.trim()) {
      body.append("jobDescription", jobDescription.trim());
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyze", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed. Please verify input and try again.");
      setResult(data);
      setTimeout(() => {
        const resultsEl = document.getElementById("analysis-results");
        if (resultsEl) resultsEl.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-wrapper">
      <div className="bg-ambient" />
      <div className="bg-grid" />

      {/* Navigation */}
      <nav className="navbar">
        <a href="/" className="nav-brand">
          <div className="logo-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <span>ResumePulse <span style={{ opacity: 0.5, fontWeight: 400, fontSize: "0.85rem" }}>AI</span></span>
        </a>

        <div className="nav-actions">
          <button type="button" onClick={loadSampleData} className="sample-btn" title="Populate sample senior engineer resume and job description">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            Try Sample
          </button>

          <button type="button" onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
            {theme === "dark" ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <span>Light</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="container">
        {/* Hero Section */}
        <header className="hero">
          <div className="hero-pill">
            <span className="hero-pill-dot" />
            <span>Powered by Google Gemini 2.5 Intelligence</span>
          </div>
          <h1>
            Optimize Your Resume for <span className="text-gradient">Top ATS Systems</span>
          </h1>
          <p>
            Instant recruiter-grade evaluation, keyword gap detection, and high-impact bullet point rewrites designed to land more technical interviews.
          </p>
        </header>

        {/* Form Input Panel */}
        <form onSubmit={handleSubmit} className="glass-card input-panel">
          {/* Tabs for Upload vs Paste */}
          <div className="tab-nav">
            <button
              type="button"
              className={`tab-btn ${activeTab === "upload" ? "active" : ""}`}
              onClick={() => setActiveTab("upload")}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Upload PDF Resume
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "text" ? "active" : ""}`}
              onClick={() => setActiveTab("text")}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 7 4 4 20 4 20 7"></polyline>
                <line x1="9" y1="20" x2="15" y2="20"></line>
                <line x1="12" y1="4" x2="12" y2="20"></line>
              </svg>
              Paste Resume Text
            </button>
          </div>

          {/* Tab 1: Upload Dropzone */}
          {activeTab === "upload" && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf,.pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files?.[0]) processSelectedFile(e.target.files[0]);
                }}
              />

              {!file ? (
                <div
                  className={`dropzone ${isDragOver ? "dragover" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="dropzone-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <polyline points="9 15 12 12 15 15"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div className="dropzone-text">Click or drag & drop your PDF resume here</div>
                    <div className="dropzone-sub">Supported format: PDF up to 4 MB</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div className="file-selected-box">
                    <div className="file-info">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      <div>
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() => setFile(null)}
                      title="Remove file"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Paste Raw Resume Text */}
          {activeTab === "text" && (
            <div>
              <div className="field-label">
                <span>Resume Raw Content</span>
                <span className="field-badge">Text Input</span>
              </div>
              <textarea
                className="custom-textarea"
                rows={7}
                placeholder="Paste the full text of your resume here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>
          )}

          {/* Target Job Description (Optional) */}
          <div className="field-group">
            <div className="field-label">
              <span>Target Job Description (Optional)</span>
              <span className="field-badge">Target Match</span>
            </div>
            <textarea
              className="custom-textarea"
              rows={4}
              placeholder="Paste the target job description or requirements to benchmark your keyword match rate..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <div className="spinner" />
                <span>Evaluating Resume & Extracting ATS Insights...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <span>Analyze Resume Now</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="error-banner" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Detailed Results Display */}
        {result && (
          <section id="analysis-results" className="results-container">
            {/* Top Toolbar */}
            <div className="results-header-bar">
              <div className="results-title">Analysis Overview</div>
              <button type="button" onClick={resetAnalysis} className="results-action-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                Analyze Another Resume
              </button>
            </div>

            {/* Score Ring Dashboard */}
            <div className="glass-card score-dashboard">
              <ScoreGauge
                label="Overall Quality"
                value={result.overallScore}
                description="Comprehensive strength"
              />
              <ScoreGauge
                label="ATS Parseability"
                value={result.atsScore}
                description="Machine scannability"
              />
              {result.jobMatchScore !== null && (
                <ScoreGauge
                  label="Role Match Fit"
                  value={result.jobMatchScore}
                  description="Target alignment"
                />
              )}
            </div>

            {/* Executive Summary */}
            <div className="glass-card card-pad">
              <div className="card-header">
                <div className="card-header-icon indigo">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <h2 className="card-title">Executive Summary</h2>
              </div>
              <p className="summary-text">{result.summary}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="two-col-grid">
              <div className="glass-card card-pad">
                <div className="card-header">
                  <div className="card-header-icon emerald">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h2 className="card-title">Key Strengths</h2>
                </div>
                {result.strengths?.length > 0 ? (
                  <ul className="insights-list">
                    {result.strengths.map((item, idx) => (
                      <li key={idx} className="insights-item">
                        <span className="bullet-icon pos">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-text">No distinct strengths identified.</div>
                )}
              </div>

              <div className="glass-card card-pad">
                <div className="card-header">
                  <div className="card-header-icon rose">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  </div>
                  <h2 className="card-title">Areas for Improvement</h2>
                </div>
                {result.weaknesses?.length > 0 ? (
                  <ul className="insights-list">
                    {result.weaknesses.map((item, idx) => (
                      <li key={idx} className="insights-item">
                        <span className="bullet-icon neg">✕</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-text">No glaring weaknesses detected.</div>
                )}
              </div>
            </div>

            {/* Keyword Intelligence */}
            <div className="two-col-grid">
              <div className="glass-card card-pad">
                <div className="card-header">
                  <div className="card-header-icon emerald">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                  </div>
                  <h2 className="card-title">Detected Keywords ({result.matchedKeywords?.length || 0})</h2>
                </div>
                {result.matchedKeywords?.length > 0 ? (
                  <div className="chips-cloud">
                    {result.matchedKeywords.map((kw, idx) => (
                      <span key={idx} className="pill-chip match">
                        <span>•</span> {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="empty-text">No relevant industry keywords matched.</div>
                )}
              </div>

              <div className="glass-card card-pad">
                <div className="card-header">
                  <div className="card-header-icon rose">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                  <h2 className="card-title">Missing Target Keywords ({result.missingKeywords?.length || 0})</h2>
                </div>
                {result.missingKeywords?.length > 0 ? (
                  <div className="chips-cloud">
                    {result.missingKeywords.map((kw, idx) => (
                      <span key={idx} className="pill-chip missing">
                        <span>+</span> {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="empty-text">Great job! All critical target skills and tools are present.</div>
                )}
              </div>
            </div>

            {/* Section-by-Section Health Breakdown */}
            {result.sections && result.sections.length > 0 && (
              <div className="glass-card card-pad">
                <div className="card-header">
                  <div className="card-header-icon amber">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                  </div>
                  <h2 className="card-title">Section Quality Breakdown</h2>
                </div>
                <div>
                  {result.sections.map((sec, idx) => {
                    const score = Math.min(100, Math.max(0, sec.score || 0));
                    let color = "#ef4444";
                    let bg = "rgba(239, 68, 68, 0.12)";
                    if (score >= 80) {
                      color = "#10b981";
                      bg = "rgba(16, 185, 129, 0.12)";
                    } else if (score >= 60) {
                      color = "#f59e0b";
                      bg = "rgba(245, 158, 11, 0.12)";
                    }

                    return (
                      <div key={idx} className="section-item">
                        <div className="section-top">
                          <span className="section-name">{sec.name}</span>
                          <span
                            className="section-score-tag"
                            style={{ color, background: bg }}
                          >
                            {score} / 100
                          </span>
                        </div>
                        <div className="section-progress-track">
                          <div
                            className="section-progress-fill"
                            style={{
                              width: `${score}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        {sec.feedback && <p className="section-feedback">{sec.feedback}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actionable Recommendations with Concrete Rewrites */}
            {result.improvements && result.improvements.length > 0 && (
              <div className="glass-card card-pad">
                <div className="card-header">
                  <div className="card-header-icon purple">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </div>
                  <h2 className="card-title">Targeted Improvements & High-Impact Rewrites</h2>
                </div>
                <div className="improvements-list">
                  {result.improvements.map((imp, idx) => (
                    <div key={idx} className="improvement-item">
                      <div className="improvement-header">
                        <span className={`priority-tag ${imp.priority || "medium"}`}>
                          {imp.priority || "Medium"} Priority
                        </span>
                      </div>
                      <div className="improvement-suggestion">{imp.suggestion}</div>
                      {imp.example && (
                        <div className="improvement-rewrite">
                          <span className="rewrite-label">Executive Bullet Rewrite</span>
                          <blockquote className="rewrite-quote">{imp.example}</blockquote>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="security-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Confidential & Ephemeral: Resumes are processed in-memory and never stored.</span>
          </div>
          <div>Powered by Google Gemini 2.5 AI • Fast Applicant Tracking System (ATS) Diagnostic</div>
        </div>
      </footer>
    </div>
  );
}
