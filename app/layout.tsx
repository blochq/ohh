import type { Metadata } from "next/types";
import "./globals.css";
import "./styles/animations.css";
import { Toaster } from "sonner";
import ThemeProvider from "./providers/ThemeProvider";
import ReactQueryProvider from "./providers/ReactQueryProvider";
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
        <ReactQueryProvider>
          <ThemeProvider>
            <div className="p-4">
              <Header />
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
