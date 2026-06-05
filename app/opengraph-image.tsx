import { ImageResponse } from "next/og";

export const alt =
  "StarMap BA — Los mejores cielos de la Provincia de Buenos Aires";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Estrellas dispersas (posiciones fijas para que sea determinístico).
const STARS = [
  [120, 90, 2], [300, 60, 1.5], [520, 120, 2.5], [780, 70, 1.5],
  [980, 110, 2], [1080, 200, 1.5], [200, 240, 1.5], [60, 380, 2],
  [1120, 420, 2], [940, 520, 1.5], [180, 540, 2.5], [420, 500, 1.5],
  [700, 560, 2], [1040, 320, 1.5], [360, 160, 1.5], [860, 260, 2.5],
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(900px 500px at 50% -10%, #1a2440 0%, #0b0f17 60%), #0b0f17",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {STARS.map(([x, y, r], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              background: "#dfe6f2",
              opacity: 0.8,
            }}
          />
        ))}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "8px 20px",
            color: "#a6abbd",
            fontSize: 26,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: "#e6b17a",
            }}
          />
          Provincia de Buenos Aires
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 104,
            fontWeight: 700,
            letterSpacing: "-3px",
            color: "#eceef2",
          }}
        >
          StarMap&nbsp;<span style={{ color: "#e6b17a" }}>BA</span>
        </div>

        <div
          style={{
            marginTop: 28,
            maxWidth: 820,
            textAlign: "center",
            fontSize: 34,
            lineHeight: 1.35,
            color: "#a6abbd",
          }}
        >
          Encontrá el mejor lugar y la mejor noche para ver las estrellas
        </div>
      </div>
    ),
    { ...size },
  );
}
