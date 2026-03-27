import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RicambiXStufe - Ricambi per Stufe a Pellet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-2px",
              display: "flex",
            }}
          >
            RICAMBI
            <span style={{ color: "#fef08a" }}>X</span>
            STUFE
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "6px",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Ricambi per Stufe a Pellet
          </div>
          <div
            style={{
              marginTop: "32px",
              fontSize: 20,
              color: "rgba(255,255,255,0.75)",
              display: "flex",
              gap: "24px",
            }}
          >
            <span>🔧 Motoriduttori</span>
            <span>💨 Ventilatori</span>
            <span>🔥 Resistenze</span>
            <span>⚡ Schede</span>
          </div>
          <div
            style={{
              marginTop: "40px",
              padding: "12px 32px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "999px",
              fontSize: 18,
              color: "white",
              display: "flex",
            }}
          >
            🚚 Spedizione in tutta Europa
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
