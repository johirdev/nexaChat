import { ImageResponse } from "next/og";
import { siteTagline, siteUrl } from "@/src/lib/seo";

export const alt = "NexaChat — realtime chat for your people";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The social card, generated at build time.
 *
 * Kept to shapes, gradients and text: this renders through Satori, which
 * supports a subset of CSS, so every element carries an explicit `display` and
 * nothing relies on a font we have not shipped.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 76px",
          backgroundColor: "#070c1a",
          backgroundImage:
            "radial-gradient(circle at 82% 8%, rgba(139,77,255,0.34), transparent 55%), radial-gradient(circle at 6% 92%, rgba(31,209,180,0.22), transparent 52%)",
        }}
      >
        {/* brand */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 76,
              height: 76,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 24,
              backgroundImage:
                "linear-gradient(135deg, #1fd1b4 0%, #35d0e0 32%, #4a8cf7 66%, #8b4dff 100%)",
              color: "#04121c",
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: 22,
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: -1.4,
            }}
          >
            <span style={{ color: "#f2f6ff" }}>Nexa</span>
            <span style={{ color: "#35d0e0" }}>Chat</span>
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 74,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.05,
              color: "#f2f6ff",
            }}
          >
            Every message,
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 74,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.05,
              color: "#35d0e0",
              marginTop: 6,
            }}
          >
            the moment you send it.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 28,
              color: "#a5b3d1",
            }}
          >
            {siteTagline} · direct chats, groups and live delivery.
          </div>
        </div>

        {/* footer chips */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {["No password", "Live over WebSocket", "Groups & admins"].map(
            (chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: 14,
                  padding: "12px 24px",
                  borderRadius: 999,
                  border: "1px solid rgba(150,172,224,0.26)",
                  color: "#a5b3d1",
                  fontSize: 24,
                }}
              >
                {chip}
              </div>
            ),
          )}
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              color: "#7386ac",
              fontSize: 24,
            }}
          >
            {siteUrl.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
