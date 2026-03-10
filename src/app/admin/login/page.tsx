'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [slug, setSlug] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Credenciales inválidas');
            }

            if (data.isMaster) {
                router.push('/admin/master');
                return;
            }

            if (data.isDev) {
                localStorage.setItem('vyte_dev_mode', 'true');
            } else {
                localStorage.removeItem('vyte_dev_mode');
            }

            router.push('/admin');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-white selection:text-black overflow-x-hidden relative">
            {/* Fondo decorativo minimalista */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-white/[0.02] rounded-full blur-[120px] max-w-full" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">

                    {/* Encabezado */}
                    <div className="p-12 text-center border-b border-white/5">
                        <h1 className="text-2xl font-black text-white tracking-[0.3em] uppercase mb-2">
                            Vyte <span className="font-thin text-zinc-500 italic">Factory</span>
                        </h1>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-medium">Panel de Acceso Seguro</p>
                    </div>

                    {/* Formulario */}
                    <div className="p-12">
                        <form onSubmit={handleLogin} className="space-y-8">
                            {error && (
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-bold text-center uppercase tracking-widest animate-pulse">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="block text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 ml-1">Cliente ID</label>
                                <input
                                    type="text"
                                    required
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="w-full px-6 py-5 bg-black border border-white/10 rounded-2xl focus:border-white outline-none transition-all font-bold text-white placeholder-zinc-800 tracking-wider text-sm"
                                    placeholder="nombre-del-cliente"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 ml-1">Contraseña</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-6 py-5 bg-black border border-white/10 rounded-2xl focus:border-white outline-none transition-all font-bold text-white placeholder-zinc-800 tracking-[0.5em] text-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:shadow-white/20 disabled:opacity-50 disabled:scale-100"
                            >
                                {loading ? 'Autenticando...' : 'Iniciar Sesión'}
                            </button>
                        </form>

                        <p className="text-center text-[8px] text-zinc-700 mt-12 font-bold tracking-[0.4em] uppercase">
                            Vyte Tech Group — All rights reserved
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
