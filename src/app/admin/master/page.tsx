'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Tenant {
    id: string;
    cliente_slug: string;
    createdAt: string;
}

export default function MasterDashboard() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Formulario Nuevo Cliente
    const [newSlug, setNewSlug] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();

    useEffect(() => {
        loadTenants();
    }, []);

    const loadTenants = async () => {
        try {
            const res = await fetch('/api/master/tenants');
            if (!res.ok) {
                if (res.status === 401) router.push('/admin/login');
                throw new Error('No autorizado');
            }
            const data = await res.json();
            setTenants(data.tenants);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setCreating(true);

        try {
            const res = await fetch('/api/master/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: newSlug, password: newPassword })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al crear');

            // Agregamos a la lista
            setTenants([data.tenant, ...tenants]);
            setModalOpen(false);
            setNewSlug('');
            setNewPassword('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDesignWeb = (slug: string) => {
        // Para entrar a diseñar un cliente, seteamos su cookie simulando que somos él,
        // Y seteamos la bandera de DEV_MODE localmente para que se active su panel
        document.cookie = `vyte_session=${slug}; path=/`;
        localStorage.setItem('vyte_dev_mode', 'true');
        router.push('/admin');
    };

    const handleLogout = () => {
        document.cookie = 'vyte_master_session=; Max-Age=0; path=/;';
        router.push('/admin/login');
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto p-4 sm:p-8 min-h-screen bg-black text-white font-sans">
            {/* HEADER MASTER PREMIUM */}
            <header className="bg-indigo-950/30 p-6 rounded-3xl shadow-lg shadow-indigo-500/10 border border-indigo-500/20 flex justify-between items-center mb-10 overflow-hidden relative backdrop-blur-md">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/40">Vy</div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white leading-none">Global Control</h1>
                        <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase">Vyte Master Panel</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition font-black text-sm shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
                    >
                        <span>+</span> Nuevo Cliente
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2.5 text-indigo-300 hover:text-red-400 bg-indigo-950/50 border border-indigo-500/30 hover:bg-red-500/10 hover:border-red-500/20 rounded-xl transition"
                        title="Cerrar Panel Vyte"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            </header>

            {/* LISTA DE CLIENTES */}
            {loading ? (
                <div className="text-center py-20 flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 border-4 border-indigo-900 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-indigo-400 font-bold tracking-widest text-sm uppercase">Cargando Red Vyte...</p>
                </div>
            ) : (
                <div className="mb-10">
                    <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-sm">🗂️</span>
                        Tus Clientes Activos ({tenants.length})
                    </h2>

                    {tenants.length === 0 ? (
                        <div className="text-center py-16 px-6 rounded-3xl bg-[#0a0a0a] border border-dashed border-gray-800">
                            <p className="text-gray-400 font-medium mb-1">Aún no fabricaste ningún cliente.</p>
                            <p className="text-sm text-gray-600">Hacé click en "Nuevo Cliente" para empezar.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tenants.map(tenant => (
                                <div key={tenant.id} className="relative group p-6 bg-[#111] rounded-2xl border border-gray-800 shadow-sm hover:border-indigo-500/50 transition-all duration-300 flex flex-col h-full hover:shadow-indigo-500/10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Activo</span>
                                        </div>
                                        <h3 className="text-xl font-black text-white truncate" title={tenant.cliente_slug}>
                                            {tenant.cliente_slug}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Creado: {new Date(tenant.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-800">
                                        <button
                                            onClick={() => handleDesignWeb(tenant.cliente_slug)}
                                            className="w-full p-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition shadow-lg shadow-white/5 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                            Diseñar su Web
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL CREAR CLIENTE */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-black text-white mb-6">Crear Nuevo Cliente</h3>

                        <form onSubmit={handleCreateClient} className="space-y-5">
                            {error && (
                                <div className="bg-red-950/50 text-red-500 p-3 rounded-xl border border-red-900/50 text-sm font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Nombre Único / Slug</label>
                                <input
                                    type="text" required autoFocus
                                    value={newSlug} onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="w-full p-4 bg-black border border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-white placeholder-gray-700"
                                    placeholder="ej: burger-king"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Contraseña Privada</label>
                                <input
                                    type="password" required
                                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-4 bg-black border border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold tracking-widest text-white placeholder-gray-700"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex gap-4 mt-8 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 p-3 bg-transparent text-gray-400 hover:text-white border border-gray-800 hover:bg-gray-800 rounded-xl font-bold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit" disabled={creating}
                                    className="flex-1 p-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    {creating ? 'Creando...' : 'Crear y Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
