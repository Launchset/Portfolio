import { ImageResponse } from "next/og";

export const alt = "Launchset — digital design and automation studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "68px 74px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          position: "relative",
          color: "#eef2ef",
          background: "linear-gradient(125deg,#080d12 8%,#0c1914 60%,#11122a 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ position: "absolute", right: "-50px", top: "48px", width: "520px", height: "330px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(37,211,138,.35)", borderRadius: "50%", transform: "rotate(-12deg)" }}>
          <div style={{ width: "225px", height: "225px", display: "flex", borderRadius: "50%", background: "radial-gradient(circle at 32% 27%,#ddfff1 0 4%,#5ce9af 9%,#1baf71 34%,#343e9c 69%,#0b1021 100%)", boxShadow: "0 30px 80px rgba(77,62,208,.38)" }} />
          <div style={{ position: "absolute", left: "75px", top: "32px", width: "14px", height: "14px", display: "flex", borderRadius: "50%", background: "#25d38a", boxShadow: "0 0 28px #25d38a" }} />
          <div style={{ position: "absolute", right: "87px", bottom: "36px", width: "11px", height: "11px", display: "flex", borderRadius: "50%", background: "#8275ed", boxShadow: "0 0 24px #8275ed" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: "34px", fontWeight: 900, letterSpacing: "1px" }}>
          LAUNCHSET<span style={{ color: "#25d38a" }}>.</span>
        </div>

        <div style={{ width: "790px", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "21px", display: "flex", alignItems: "center", gap: "12px", color: "#25d38a", fontSize: "17px", fontWeight: 700, letterSpacing: "3px" }}>
            <span style={{ width: "9px", height: "9px", display: "flex", borderRadius: "50%", background: "#25d38a" }} />
            DIGITAL DESIGN &amp; AUTOMATION STUDIO
          </div>
          <div style={{ display: "flex", fontSize: "70px", fontWeight: 700, lineHeight: .98, letterSpacing: "-4px" }}>
            Distinctive websites.<br />Useful systems.
          </div>
          <div style={{ marginTop: "24px", display: "flex", color: "#a9b7af", fontSize: "24px" }}>
            Built to save time and create measurable value.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
