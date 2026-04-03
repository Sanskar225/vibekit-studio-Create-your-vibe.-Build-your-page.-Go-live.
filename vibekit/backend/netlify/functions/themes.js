// netlify/functions/themes.js  →  GET /api/themes
const { corsHeaders } = require("../../lib/middleware");

const THEMES = [
  {
    id: "minimal", name: "Minimal / Editorial",
    tokens: {
      colorBg:"#FAFAF9", colorSurface:"#FFFFFF", colorText:"#1A1A1A", colorMuted:"#6B6B6B",
      colorAccent:"#1A1A1A", colorBorder:"#E8E8E3",
      fontHeading:"'DM Serif Display', Georgia, serif", fontBody:"'DM Sans', sans-serif",
      heroSize:"clamp(2.5rem,6vw,4.5rem)", fontWeight:"400", lineHeight:"1.7",
      radius:"0px", radiusCard:"0px", radiusBtn:"0px",
      btnBg:"transparent", btnColor:"#1A1A1A", btnBorder:"1.5px solid #1A1A1A",
      shadow:"none", shadowBtn:"none", spacing:"5rem", cardPad:"2rem", letterSpacing:"-0.02em",
    },
  },
  {
    id: "neo-brutal", name: "Neo-Brutal",
    tokens: {
      colorBg:"#FFFBEB", colorSurface:"#FFFFFF", colorText:"#0A0A0A", colorMuted:"#3D3D3D",
      colorAccent:"#FF3B00", colorBorder:"#0A0A0A",
      fontHeading:"'Space Grotesk','Arial Black',sans-serif", fontBody:"'Space Grotesk',Arial,sans-serif",
      heroSize:"clamp(2.75rem,7vw,5.5rem)", fontWeight:"700", lineHeight:"1.5",
      radius:"0px", radiusCard:"0px", radiusBtn:"0px",
      btnBg:"#FF3B00", btnColor:"#FFFFFF", btnBorder:"2.5px solid #0A0A0A",
      shadow:"4px 4px 0 #0A0A0A", shadowBtn:"3px 3px 0 #0A0A0A", spacing:"4.5rem", cardPad:"1.5rem", letterSpacing:"-0.01em",
    },
  },
  {
    id: "dark-neon", name: "Dark / Neon",
    tokens: {
      colorBg:"#0A0A0F", colorSurface:"#13131A", colorText:"#EEEEF0", colorMuted:"#888899",
      colorAccent:"#00FF88", colorBorder:"#2A2A3A",
      fontHeading:"'Syne',sans-serif", fontBody:"'Inter',sans-serif",
      heroSize:"clamp(2.5rem,6vw,5rem)", fontWeight:"800", lineHeight:"1.65",
      radius:"4px", radiusCard:"8px", radiusBtn:"4px",
      btnBg:"transparent", btnColor:"#00FF88", btnBorder:"1px solid #00FF88",
      shadow:"0 0 20px rgba(0,255,136,0.1)", shadowBtn:"0 0 15px rgba(0,255,136,0.4)",
      spacing:"5.5rem", cardPad:"1.75rem", letterSpacing:"0.02em",
    },
  },
  {
    id: "pastel-soft", name: "Pastel / Soft",
    tokens: {
      colorBg:"#FFF8F5", colorSurface:"#FFFFFF", colorText:"#2D2320", colorMuted:"#7D6E6A",
      colorAccent:"#E8756A", colorBorder:"#F0E4DF",
      fontHeading:"'Playfair Display',Georgia,serif", fontBody:"'Lato',sans-serif",
      heroSize:"clamp(2.25rem,5.5vw,4.25rem)", fontWeight:"700", lineHeight:"1.75",
      radius:"12px", radiusCard:"16px", radiusBtn:"999px",
      btnBg:"#E8756A", btnColor:"#FFFFFF", btnBorder:"none",
      shadow:"0 4px 24px rgba(232,117,106,0.12)", shadowBtn:"0 4px 14px rgba(232,117,106,0.35)",
      spacing:"5rem", cardPad:"1.75rem", letterSpacing:"-0.01em",
    },
  },
  {
    id: "luxury-serif", name: "Luxury / Serif",
    tokens: {
      colorBg:"#0F0E0C", colorSurface:"#1A1815", colorText:"#F0EBE3", colorMuted:"#9A9080",
      colorAccent:"#C9A96E", colorBorder:"#2E2B25",
      fontHeading:"'Cormorant Garamond','Garamond',serif", fontBody:"'EB Garamond','Georgia',serif",
      heroSize:"clamp(2.75rem,6.5vw,5rem)", fontWeight:"300", lineHeight:"1.8",
      radius:"2px", radiusCard:"4px", radiusBtn:"2px",
      btnBg:"transparent", btnColor:"#C9A96E", btnBorder:"1px solid #C9A96E",
      shadow:"0 0 0 1px rgba(201,169,110,0.2)", shadowBtn:"none",
      spacing:"6.5rem", cardPad:"2.25rem", letterSpacing:"0.04em",
    },
  },
  {
    id: "retro-pixel", name: "Retro / Pixel",
    tokens: {
      colorBg:"#1A1C2C", colorSurface:"#252741", colorText:"#E8F4EA", colorMuted:"#9BA8B4",
      colorAccent:"#F7C948", colorBorder:"#4A4F6A",
      fontHeading:"'Press Start 2P','Courier New',monospace", fontBody:"'VT323','Courier New',monospace",
      heroSize:"clamp(1.4rem,3.5vw,3rem)", fontWeight:"400", lineHeight:"1.6",
      radius:"0px", radiusCard:"0px", radiusBtn:"0px",
      btnBg:"transparent", btnColor:"#F7C948", btnBorder:"3px solid #F7C948",
      shadow:"4px 4px 0 #F7C948", shadowBtn:"4px 4px 0 #F7C948",
      spacing:"4.5rem", cardPad:"1.5rem", letterSpacing:"0.05em",
    },
  },
];

exports.handler = async () => ({
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "*",
    "Cache-Control": "public, max-age=3600, s-maxage=86400",
  },
  body: JSON.stringify({ success: true, data: { themes: THEMES } }),
});
