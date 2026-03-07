'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Settings, LogOut, Plus, Search, Building2, Globe, MoreVertical, ShieldCheck, Zap } from 'lucide-react';

interface Tenant {
    id: string;
    cliente_slug: string;
    createdAt: string;
}

export default function MasterDashboard() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredTenants = tenants.filter(t => t.cliente_slug.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">

            {/* SIDEBAR */}
            <aside className="w-64 border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col hidden md:flex">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">V</div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white leading-none">Vyte</h1>
                            <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Master Control</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-6 flex-1">
                    <nav className="space-y-1">
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium border border-white/10">
                            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                            Overview
                        </a>
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white font-medium transition-colors">
                            <Users className="w-5 h-5" />
                            Clientes
                        </a>
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white font-medium transition-colors">
                            <Settings className="w-5 h-5" />
                            Ajustes Generales
                        </a>
                    </nav>
                </div>

                <div className="p-4 border-t border-[#1a1a1a]">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 font-medium transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto w-full relative">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-6xl mx-auto p-6 md:p-10 relative z-10">

                    {/* TOP HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <h2 className="text-3xl font-black mb-1">¡Hola de nuevo, Varela! 👋</h2>
                            <p className="text-gray-400">Tenés {tenants.length} clientes operando en Vyte Factory hoy.</p>
                        </div>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition font-bold shadow-lg shadow-white/10 active:scale-95 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Nuevo Cliente
                        </button>
                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-[#111] border border-[#222] p-6 rounded-2xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Total Clientes</p>
                                <h4 className="text-2xl font-black">{tenants.length}</h4>
                            </div>
                        </div>
                        <div className="bg-[#111] border border-[#222] p-6 rounded-2xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Sitios Online</p>
                                <h4 className="text-2xl font-black">{tenants.length}</h4>
                            </div>
                        </div>
                        <div className="bg-[#111] border border-[#222] p-6 rounded-2xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Estado del Factory</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <h4 className="text-lg font-bold text-green-400">Operativo</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FILTERS & SEARCH */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            Directorio de Clientes
                        </h3>
                        <div className="relative w-full md:w-64">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#111] border border-[#222] rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* LISTA DE CLIENTES (TABLA/GRID) */}
                    {loading ? (
                        <div className="text-center py-20 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-[#222] border-t-indigo-500 rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium text-sm">Cargando base de datos...</p>
                        </div>
                    ) : (
                        <div>
                            {filteredTenants.length === 0 ? (
                                <div className="text-center py-20 px-6 rounded-3xl bg-[#0a0a0a] border border-dashed border-[#333]">
                                    <Globe className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                    <p className="text-white font-medium mb-1">No hay clientes con ese nombre.</p>
                                    <p className="text-sm text-gray-500">Probá buscando otro slug o creá uno nuevo.</p>
                                </div>
                            ) : (
                                <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-[#222] bg-[#111]">
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente (Slug)</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha de Alta</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#222]">
                                                {filteredTenants.map(tenant => (
                                                    <tr key={tenant.id} className="hover:bg-[#111]/50 transition-colors group">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                                                                    {tenant.cliente_slug.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="font-bold whitespace-nowrap">{tenant.cliente_slug}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-gray-400 whitespace-nowrap">
                                                            {new Date(tenant.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                Activo
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <button
                                                                onClick={() => handleDesignWeb(tenant.cliente_slug)}
                                                                className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2 ml-auto"
                                                            >
                                                                <Settings className="w-4 h-4" />
                                                                Modo Dev (Factory)
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL CREAR CLIENTE */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0f0f0f] border border-[#333] rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-white">Nuevo Cliente</h3>
                                <p className="text-sm text-gray-400 mt-1">Dá de alta un nuevo espacio satélite.</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <Plus className="w-5 h-5" />
                            </div>
                        </div>

                        <form onSubmit={handleCreateClient} className="space-y-5 relative z-10">
                            {error && (
                                <div className="bg-red-500/10 text-red-500 p-3 rounded-xl border border-red-500/20 text-sm font-medium flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-red-500"></div>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Nombre Único / Slug</label>
                                <input
                                    type="text" required autoFocus
                                    value={newSlug} onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="w-full p-3.5 bg-black border border-[#333] rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-white placeholder-gray-700 transition-all"
                                    placeholder="ej: burger-king"
                                />
                                <p className="text-[11px] text-gray-500 font-medium mt-1 uppercase tracking-wider">Usá solo minúsculas y guiones.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Contraseña Privada</label>
                                <input
                                    type="password" required
                                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-3.5 bg-black border border-[#333] rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold tracking-widest text-white placeholder-gray-700 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex gap-3 mt-8 pt-4 border-t border-[#222]">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-5 py-3 bg-transparent text-gray-400 hover:text-white font-bold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit" disabled={creating}
                                    className="flex-1 py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition shadow-lg shadow-white/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                            Fabricando...
                                        </>
                                    ) : 'Crear Espacio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
