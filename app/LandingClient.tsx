"use client";

import { signIn } from "next-auth/react";
import { Keyboard, FileText, BarChart2, Globe } from "lucide-react";

export default function LandingClient() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <Keyboard size={32} className="text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">TypeLingo</h1>
        </div>

        <p className="text-xl text-gray-400 max-w-lg mb-4 leading-relaxed">
          Pratique digitação enquanto aprende idiomas com diálogos reais de legendas .srt
        </p>
        <p className="text-gray-600 text-sm mb-10 max-w-sm">
          Faça upload de qualquer legenda, complete as frases e acompanhe seu progresso de
          qualquer dispositivo.
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="flex items-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg text-base"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Entrar com Google
        </button>
      </section>

      {/* Features */}
      <section className="border-t border-gray-900 py-16 px-4">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8">
          {[
            {
              icon: <FileText size={24} className="text-emerald-400" />,
              title: "Qualquer legenda",
              desc: "Importe arquivos .srt de filmes, séries e cursos no idioma que você quer aprender.",
            },
            {
              icon: <Keyboard size={24} className="text-blue-400" />,
              title: "Digitação imersiva",
              desc: "Complete diálogos reais palavra a palavra com feedback visual instantâneo.",
            },
            {
              icon: <BarChart2 size={24} className="text-purple-400" />,
              title: "Progresso sincronizado",
              desc: "Continue de onde parou em qualquer dispositivo. Seu avanço fica salvo automaticamente.",
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col gap-3">
              <div className="p-2.5 rounded-xl bg-gray-900 w-fit">{f.icon}</div>
              <h3 className="font-semibold text-gray-100">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-gray-700 border-t border-gray-900">
        TypeLingo &copy; {new Date().getFullYear()}
      </footer>
    </main>
  );
}
