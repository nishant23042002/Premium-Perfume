"use client";

import { useEffect } from "react";

// Only rendered if the root layout itself throws — replaces the entire
// document, so it can't rely on RootLayout's providers or font variables.
// Kept intentionally plain and self-contained as the true last-resort screen.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf6f0",
          color: "#2b211b",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", textAlign: "center", maxWidth: "26rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Something went wrong</h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(43,33,27,0.65)", margin: 0 }}>
            The page couldn&apos;t load. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              height: "2.75rem",
              padding: "0 1.75rem",
              background: "#e3a857",
              color: "#2b211b",
              border: "none",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
