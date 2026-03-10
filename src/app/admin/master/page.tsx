'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Settings, LogOut, Plus, Search, Building2, Globe, MoreVertical, ShieldCheck, Zap, Trash2 } from 'lucide-react';

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

    const handleDeleteTenant = async (slug: string) => {
        if (!confirm(`¿Estás seguro de que querés ELIMINAR permanentemente a "${slug}"? Esta acción no se puede deshacer.`)) return;

        try {
            const res = await fetch(`/api/master/tenants?slug=${slug}`, {
                method: 'DELETE'
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al eliminar');

            // Actualizamos la lista localmente
            setTenants(prev => prev.filter(t => t.cliente_slug !== slug));
        } catch (err: any) {
            alert("Error: " + err.message);
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
        <div className="flex flex-col md:flex-row h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden">

            {/* BARRA SUPERIOR MÓVIL */}
            <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#0a0a0a] border-b border-white/5 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-black text-sm shadow-xl">V</div>
                    <span className="text-sm font-black uppercase tracking-widest italic">Vyte Factory</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-white/5 text-zinc-500 hover:text-white transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </header>

            {/* SIDEBAR (Escritorio) */}
            <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col hidden md:flex">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black font-black text-2xl shadow-[0_10px_30px_rgba(255,255,255,0.15)] italic">
                            V
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-white leading-none uppercase italic">Vyte</h1>
                            <span className="text-[9px] font-black text-zinc-600 tracking-[0.3em] uppercase mt-1">Master Control</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-8 flex-1">
                    <nav className="space-y-1">
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-bold border border-white/10 text-xs uppercase tracking-widest">
                            <LayoutDashboard className="w-4 h-4" />
                            Overview
                        </a>
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white font-bold transition-colors text-xs uppercase tracking-widest">
                            <Users className="w-4 h-4" />
                            Clientes
                        </a>
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white font-bold transition-colors text-xs uppercase tracking-widest">
                            <Settings className="w-4 h-4" />
                            Ajustes
                        </a>
                    </nav>
                </div>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-zinc-600 hover:text-white font-bold transition-all text-xs uppercase tracking-widest"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto w-full relative h-[calc(100vh-64px)] md:h-screen">
                {/* Decoración */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.01] rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto p-6 md:p-12 lg:p-16 relative z-10">

                    {/* TOP HEADER */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Sistema Centralizado</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white italic uppercase tracking-tighter leading-tight">
                                ¡Hola de nuevo, <span className="text-zinc-600">Varela!</span>
                            </h2>
                            <p className="text-zinc-500 font-bold mt-2 uppercase tracking-[0.2em] text-[11px]">Controlando {tenants.length} satélites en tiempo real</p>
                        </div>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="w-full lg:w-auto px-10 py-5 bg-white text-black rounded-2xl hover:scale-105 transition-all font-black uppercase tracking-widest text-[12px] shadow-[0_15px_40px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Plus className="w-5 h-5" /> Nuevo Cliente
                        </button>
                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        <div className="group relative p-10 bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/5 transition-colors"></div>
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors duration-500">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Total Clientes</p>
                                    <h4 className="text-4xl font-black text-white">{tenants.length}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="group relative p-10 bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/5 transition-colors"></div>
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors duration-500">
                                    <Globe className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Sitios Activos</p>
                                    <h4 className="text-4xl font-black text-white">{tenants.length}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="group relative p-10 bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden shadow-2xl sm:col-span-2 lg:col-span-1">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/5 transition-colors"></div>
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors duration-500">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Estatus Core</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
                                        <h4 className="text-2xl font-black text-white italic tracking-tight">OPERATIVO</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONTROL SECTION */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8">
                        <div>
                            <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">
                                Directorio <span className="text-zinc-700">Visual</span>
                            </h3>
                        </div>
                        <div className="relative w-full md:w-96 group">
                            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Filtrar por slug..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm outline-none focus:border-white/20 transition-all font-black"
                            />
                        </div>
                    </div>

                    {/* LISTA DE CLIENTES */}
                    {loading ? (
                        <div className="text-center py-32 flex flex-col items-center gap-6">
                            <div className="w-12 h-12 border-4 border-zinc-900 border-t-white rounded-full animate-spin"></div>
                            <p className="text-zinc-700 font-black text-[10px] uppercase tracking-[0.3em]">Accediendo al Core...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredTenants.length === 0 ? (
                                <div className="text-center py-32 px-10 rounded-[4rem] bg-white/[0.01] border border-dashed border-white/10">
                                    <Building2 className="w-16 h-16 text-zinc-900 mx-auto mb-6" />
                                    <p className="text-zinc-600 font-black uppercase tracking-[0.3em] mb-2">No se encontraron satélites</p>
                                    <p className="text-[10px] text-zinc-800 font-black uppercase tracking-[0.2em]">Intentá con otro nombre o creá uno nuevo.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {filteredTenants.map(tenant => (
                                        <div key={tenant.id} className="group relative bg-[#0a0a0a] border border-white/5 p-6 md:p-8 rounded-[2rem] hover:border-white/20 transition-all duration-500 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">

                                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.01] rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2 transition-colors group-hover:bg-white/[0.03]"></div>

                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 font-black text-xl group-hover:bg-white group-hover:text-black transition-all duration-500 italic shadow-2xl">
                                                    {tenant.cliente_slug.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h5 className="text-xl font-black text-white italic tracking-tighter uppercase group-hover:tracking-normal transition-all duration-500">{tenant.cliente_slug}</h5>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Registrado: {new Date(tenant.createdAt).toLocaleDateString('es-AR')}</span>
                                                        <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                                                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-white uppercase tracking-widest">
                                                            Online
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 pt-4 md:pt-0 border-t border-white/5 md:border-0">
                                                <button
                                                    onClick={() => handleDesignWeb(tenant.cliente_slug)}
                                                    className="flex-1 md:flex-none px-6 py-4 bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:border-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <Settings className="w-4 h-4" /> Entrar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTenant(tenant.cliente_slug)}
                                                    className="p-4 bg-zinc-950 text-zinc-700 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all active:scale-90"
                                                    title="Eliminar Cliente"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="px-12 py-16 text-center text-zinc-900 text-[9px] font-black tracking-[0.5em] uppercase border-t border-white/[0.02]">
                    Vyte Core Console — Authorized Access Only
                </footer>
            </main>

            {/* MODAL CREAR CLIENTE */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 z-[100]">
                    <div className="bg-[#050505] border border-white/10 rounded-[3rem] p-10 md:p-16 max-w-xl w-full shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                        <div className="flex flex-col items-center text-center mb-12">
                            <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center text-black mb-8 shadow-2xl">
                                <Plus className="w-10 h-10" />
                            </div>
                            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Nueva <span className="text-zinc-600 font-thin not-italic">Entidad</span></h3>
                            <p className="text-[10px] text-zinc-500 font-black tracking-[0.3em] uppercase mt-3">Expansión de la Red Satélite</p>
                        </div>

                        <form onSubmit={handleCreateClient} className="space-y-8 relative z-10">
                            {error && (
                                <div className="bg-white/5 text-white/50 p-5 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500 mb-4 ml-6">Identificador (Slug)</label>
                                <input
                                    type="text" required autoFocus
                                    value={newSlug} onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="w-full px-8 py-6 bg-[#0a0a0a] border border-white/5 rounded-3xl outline-none focus:border-white transition-all font-black text-white placeholder-zinc-900 text-sm"
                                    placeholder="ej: mi-cliente"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500 mb-4 ml-6">Acceso Privado</label>
                                <input
                                    type="password" required
                                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-8 py-6 bg-[#0a0a0a] border border-white/5 rounded-3xl outline-none focus:border-white transition-all font-black text-white placeholder-zinc-900 text-sm tracking-[0.5em]"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex flex-col gap-4 mt-12">
                                <button
                                    type="submit" disabled={creating}
                                    className="w-full py-6 bg-white text-black font-black rounded-3xl hover:scale-105 transition-all shadow-2xl active:scale-95 disabled:opacity-50 text-xs uppercase tracking-[0.2em]"
                                >
                                    {creating ? 'Inyectando...' : 'Autorizar Creación'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="w-full py-4 text-zinc-700 hover:text-white font-black transition-colors text-[10px] uppercase tracking-widest"
                                >
                                    Abortar Operación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
