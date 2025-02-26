import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "./providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Ohh.tc - International Payments Platform",
  description: "Send international payments with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-brand-black dark:bg-brand-black dark:text-white antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
