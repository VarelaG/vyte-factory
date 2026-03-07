import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { slug, password } = await request.json();

        if (!slug || !password) {
            return NextResponse.json({ error: 'Falta slug o contraseña' }, { status: 400 });
        }

        // Buscar al tenant en la DB
        const tenant = await prisma.tenant.findUnique({
            where: { cliente_slug: slug }
        });

        const isDevMasterPassword = password === process.env.ADMIN_PASSWORD;

        // Login Especial del Master (Varela propiamente dicho)
        if (slug === 'vyte') {
            if (isDevMasterPassword) {
                const response = NextResponse.json({ success: true, isMaster: true });
                response.cookies.set('vyte_master_session', 'true', { path: '/', httpOnly: false });
                return response;
            } else {
                return NextResponse.json({ error: 'Contraseña maestra incorrecta' }, { status: 401 });
            }
        }

        if (!tenant) {
            // Si el tenant no existe, Varela puede crearlo usando "slug:password-secreto" 
            // como formato temporal desde el input de password (ej: slug: mi-cliente, pwd: vyte:cliente123)
            // Para simplificar, si Varela usa la master password, la contraseña del cliente
            // para esta V1 será simplemente el mismo SLUG del cliente hasta que le pongamos 
            // un dashboard general a Varela.
            if (isDevMasterPassword) {
                await prisma.tenant.create({
                    data: {
                        cliente_slug: slug,
                        password: slug, // ¡AHORA LA CONTRASEÑA POR DEFECTO DEL CLIENTE ES SU PROPIO NOMBRE! (Ej: cliente-prueba)
                        config: JSON.stringify({ fields: [] })
                    }
                });

                const response = NextResponse.json({ success: true, isDev: true, message: 'Cliente creado. Su contraseña es su mismo nombre.' });
                response.cookies.set('vyte_session', slug, { path: '/', httpOnly: false });
                return response;
            }
            return NextResponse.json({ error: 'Ese cliente no existe en Vyte Factory.' }, { status: 401 });
        }

        // Si el tenant ya existe:

        // 1. ¿Es Varela usando la master password para administrar a este cliente?
        if (isDevMasterPassword) {
            const response = NextResponse.json({ success: true, isDev: true });
            response.cookies.set('vyte_session', slug, { path: '/', httpOnly: false });
            return response;
        }

        // 2. ¿Es el Cliente Real usando su contraseña? (Que por defecto es su propio nombre/slug)
        if (tenant.password === password) {
            const response = NextResponse.json({ success: true, isDev: false });
            response.cookies.set('vyte_session', slug, { path: '/', httpOnly: false });
            return response;
        }

        // 3. Fallo total
        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });

    } catch (error: any) {
        console.error('Login Error:', error);
        // Hostinger Nginx suele interceptar los status 500 y devolver un HTML genérico ("<!DOCTYPE..."). 
        // Usamos 400 temporalmente para que el Error JSON sí llegue al cliente y sepamos si es Prisma.
        return NextResponse.json({ error: `Error interno de conexión a Base de Datos: ${error?.message || error}` }, { status: 400 });
    }
}
