import type { Metadata } from "next/types";
import "./globals.css";
import "./styles/animations.css";
import { Toaster } from "sonner";
import ThemeProvider from "@/providers/ThemeProvider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { PaymentProvider } from "@/context/payment-context";

import { SessionProvider } from "@/context/session-context";

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
      <body className="">
        <ReactQueryProvider>
          <ThemeProvider>
            <PaymentProvider>
              <SessionProvider>
              <div className="">
                
                {children}
              </div>
              </SessionProvider>
            </PaymentProvider>
            <Toaster />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
