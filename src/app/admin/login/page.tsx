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

            // Si es la cuenta principal de Vyte
            if (data.isMaster) {
                router.push('/admin/master');
                return;
            }

            // El servidor seteó una cookie 'vyte_session'. 
            // Opcional: guardamos un flag en localStorage por si es Admin entrando a un cliente viejo
            if (data.isDev) {
                localStorage.setItem('vyte_dev_mode', 'true');
            } else {
                localStorage.removeItem('vyte_dev_mode');
            }

            router.push('/admin'); // Redirigimos al panel del cliente

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
            <div className="w-full max-w-md bg-[#111] rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden border border-gray-800">

                {/* Banner superior negro (Branding Vyte) */}
                <div className="bg-black p-8 text-center relative overflow-hidden border-b border-gray-800">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Vyte Factory</h1>
                    <p className="text-gray-400 mt-2 text-sm font-medium">Headless Core CMS</p>
                </div>

                {/* Formulario */}
                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">

                        {error && (
                            <div className="bg-red-950/50 text-red-500 p-3 rounded-xl border border-red-900/50 text-sm font-medium text-center animate-pulse">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Usuario (Cliente Slug)</label>
                            <input
                                type="text"
                                required
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                className="w-full p-4 bg-black border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-white placeholder-gray-600"
                                placeholder="ej: peluqueria-marcos"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Contraseña</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 bg-black border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium tracking-widest text-white placeholder-gray-600"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full p-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-lg shadow-white/10 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? 'Validando Acceso...' : 'Ingresar a mi Panel'}
                        </button>

                    </form>

                    <p className="text-center text-xs text-gray-600 mt-8 font-medium">
                        Desarrollado con 🖤 por Vyte. Todos los derechos reservados.
                    </p>
                </div>

            </div>
        </div>
    );
}
