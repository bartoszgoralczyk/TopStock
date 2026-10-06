"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pl">
      <body
        style={{
          margin: 0,
          background: "#f3efe6",
          color: "#1c1914",
          fontFamily: "Georgia, serif",
        }}
      >
        <main style={{ maxWidth: 560, margin: "12vh auto", padding: 24 }}>
          <p style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 12 }}>
            GPW Notowania
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 500, margin: "12px 0" }}>Strona nie wstała</h1>
          <p style={{ lineHeight: 1.6 }}>
            Coś przerwało układ serwisu, zanim zdążył pokazać notowania. Spróbuj wczytać go jeszcze raz.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 20,
              background: "#1a3a2a",
              color: "#f6f1e6",
              border: 0,
              borderRadius: 8,
              padding: "10px 16px",
              font: "inherit",
            }}
          >
            Spróbuj ponownie
          </button>
        </main>
      </body>
    </html>
  );
}
