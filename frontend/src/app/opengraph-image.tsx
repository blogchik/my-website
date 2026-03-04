import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "J. Abduroziq — Designing The Next Internet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#000022",
          padding: "72px 80px",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid accent */}
        <div
          style={{
            position: "absolute",
            bottom: -160,
            right: -160,
            width: 560,
            height: 560,
            borderRadius: "50%",
            border: "1px solid rgba(226,132,19,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 400,
              height: 400,
              borderRadius: "50%",
              border: "1px solid rgba(226,132,19,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 240,
                height: 240,
                borderRadius: "50%",
                border: "1px solid rgba(226,132,19,0.08)",
                display: "flex",
              }}
            />
          </div>
        </div>

        {/* Logo mark */}
        <svg
          width="44"
          height="44"
          viewBox="0 0 1200 1200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M295.875 159.642C277.047 105.848 267.633 78.9506 272.782 57.4955C277.289 38.7193 288.864 22.4047 305.097 11.9483C323.647 0 352.144 0 409.138 0H454.862C485.51 0 500.834 0 513.927 5.08186C525.49 9.57017 535.76 16.8565 543.817 26.2884C552.939 36.9675 558.001 51.431 568.125 80.3579L904.125 1040.36C922.953 1094.15 932.367 1121.05 927.218 1142.5C922.711 1161.28 911.136 1177.6 894.903 1188.05C876.353 1200 847.856 1200 790.862 1200H745.138C714.49 1200 699.166 1200 686.073 1194.92C674.51 1190.43 664.24 1183.14 656.183 1173.71C647.061 1163.03 641.999 1148.57 631.875 1119.64L295.875 159.642Z"
            fill="#E28413"
          />
        </svg>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            Designing The Next
            <br />
            <span style={{ color: "#E28413" }}>Internet.</span>
          </div>
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.45)",
              fontWeight: 400,
              letterSpacing: "0.5px",
            }}
          >
            {process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") ?? "jabborovabduroziq.com"}
          </div>
        </div>

        {/* Bottom name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            J. Abduroziq
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(226,132,19,0.6)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              border: "1px solid rgba(226,132,19,0.25)",
              padding: "6px 16px",
              borderRadius: 100,
            }}
          >
            Developer & Designer
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
