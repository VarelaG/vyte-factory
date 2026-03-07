'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Settings, LogOut, Check, Image as ImageIcon, Type, AlignLeft, Trash2, Plus, Terminal, RefreshCw, Upload } from 'lucide-react';

type FieldType = 'text' | 'textarea' | 'image';
interface DynamicField {
    id: string;
    label: string;
    type: FieldType;
    value: string;
}

// Utilidad simple para leer cookies front-end
function getCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
}

export default function AdminDashboard() {
    const [tenantSlug, setTenantSlug] = useState<string>('');
    const [config, setConfig] = useState<{ fields: DynamicField[] }>({ fields: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [devMode, setDevMode] = useState(false);

    // Para Modo Dev, leemos si este usuario ingresó con password maestro
    const [isDevUser, setIsDevUser] = useState(false);

    const [newField, setNewField] = useState<Partial<DynamicField>>({ type: 'text', id: '', label: '', value: '' });
    const router = useRouter();

    // 1. Verificar Sesión Inicial
    useEffect(() => {
        const sessionCookie = getCookie('vyte_session');

        if (!sessionCookie) {
            router.push('/admin/login');
            return;
        }

        setTenantSlug(sessionCookie);
        setIsDevUser(localStorage.getItem('vyte_dev_mode') === 'true');
        loadTenantData(sessionCookie);
    }, [router]);

    async function loadTenantData(slug: string) {
        try {
            const response = await fetch(`/api/tenant?slug=${slug}`);
            if (response.ok) {
                const data = await response.json();
                const parsedConfig = typeof data.config === 'string' ? JSON.parse(data.config) : data.config;
                setConfig({ fields: parsedConfig?.fields || [] });
            }
        } catch (err) {
            console.error("Error al cargar tenant:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = () => {
        document.cookie = 'vyte_session=; Max-Age=0; path=/;';
        localStorage.removeItem('vyte_dev_mode');
        router.push('/admin/login');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/tenant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cliente_slug: tenantSlug,
                    config,
                    password: 'skip-if-cookie'
                })
            });

            if (!res.ok) throw new Error((await res.json()).error);
            alert('✅ Cambios guardados y publicados con éxito.');
        } catch (err: any) {
            alert('❌ Error al publicar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateFieldValue = (id: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            fields: prev.fields.map(f => f.id === id ? { ...f, value } : f)
        }));
    };

    const uploadImage = async (file: File, fieldId: string) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('slug', tenantSlug);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Error subiendo imagen');
            const { url } = await res.json();
            updateFieldValue(fieldId, url);
        } catch (err) {
            alert("Error local al subir foto.");
        }
    };

    const addNewField = () => {
        if (!newField.id || !newField.label) {
            alert('El ID y el Label son obligatorios para crear el campo.');
            return;
        }
        if (config.fields.some(f => f.id === newField.id)) {
            alert('Ese ID ya existe en este cliente.');
            return;
        }

        setConfig(prev => ({
            ...prev,
            fields: [...prev.fields, newField as DynamicField]
        }));
        setNewField({ type: 'text', id: '', label: '', value: '' });
    };

    const removeField = (id: string) => {
        if (!confirm("¿Eliminar este bloque destructivamente?")) return;
        setConfig(prev => ({
            ...prev,
            fields: prev.fields.filter(f => f.id !== id)
        }));
    };

    if (!tenantSlug) return null;

    return (
        <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">

            {/* SIDEBAR CLIENTE */}
            <aside className="w-64 border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col hidden md:flex">
                <div className="p-6 border-b border-[#1a1a1a]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            {tenantSlug.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <h1 className="text-lg font-bold tracking-tight text-white leading-none truncate">{tenantSlug}</h1>
                            <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Client Space</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-6 flex-1">
                    <nav className="space-y-1">
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium border border-white/10">
                            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                            Gestión Web
                        </a>
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white font-medium transition-colors">
                            <Settings className="w-5 h-5" />
                            Ajustes Avanzados
                        </a>
                    </nav>

                    {isDevUser && (
                        <div className="mt-8 border-t border-[#1a1a1a] pt-6">
                            <p className="px-4 text-[10px] font-black tracking-widest uppercase text-indigo-500 mb-2">Vyte Tools</p>
                            <button
                                onClick={() => setDevMode(!devMode)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${devMode ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'}`}
                            >
                                <Terminal className="w-5 h-5" />
                                {devMode ? 'Modo Dev Activo' : 'Activar Modo Dev'}
                            </button>
                        </div>
                    )}
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
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-5xl mx-auto p-6 md:p-10 relative z-10">

                    {/* TOP HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 bg-[#111]/80 backdrop-blur-md p-6 rounded-3xl border border-[#222] shadow-sm">
                        <div>
                            <h2 className="text-2xl font-black mb-1 flex items-center gap-2 text-white">
                                Modelador Visual
                            </h2>
                            <p className="text-sm text-gray-400">Actualizá el contenido de tu web en tiempo real.</p>
                        </div>
                        <div className="flex gap-3">
                            {isDevUser && (
                                <button
                                    onClick={() => loadTenantData(tenantSlug)}
                                    className="px-4 py-2.5 bg-[#111] border border-[#333] text-white rounded-xl hover:bg-[#222] transition shadow-sm flex items-center justify-center"
                                    title="Recargar de BD"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2.5 bg-white text-black rounded-xl hover:bg-gray-200 transition font-black shadow-lg shadow-white/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[180px]"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        Publicando...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" /> Guardar y Publicar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ÁREA DE TRABAJO */}
                    {loading ? (
                        <div className="text-center py-20 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-[#222] border-t-indigo-500 rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium text-sm">Cargando módulos de diseño...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">

                            {/* EDITOR DE CONFIG (CLIENTE) */}
                            {config.fields.length === 0 ? (
                                <div className="text-center py-16 px-6 rounded-3xl bg-[#0a0a0a] border border-dashed border-[#333]">
                                    <LayoutDashboard className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                    <p className="text-white font-medium mb-1">Tu diseño modular todavía no tiene campos habilitados.</p>
                                    <p className="text-sm text-gray-500">Si sos administrador Vyte, activá el modo Dev para inyectar bloques.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {config.fields.map(field => (
                                        <div key={field.id} className="relative flex flex-col group p-6 bg-[#0f0f0f] rounded-2xl border border-[#222] shadow-sm hover:border-[#444] transition-colors duration-300">

                                            {/* Etiqueta del campo */}
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-4">
                                                {field.type === 'text' && <Type className="w-4 h-4 text-gray-500" />}
                                                {field.type === 'textarea' && <AlignLeft className="w-4 h-4 text-gray-500" />}
                                                {field.type === 'image' && <ImageIcon className="w-4 h-4 text-gray-500" />}
                                                {field.label}
                                            </label>

                                            {field.type === 'text' && (
                                                <input
                                                    type="text"
                                                    value={field.value}
                                                    onChange={(e) => updateFieldValue(field.id, e.target.value)}
                                                    className="w-full p-4 bg-[#050505] border border-[#222] rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium transition-all text-white placeholder-gray-600"
                                                    placeholder={`Ingresa ${field.label.toLowerCase()}`}
                                                />
                                            )}

                                            {field.type === 'textarea' && (
                                                <textarea
                                                    rows={4}
                                                    value={field.value}
                                                    onChange={(e) => updateFieldValue(field.id, e.target.value)}
                                                    className="w-full p-4 bg-[#050505] border border-[#222] rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium transition-all text-white placeholder-gray-600 resize-y"
                                                    placeholder={`Ingresa texto para ${field.label.toLowerCase()}`}
                                                />
                                            )}

                                            {field.type === 'image' && (
                                                <div className="flex flex-col gap-4">
                                                    {field.value ? (
                                                        <div className="relative rounded-xl overflow-hidden border border-[#222] aspect-video w-full bg-[#050505] flex items-center justify-center group/img">
                                                            <img src={field.value} alt={field.label} className="w-full h-full object-cover transition-transform group-hover/img:scale-105 duration-500" />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                                <span className="text-white font-bold flex items-center gap-2"><Upload className="w-4 h-4" /> Cambiar</span>
                                                            </div>
                                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], field.id)} />
                                                        </div>
                                                    ) : (
                                                        <div className="relative w-full aspect-video bg-[#050505] hover:bg-[#111] transition-colors rounded-xl flex flex-col items-center justify-center text-gray-500 text-sm font-medium border border-dashed border-[#333] group/upload">
                                                            <Upload className="w-6 h-6 mb-2 text-gray-600 group-hover/upload:text-indigo-400 transition-colors" />
                                                            Click para subir imagen
                                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], field.id)} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Botón Borrar en Modo Dev */}
                                            {devMode && (
                                                <button
                                                    onClick={() => removeField(field.id)}
                                                    className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full shadow-lg border border-red-600 text-xs font-black transition-transform scale-0 group-hover:scale-100 hover:bg-red-400 flex items-center justify-center z-10"
                                                    title="Eliminar Bloque"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* MODO DEV - INYECTOR DE BLOQUES */}
                            {devMode && (
                                <div className="bg-indigo-950/20 p-8 rounded-3xl border border-indigo-500/20 mt-10 relative shadow-2xl overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>

                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
                                            <Terminal className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white leading-tight">Vyte Injector</h2>
                                            <p className="text-xs text-indigo-400 font-bold tracking-widest uppercase mt-0.5">Creación de Esquema CMS</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-[#050505] p-6 rounded-2xl border border-indigo-500/10 shadow-inner">
                                        <div className="md:col-span-1">
                                            <label className="block text-[10px] font-black tracking-widest uppercase text-gray-500 mb-2">Tipo de Input</label>
                                            <select
                                                value={newField.type}
                                                onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldType })}
                                                className="w-full p-3.5 bg-[#111] border border-[#222] rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold text-gray-300 cursor-pointer appearance-none"
                                            >
                                                <option value="text">Texto Corto (Títulos)</option>
                                                <option value="textarea">Texto Largo (Párrafos)</option>
                                                <option value="image">Imagen (Fotos, Logos)</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="block text-[10px] font-black tracking-widest uppercase text-gray-500 mb-2">ID en Código</label>
                                            <input
                                                type="text" placeholder="ej: titulo_hero"
                                                value={newField.id} onChange={(e) => setNewField({ ...newField, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                                className="w-full p-3.5 bg-[#111] border border-[#222] rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold text-indigo-400 placeholder-gray-700"
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="block text-[10px] font-black tracking-widest uppercase text-gray-500 mb-2">Nombre Visual</label>
                                            <input
                                                type="text" placeholder="Título Portada principal"
                                                value={newField.label} onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                                className="w-full p-3.5 bg-[#111] border border-[#222] rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold text-white placeholder-gray-700"
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <button
                                                onClick={addNewField}
                                                className="w-full p-3.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 border border-indigo-500"
                                            >
                                                <Plus className="w-5 h-5" /> Inyectar Bloque
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
