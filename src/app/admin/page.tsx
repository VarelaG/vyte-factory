'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Settings, LogOut, Check, Image as ImageIcon, Type, AlignLeft, Trash2, Plus, Terminal, RefreshCw, Upload } from 'lucide-react';

type FieldType = 'text' | 'textarea' | 'image' | 'repeater';

interface RepeaterItem {
    id: string;
    values: { [key: string]: string };
}

interface DynamicField {
    id: string;
    label: string;
    type: FieldType;
    value?: string;
    items?: RepeaterItem[]; // Para tipos 'repeater'
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
            const response = await fetch(`/api/tenant?slug=${slug}`, { cache: 'no-store' });
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

    // --- LOGICA DE REPETIDORES ---
    const addRepeaterItem = (fieldId: string) => {
        setConfig(prev => ({
            ...prev,
            fields: prev.fields.map(f => {
                if (f.id !== fieldId) return f;
                const newItem: RepeaterItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    values: { title: '', description: '', image: '' }
                };
                return { ...f, items: [...(f.items || []), newItem] };
            })
        }));
    };

    const removeRepeaterItem = (fieldId: string, itemId: string) => {
        setConfig(prev => ({
            ...prev,
            fields: prev.fields.map(f => {
                if (f.id !== fieldId) return f;
                return { ...f, items: f.items?.filter(item => item.id !== itemId) };
            })
        }));
    };

    const updateRepeaterValue = (fieldId: string, itemId: string, subKey: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            fields: prev.fields.map(f => {
                if (f.id !== fieldId) return f;
                return {
                    ...f,
                    items: f.items?.map(item =>
                        item.id === itemId
                            ? { ...item, values: { ...item.values, [subKey]: value } }
                            : item
                    )
                };
            })
        }));
    };

    const uploadRepeaterImage = async (file: File, fieldId: string, itemId: string) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('slug', tenantSlug);

            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error("Error al subir");
            const { url } = await res.json();
            updateRepeaterValue(fieldId, itemId, 'image', url);
        } catch (err: any) {
            alert(err.message);
        }
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

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.details || errorData.error || 'Error desconocido');
            }
            const { url } = await res.json();
            updateFieldValue(fieldId, url);
        } catch (err: any) {
            alert("Error al subir foto: " + err.message);
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

        const fieldToAdd = { ...newField } as DynamicField;
        if (fieldToAdd.type === 'repeater') {
            fieldToAdd.items = [];
            delete fieldToAdd.value;
        }

        setConfig(prev => ({
            ...prev,
            fields: [...prev.fields, fieldToAdd]
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
        <div className="flex flex-col md:flex-row h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden">

            {/* HEADER MÓVIL (Solo visible en celulares) */}
            <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#0a0a0a] border-b border-white/5 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-black text-sm">
                        {tenantSlug.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest truncate max-w-[100px]">{tenantSlug}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isDevUser && (
                        <button
                            onClick={() => setDevMode(!devMode)}
                            className={`p-2 rounded-lg transition-all ${devMode ? 'bg-white text-black' : 'bg-white/5 text-zinc-500'}`}
                            title={devMode ? 'Modo Dev On' : 'Modo Dev Off'}
                        >
                            <Terminal className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-full bg-white/5 text-zinc-500 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* SIDEBAR (Escritorio) */}
            <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col hidden md:flex">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            {tenantSlug.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <h1 className="text-lg font-black tracking-tight text-white leading-none truncate uppercase">{tenantSlug}</h1>
                            <span className="text-[9px] font-black text-zinc-600 tracking-[0.2em] uppercase">Espacio Cliente</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-8 flex-1">
                    <nav className="space-y-1">
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-bold border border-white/10 text-xs uppercase tracking-widest">
                            <LayoutDashboard className="w-4 h-4" />
                            Gestión Web
                        </a>
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white font-bold transition-colors text-xs uppercase tracking-widest">
                            <Settings className="w-4 h-4" />
                            Ajustes
                        </a>
                    </nav>

                    {isDevUser && (
                        <div className="mt-10 border-t border-white/5 pt-8">
                            <p className="px-4 text-[9px] font-black tracking-[0.3em] uppercase text-zinc-600 mb-4">Vyte Dev Tools</p>
                            <button
                                onClick={() => setDevMode(!devMode)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-widest ${devMode ? 'bg-white text-black border border-white' : 'hover:bg-white/5 text-zinc-500 hover:text-white border border-transparent'}`}
                            >
                                <Terminal className="w-4 h-4" />
                                {devMode ? 'Modo Dev On' : 'Modo Dev Off'}
                            </button>
                        </div>
                    )}
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
            <main className="flex-1 overflow-y-auto overflow-x-hidden w-full relative h-[calc(100vh-64px)] md:h-screen">
                {/* Decoración Minimalista */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/2 max-w-full"></div>

                <div className="max-w-6xl mx-auto p-6 md:p-12 lg:p-16 relative z-10">

                    {/* TOP HEADER */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Live Editor</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
                                Modelador <span className="text-zinc-600">Visual</span>
                            </h2>
                        </div>
                        <div className="flex gap-4 w-full h-full lg:w-auto">
                            {isDevUser && (
                                <button
                                    onClick={() => loadTenantData(tenantSlug)}
                                    className="p-4 bg-zinc-900 border border-white/5 text-zinc-400 rounded-2xl hover:text-white transition-all active:scale-95"
                                    title="Sincronizar"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saving || loading}
                                className="flex-1 lg:flex-none px-10 py-4 bg-white text-black rounded-2xl hover:scale-105 transition-all font-black uppercase tracking-widest text-[11px] shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        Publicando
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
                        <div className="text-center py-32 flex flex-col items-center gap-6">
                            <div className="w-12 h-12 border-4 border-zinc-800 border-t-white rounded-full animate-spin"></div>
                            <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-[0.4em]">Sincronizando Módulos...</p>
                        </div>
                    ) : (
                        <div className="space-y-12">

                            {/* EDITOR DE CAMPOS */}
                            {config.fields.length === 0 ? (
                                <div className="text-center py-24 px-10 rounded-[3rem] bg-white/[0.01] border border-dashed border-white/10">
                                    <LayoutDashboard className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                                    <p className="text-zinc-400 font-bold mb-2 uppercase tracking-widest">Sin campos habilitados</p>
                                    <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.2em]">Activa el modo dev para configurar este espacio.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {config.fields.map(field => (
                                        <div key={field.id} className="relative flex flex-col group p-8 bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all duration-500 shadow-sm overflow-hidden">

                                            {/* Fondo abstracto por tarjeta */}
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/[0.05] transition-colors"></div>

                                            {/* Etiqueta */}
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 rounded-xl bg-white/5 text-zinc-500">
                                                        {field.type === 'text' && <Type className="w-4 h-4" />}
                                                        {field.type === 'textarea' && <AlignLeft className="w-4 h-4" />}
                                                        {field.type === 'image' && <ImageIcon className="w-4 h-4" />}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{field.label}</span>
                                                </div>

                                                {devMode && (
                                                    <button
                                                        onClick={() => removeField(field.id)}
                                                        className="p-2 rounded-lg text-zinc-800 hover:text-red-500 transition-colors"
                                                        title="Eliminar Bloque"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="relative">
                                                {field.type === 'text' && (
                                                    <input
                                                        type="text"
                                                        value={field.value}
                                                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                                                        className="w-full px-6 py-5 bg-[#050505] border border-white/5 rounded-2xl outline-none focus:border-white/30 font-bold transition-all text-white placeholder-zinc-800 text-sm tracking-wide"
                                                        placeholder={`Ingresa ${field.label.toLowerCase()}...`}
                                                    />
                                                )}

                                                {field.type === 'textarea' && (
                                                    <textarea
                                                        rows={5}
                                                        value={field.value}
                                                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                                                        className="w-full px-6 py-5 bg-[#050505] border border-white/5 rounded-2xl outline-none focus:border-white/30 font-bold transition-all text-white placeholder-zinc-800 resize-none text-sm leading-relaxed"
                                                        placeholder={`Ingresa contenido...`}
                                                    />
                                                )}

                                                {field.type === 'image' && (
                                                    <div className="flex flex-col gap-4">
                                                        {field.value ? (
                                                            <div className="relative rounded-[2rem] overflow-hidden border border-white/5 aspect-square md:aspect-video w-full bg-[#050505] flex items-center justify-center group/img">
                                                                <img src={field.value} alt={field.label} className="w-full h-full object-cover transition-all group-hover/img:scale-110 duration-700" />
                                                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center backdrop-blur-md">
                                                                    <div className="flex flex-col items-center gap-3">
                                                                        <Upload className="w-6 h-6 text-white" />
                                                                        <span className="text-[10px] text-white font-black uppercase tracking-widest">Cambiar Imagen</span>
                                                                    </div>
                                                                </div>
                                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], field.id)} />
                                                            </div>
                                                        ) : (
                                                            <div className="relative w-full aspect-video bg-[#050505] hover:bg-zinc-900 transition-all rounded-[2rem] flex flex-col items-center justify-center text-zinc-700 text-[10px] font-black uppercase tracking-widest border border-dashed border-white/10 group/upload">
                                                                <Upload className="w-8 h-8 mb-4 text-zinc-800 group-hover/upload:text-white transition-colors" />
                                                                Subir Archivo
                                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], field.id)} />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {field.type === 'repeater' && (
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                                                Lista de {field.label} ({field.items?.length || 0})
                                                            </span>
                                                        </div>

                                                        {field.items?.map((item, idx) => (
                                                            <div key={item.id} className="p-6 bg-[#050505] border border-white/5 rounded-3xl relative group/item">
                                                                <button
                                                                    onClick={() => removeRepeaterItem(field.id, item.id)}
                                                                    className="absolute -top-2 -right-2 w-8 h-8 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-zinc-600 hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover/item:opacity-100 z-20"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>

                                                                <div className="space-y-4">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Título..."
                                                                        value={item.values.title}
                                                                        onChange={(e) => updateRepeaterValue(field.id, item.id, 'title', e.target.value)}
                                                                        className="w-full bg-transparent border-b border-white/5 py-2 outline-none focus:border-white/20 text-sm font-bold placeholder-zinc-800"
                                                                    />
                                                                    <textarea
                                                                        placeholder="Descripción..."
                                                                        rows={2}
                                                                        value={item.values.description}
                                                                        onChange={(e) => updateRepeaterValue(field.id, item.id, 'description', e.target.value)}
                                                                        className="w-full bg-transparent py-2 outline-none text-xs text-zinc-400 placeholder-zinc-800 resize-none"
                                                                    />
                                                                    <div className="relative h-32 rounded-2xl overflow-hidden border border-white/5 bg-zinc-950 flex flex-col items-center justify-center group/subimg">
                                                                        {item.values.image ? (
                                                                            <img src={item.values.image} className="w-full h-full object-cover transition-all" />
                                                                        ) : (
                                                                            <ImageIcon className="w-6 h-6 text-zinc-800" />
                                                                        )}
                                                                        <input
                                                                            type="file"
                                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                                            onChange={(e) => e.target.files?.[0] && uploadRepeaterImage(e.target.files[0], field.id, item.id)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        <button
                                                            onClick={() => addRepeaterItem(field.id)}
                                                            className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Plus className="w-4 h-4" /> Agregar Item
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ID Badge (Modo Dev) */}
                                            {devMode && (
                                                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">{field.id}</span>
                                                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">{field.type}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* MODO DEV - INYECTOR DE BLOQUES */}
                            {devMode && (
                                <div className="bg-white/[0.02] p-10 md:p-16 rounded-[4rem] border border-white/10 relative shadow-2xl overflow-hidden mt-20">
                                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[100px] pointer-events-none"></div>

                                    <div className="flex items-center gap-4 mb-12">
                                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-black font-black shadow-2xl">
                                            <Terminal className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Vyte <span className="text-zinc-600 font-thin not-italic">Injector</span></h2>
                                            <p className="text-[9px] text-zinc-500 font-black tracking-[0.4em] uppercase mt-1">Estructura del Satélite</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                                        <div>
                                            <label className="block text-[9px] font-black tracking-[0.3em] uppercase text-zinc-500 mb-3 ml-2">Tipo de Entrada</label>
                                            <select
                                                value={newField.type}
                                                onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldType })}
                                                className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl outline-none focus:border-white transition-all font-bold text-zinc-300 cursor-pointer appearance-none text-xs uppercase"
                                            >
                                                <option value="text">Texto Corto</option>
                                                <option value="textarea">Texto Largo</option>
                                                <option value="image">Imagen</option>
                                                <option value="repeater">Repetidor (Cards)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black tracking-[0.3em] uppercase text-zinc-500 mb-3 ml-2">Identificador (ID)</label>
                                            <input
                                                type="text" placeholder="ej: titulo_seo"
                                                value={newField.id} onChange={(e) => setNewField({ ...newField, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                                className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl outline-none focus:border-white transition-all font-bold text-white placeholder-zinc-800 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black tracking-[0.3em] uppercase text-zinc-500 mb-3 ml-2">Etiqueta Visual</label>
                                            <input
                                                type="text" placeholder="ej: Título Portada"
                                                value={newField.label} onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                                className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl outline-none focus:border-white transition-all font-bold text-white placeholder-zinc-800 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <button
                                                onClick={addNewField}
                                                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all text-[11px] uppercase tracking-widest shadow-xl active:scale-95 border border-white"
                                            >
                                                <Plus className="w-5 h-5 mx-auto" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* Footer del Main */}
                <footer className="px-12 py-12 text-center text-zinc-800 text-[8px] font-black tracking-[0.5em] uppercase border-t border-white/[0.02]">
                    Vyte Factory — Beyond Digital Limits
                </footer>
            </main>
        </div>
    );
}
