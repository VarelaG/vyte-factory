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
            className="px-6 md:px-8 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white hover:text-black transition-all font-bold text-[9px] md:text-[10px] uppercase tracking-widest whitespace-nowrap"
          >
            Acceso Clientes
          </Link>
        </nav>

        {/* Hero Section - Centrado y Compacto */}
        <main className="flex-grow flex flex-col items-center justify-center px-6 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] text-zinc-500 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.4em] mb-8 md:mb-12">
            <Sparkles className="w-3 h-3 text-white animate-pulse" /> CMS Headless de Alto Rendimiento
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-[9rem] lg:text-[10rem] font-black tracking-tighter mb-8 md:mb-10 leading-[0.9] md:leading-[0.8] uppercase italic max-w-[90vw]">
            GESTIONA TU SITIO <br />
            <span className="text-zinc-600">EN TIEMPO REAL</span>
          </h1>

          <p className="text-zinc-500 text-sm md:text-lg lg:text-xl max-w-xl mx-auto mb-12 md:mb-16 leading-relaxed font-light tracking-wide px-4">
            Controla el contenido de tus páginas satélite desde un solo lugar. <br className="hidden md:block" />
            Rápido, visual y sin complicaciones.
          </p>

          <div className="flex items-center justify-center">
            <Link
              href="/admin/login"
              className="group flex items-center gap-4 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-white hover:text-zinc-400 transition-all"
            >
              INGRESAR AL PANEL <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
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
