"use client";

import Link from "next/link";
import Image from "next/image";
import { Shield, Sparkles, Layout, Globe, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
      {/* Decoración de Fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Navegación */}
        <nav className="flex justify-between items-center px-8 py-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="relative w-12 h-12 overflow-hidden rounded-xl border border-white/10 group-hover:border-white/30 transition-colors">
              <Image
                src="/logo.png"
                alt="Vyte Logo"
                fill
                className="object-cover scale-150"
              />
            </div>
            <span className="text-2xl font-black tracking-[0.2em] uppercase">Vyte <span className="font-thin text-zinc-500">Factory</span></span>
          </div>
          <Link
            href="/admin/login"
            className="px-8 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white hover:text-black transition-all font-bold text-xs uppercase tracking-widest"
          >
            Acceso Clientes
          </Link>
        </nav>

        {/* Sección Hero */}
        <section className="px-8 pt-24 pb-40 max-w-7xl mx-auto text-center border-b border-white/[0.03]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-12">
            <Sparkles className="w-3 h-3 text-white" /> CMS DE PRÓXIMA GENERACIÓN
          </div>

          <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter mb-12 leading-[0.85] uppercase italic">
            EL CORAZÓN DE <br />
            <span className="text-zinc-500">TUS SATÉLITES</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-16 leading-relaxed font-light">
            Vyte Factory es un CMS Headless de alto rendimiento diseñado para gestionar sitios web de lujo con actualizaciones en tiempo real y control total.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href="/admin/login"
              className="px-12 py-5 bg-white text-black font-black rounded-full hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              Comenzar Ahora <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="px-12 py-5 border border-white/10 bg-white/5 backdrop-blur-md rounded-full text-zinc-400 font-bold uppercase tracking-widest text-xs flex items-center">
              V 2.0 Estable
            </div>
          </div>
        </section>

        {/* Cuadrícula de Funciones */}
        <section className="px-8 py-32 max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="p-10 rounded-[2rem] border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-6 uppercase tracking-tight">Sincronización</h3>
            <p className="text-zinc-500 leading-relaxed font-medium">Distribuye contenido en múltiples dominios independientes con latencia cero usando nuestra API nativa.</p>
          </div>

          <div className="p-10 rounded-[2rem] border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-transform">
              <Layout className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-6 uppercase tracking-tight">Modelado Visual</h3>
            <p className="text-zinc-500 leading-relaxed font-medium">Diseña tu estructura de contenido visualmente. Agrega texto, imágenes y campos personalizados sin código.</p>
          </div>

          <div className="p-10 rounded-[2rem] border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-6 uppercase tracking-tight">Núcleo Seguro</h3>
            <p className="text-zinc-500 leading-relaxed font-medium">Seguridad de grado empresarial sobre Vercel y Prisma. Tus datos de negocio están encriptados y protegidos.</p>
          </div>
        </section>

        {/* Pie de página */}
        <footer className="px-8 py-20 border-t border-white/[0.03] text-center text-zinc-600 text-[10px] font-bold tracking-[0.4em] uppercase">
          © {new Date().getFullYear()} VYTE FACTORY. CONSTRUIDO PARA EL FUTURO.
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;400;900&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
