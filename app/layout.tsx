import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "TypeLingo — Pratique digitação com legendas",
  description:
    "Aprenda idiomas e melhore sua velocidade de digitação completando diálogos de legendas .srt",
  icons: {
    icon: "/keyboard.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body>
        <SessionProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1f2937",
                color: "#f3f4f6",
                border: "1px solid #374151",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
              },
              success: {
                iconTheme: { primary: "#34d399", secondary: "#1f2937" },
              },
              error: {
                iconTheme: { primary: "#f87171", secondary: "#1f2937" },
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
