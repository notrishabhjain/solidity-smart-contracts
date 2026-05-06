import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mantra TTS — Sacred Sanskrit Audio Generator",
  description:
    "Generate high-quality devotional audio for Sanskrit mantras, Jain stotras, and Hindi shlokas using AI voice synthesis.",
  keywords: ["mantra", "sanskrit", "tts", "jain", "stotra", "chanting", "meditation"],
};

export const viewport: Viewport = {
  themeColor: "#0a0807",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-spiritual-bg mantra-bg antialiased">
        {children}
      </body>
    </html>
  );
}
