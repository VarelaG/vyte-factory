import Link from "next/link";
import { Zap, Shield, Sparkles, Layout, Globe, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Vyte <span className="text-indigo-400">Factory</span></span>
          </div>
          <Link
            href="/admin/login"
            className="px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition font-medium text-sm"
          >
            Client Login
          </Link>
        </nav>

        {/* Hero Section */}
        <section className="px-8 pt-20 pb-32 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8 animate-pulse">
            <Sparkles className="w-3 h-3" /> Next Generation CMS
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            THE HEART OF YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">DIGITAL SATELLITES</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Vyte Factory is a high-performance headless CMS designed to manage high-end satellite websites with real-time updates and effortless control.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/admin/login"
              className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-indigo-400 hover:text-white transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="px-10 py-4 border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl text-gray-300 font-medium">
              V 2.0 Stable
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-8 py-32 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-white/5 bg-[#0a0a0a] hover:border-indigo-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Satellite Sync</h3>
            <p className="text-gray-500 leading-relaxed">Distribute content across multiple independent domains with zero latency using our edge-native API.</p>
          </div>

          <div className="p-8 rounded-3xl border border-white/5 bg-[#0a0a0a] hover:border-purple-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
              <Layout className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Visual Modeler</h3>
            <p className="text-gray-500 leading-relaxed">Design your content structure visually. Add text, images, and custom fields without writing a single line of code.</p>
          </div>

          <div className="p-8 rounded-3xl border border-white/5 bg-[#0a0a0a] hover:border-pink-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 text-pink-400 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Secure Core</h3>
            <p className="text-gray-500 leading-relaxed">Enterprise-grade security on top of Vercel and Prisma. Your business data is encrypted and persistent.</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-8 py-12 border-t border-white/5 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} VYTE FACTORY. BUILT FOR THE FUTURE.
        </footer>
      </div>

      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </div>
  );
}
