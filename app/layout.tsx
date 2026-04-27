import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Resenha Aposta",
    template: "%s | Resenha Aposta",
  },
  description:
    "Plataforma de palpites esportivos com jogos, apostas, ranking e blog.",
  applicationName: "Resenha Aposta",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-linear-to-b from-primary/12 via-background to-primary/8 dark:text-foreground">
        <ThemeProvider>
          <Header />
          <div className="flex flex-1 min-h-0 pt-16">
            <Suspense fallback={null}>
              <Sidebar />
            </Suspense>
            <main className="flex-1 min-h-screen md:ml-64 p-6 overflow-x-hidden bg-linear-to-b from-primary/10 via-background to-primary/6">
              {children}
            </main>
          </div>
          <Footer />
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
