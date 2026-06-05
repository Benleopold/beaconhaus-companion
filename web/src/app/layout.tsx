import type { Metadata, Viewport } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { RegisterSW } from "@/components/register-sw";
import { CopilotProvider } from "@/components/copilot/CopilotProvider";
import { CopilotLauncher } from "@/components/copilot/CopilotLauncher";
import { CopilotOverlay } from "@/components/copilot/CopilotOverlay";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "BeaconHaus",
  description: "A calm daily ritual for tending your warm network. Illuminating Life, Legacy, and Love.",
  applicationName: "BeaconHaus",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "BeaconHaus" },
  icons: { icon: "/icon.svg", apple: "/icon-180.png" },
};

export const viewport: Viewport = {
  themeColor: "#faf5ec",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${fraunces.variable} antialiased`}>
        <CopilotProvider>
          <AppShell>{children}</AppShell>
          <CopilotLauncher />
          <CopilotOverlay />
        </CopilotProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
