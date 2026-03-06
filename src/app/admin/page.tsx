'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
            // Redirigir a Login si no hay sesión
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

    // 2. Cerrar Sesión
    const handleLogout = () => {
        document.cookie = 'vyte_session=; Max-Age=0; path=/;';
        localStorage.removeItem('vyte_dev_mode');
        router.push('/admin/login');
    };

    // 3. Guardar Cambios (El password viaja vacío, ya está en la cookie para el servidor o ignoramos,
    // como en nuestra API la validación completa en el POST usa password, deberíamos 
    // actualizar nuestra API route `POST /api/tenant` para leer la cookie en vez del body si queremos seguridad total. 
    // Para esta V1, mantenemos la estructura sencilla).
    const handleSave = async () => {
        setSaving(true);
        try {
            // Pedimos la contraseña para confirmar (o en V2 enviamos el Cookie JWT validado).
            const res = await fetch('/api/tenant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cliente_slug: tenantSlug,
                    config,
                    // Mandamos el password falso ya que idealmente readCookie en el servidor lo aprueba (requiere update de /api/tenant)
                    // por ahora seteamos un skip o validamos después.
                    password: 'skip-if-cookie' // Nota: Habrá que fixear POST api/tenant para soportar sesiones.
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
        setConfig(prev => ({
            ...prev,
            fields: prev.fields.filter(f => f.id !== id)
        }));
    };

    if (!tenantSlug) return null; // Prevenir destello UI antes del redirect

    return (
        <div className="w-full max-w-[1800px] mx-auto p-4 sm:p-8 min-h-screen bg-black text-white font-sans">

            {/* HEADER PREMIUM */}
            <header className="bg-[#111] p-6 rounded-3xl shadow-lg shadow-indigo-500/5 border border-gray-800 flex justify-between items-center mb-10 group hover:border-gray-700 transition duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-white group-hover:bg-indigo-500 transition-colors"></div>
                <div className="pl-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Vyte Factory</h1>
                    <div className="flex items-center gap-2 mt-1 sm:mt-0 sm:border-l sm:border-gray-800 sm:pl-6">
                        <span className="text-sm font-medium text-gray-500 hidden sm:inline">Panel de Control:</span>
                        <span className="px-3 py-1 bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-lg border border-white/5">
                            {tenantSlug}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">

                    {isDevUser && (
                        <button
                            onClick={() => setDevMode(!devMode)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${devMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-sm' : 'bg-transparent text-gray-400 hover:bg-white/5 border-gray-700 hover:text-white'}`}
                        >
                            {devMode ? '👨‍💻 CERRAR MODO DEV' : '⚡ INYECTAR BLOQUES'}
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-white text-black rounded-xl hover:bg-gray-200 transition font-bold text-sm disabled:opacity-50 shadow-lg shadow-white/10 active:scale-95"
                    >
                        {saving ? 'Publicando...' : 'Guardar y Publicar'}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-500 hover:text-red-400 bg-transparent border border-gray-800 hover:bg-red-500/10 hover:border-red-500/20 rounded-xl transition"
                        title="Cerrar Sesión"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            </header>

            {/* ÁREA DE TRABAJO */}
            {loading ? (
                <div className="text-center py-20 flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 border-4 border-gray-800 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold tracking-widest text-sm uppercase">Cargando módulos...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">

                    {/* PANEL DEL CLIENTE (VISUALIZADOR DINÁMICO) */}
                    <div className="bg-[#111] p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-800 relative">
                        <h2 className="text-xl font-bold mb-8 text-white flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-sm">✏️</span>
                            Configuración de la Web
                        </h2>

                        {config.fields.length === 0 ? (
                            <div className="text-center py-16 px-6 rounded-2xl bg-[#0a0a0a] border border-dashed border-gray-800">
                                <p className="text-gray-400 font-medium mb-1">Tu diseño modular a medida todavía no tiene campos habilitados.</p>
                                <p className="text-sm text-gray-600">Si sos Vyte, activá el modo "Inyectar Bloques". Si sos un cliente, comunícate con soporte.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {config.fields.map(field => (
                                    <div key={field.id} className="relative flex flex-col group p-6 bg-[#0a0a0a] rounded-2xl border border-gray-800 shadow-sm hover:border-gray-600 transition-colors duration-300">

                                        {/* Etiqueta del campo */}
                                        <label className="block text-sm font-bold text-gray-300 mb-3">{field.label}</label>

                                        {field.type === 'text' && (
                                            <input
                                                type="text"
                                                value={field.value}
                                                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                                                className="w-full p-3.5 bg-[#111] border border-gray-800 rounded-xl focus:ring-2 focus:ring-white outline-none font-medium transition text-white placeholder-gray-600"
                                                placeholder={`Ingresa ${field.label.toLowerCase()}`}
                                            />
                                        )}

                                        {field.type === 'textarea' && (
                                            <textarea
                                                rows={4}
                                                value={field.value}
                                                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                                                className="w-full p-3.5 bg-[#111] border border-gray-800 rounded-xl focus:ring-2 focus:ring-white outline-none resize-y font-medium transition text-white placeholder-gray-600"
                                                placeholder={`Ingresa texto para ${field.label.toLowerCase()}`}
                                            />
                                        )}

                                        {field.type === 'image' && (
                                            <div className="flex flex-col gap-3">
                                                {field.value ? (
                                                    <div className="relative rounded-xl overflow-hidden border border-gray-800 aspect-video w-full bg-[#111] flex items-center justify-center">
                                                        <img src={field.value} alt={field.label} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-full aspect-video bg-[#111] rounded-xl flex items-center justify-center text-gray-600 text-sm font-medium border border-dashed border-gray-800">
                                                        Sin imagen seleccionada
                                                    </div>
                                                )}
                                                <label className="cursor-pointer bg-white px-5 py-3 border border-transparent text-black text-center rounded-xl hover:bg-gray-200 font-bold text-sm transition shadow-sm w-full block">
                                                    Subir / Reemplazar Foto
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], field.id)} />
                                                </label>
                                            </div>
                                        )}

                                        {/* Botón "Eyectar" en Modo Dev para borrar un campo del cliente */}
                                        {devMode && (
                                            <button
                                                onClick={() => removeField(field.id)}
                                                className="absolute -top-3 -right-3 bg-red-500/90 text-white w-8 h-8 rounded-full shadow-lg border border-red-500 text-xs font-black transition-transform scale-0 group-hover:scale-100 hover:bg-red-600 flex items-center justify-center"
                                                title="Eliminar Bloque"
                                            >×</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* MODO DEV (AGREGAR CAMPOS AL SCHEMA DEL CLIENTE) */}
                    {devMode && (
                        <div className="bg-[#111] p-8 rounded-3xl border border-indigo-500/20 mb-20 relative shadow-2xl shadow-indigo-500/5">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">Vy</div>
                                <div>
                                    <h2 className="text-lg font-black text-white leading-tight">Vyte Developer Injections</h2>
                                    <p className="text-xs text-indigo-400 font-bold tracking-widest uppercase">Admin Tools</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end bg-[#0a0a0a] p-6 rounded-2xl shadow-sm border border-gray-800">
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black tracking-widest uppercase text-gray-500 mb-2">Tipo de Input</label>
                                    <select
                                        value={newField.type}
                                        onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldType })}
                                        className="w-full p-3.5 bg-[#111] border border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-300 cursor-pointer"
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
                                        className="w-full p-3.5 bg-[#111] border border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-400 placeholder-gray-700"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black tracking-widest uppercase text-gray-500 mb-2">Nombre Visual</label>
                                    <input
                                        type="text" placeholder="Título Portada principal"
                                        value={newField.label} onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                        className="w-full p-3.5 bg-[#111] border border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-white placeholder-gray-700"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <button
                                        onClick={addNewField}
                                        className="w-full p-3.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 border border-indigo-500"
                                    >
                                        <span>+</span> Inyectar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
