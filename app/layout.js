import "./globals.css";

export const metadata = {
  title: "AI Resume Analyzer",
  description:
    "Upload your resume, optionally add a job description, and get an ATS score with actionable improvements.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
