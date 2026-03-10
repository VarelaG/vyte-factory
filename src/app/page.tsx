"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="h-screen w-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden flex flex-col">
      {/* Decoración de Fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Navegación - Muy Minimalista */}
        <nav className="flex justify-between items-center px-6 md:px-12 py-8 md:py-12 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4 group cursor-default text-center sm:text-left">
            <span className="text-xl md:text-2xl font-black tracking-[0.3em] uppercase transition-all group-hover:tracking-[0.4em]">
              Vyte <span className="font-thin text-zinc-500 italic">Factory</span>
            </span>
          </div>
          <Link
            href="/admin/login"
            className="px-6 md:px-8 py-3 rounded-full border border-white/10 bg-white text-black hover:scale-105 transition-all font-bold text-[9px] md:text-[10px] uppercase tracking-widest whitespace-nowrap shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Acceso Clientes
          </Link>
        </nav>

        {/* Hero Section - Centrado y Compacto */}
        <main className="flex-grow flex flex-col items-center justify-center px-6 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] text-zinc-500 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.4em] mb-8 md:mb-12">
            <Sparkles className="w-3 h-3 text-white animate-pulse" /> CMS Headless de Alto Rendimiento
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black italic text-white leading-[0.9] tracking-tighter uppercase mb-2 text-center drop-shadow-2xl">
            Gestiona tu sitio <br className="hidden md:block" />
            <span className="text-zinc-600 block md:inline">en tiempo real</span>
          </h1>

          <p className="text-zinc-500 text-sm md:text-lg lg:text-xl max-w-xl mx-auto mb-12 md:mb-16 leading-relaxed font-light tracking-wide px-4">
            Controla el contenido de tus páginas satélite desde un solo lugar. <br className="hidden md:block" />
            Rápido, visual y sin complicaciones.
          </p>

          <div className="flex items-center justify-center">
            <Link
              href="/admin/login"
              className="group flex items-center gap-6 px-12 py-5 bg-white text-black rounded-[2rem] hover:scale-110 active:scale-95 transition-all font-black uppercase tracking-[0.4em] text-[11px] shadow-[0_20px_50px_rgba(255,255,255,0.15)]"
            >
              INGRESAR AL PANEL <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </main>

        {/* Footer Minimalista - Solo una línea */}
        <footer className="px-12 py-12 text-center text-zinc-800 text-[8px] font-bold tracking-[0.6em] uppercase">
          © {new Date().getFullYear()} VYTE FACTORY. BEYOND DIGITAL STANDARDS.
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;400;900&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        ::selection {
          background: white;
          color: black;
        }
      `}</style>
    </div>
  );
}
