import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Space Station | Portal Astronaut",
  description: "Multi-user authentication system with space theme",
  icons: {
    icon: "/favicon.ico",
  },
};

const themeScript = `
(() => {
  try {
    const mode = localStorage.getItem("space-station-theme");
    const isLight = mode === "light";

    document.documentElement.classList.toggle("light", isLight);
    document.documentElement.style.colorScheme = isLight ? "light" : "dark";
  } catch (error) {
    document.documentElement.classList.remove("light");
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-slate-950 text-white`}>
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
