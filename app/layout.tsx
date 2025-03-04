import type { Metadata } from "next/types";
import "./globals.css";
import "./styles/animations.css";
import ThemeProvider from "./providers/ThemeProvider";
import PageTransitions from "./components/PageTransitions";
import Header from "./components/Header";

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
      <body className="min-h-screen bg-white text-black dark:bg-black dark:text-white antialiased">
        <ThemeProvider>
          <PageTransitions>
            <div className="p-4">
              <Header />
              {children}
            </div>
          </PageTransitions>
        </ThemeProvider>
      </body>
    </html>
  );
}
