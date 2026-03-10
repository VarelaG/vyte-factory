import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { slug, password } = await request.json();

        if (!slug || !password) {
            return NextResponse.json({ error: 'Falta slug o contraseña' }, { status: 400 });
        }

        const isDevMasterPassword = password === process.env.ADMIN_PASSWORD;

        // 1. Caso Especial: Master Dashboard (Varela)
        if (slug === 'vyte') {
            if (isDevMasterPassword) {
                const response = NextResponse.json({ success: true, isMaster: true });
                response.cookies.set('vyte_master_session', 'true', { path: '/', httpOnly: false });
                return response;
            } else {
                return NextResponse.json({ error: 'Contraseña maestra incorrecta' }, { status: 401 });
            }
        }

        // 2. Buscar al tenant en la DB
        const tenant = await prisma.tenant.findUnique({
            where: { cliente_slug: slug }
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Ese cliente no existe en Vyte Factory.' }, { status: 401 });
        }

        // 3. Validar Acceso (Master Bypass o Password del Cliente)
        const isClientPasswordCorrect = tenant.password === password;

        if (isDevMasterPassword || isClientPasswordCorrect) {
            const response = NextResponse.json({
                success: true,
                isDev: isDevMasterPassword,
                isMaster: false
            });
            response.cookies.set('vyte_session', slug, { path: '/', httpOnly: false });
            return response;
        }

        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });

    } catch (error: any) {
        console.error('Login Error:', error);
        // Hostinger Nginx suele interceptar los status 500 y devolver un HTML genérico ("<!DOCTYPE..."). 
        // Usamos 400 temporalmente para que el Error JSON sí llegue al cliente y sepamos si es Prisma.
        return NextResponse.json({ error: `Error interno de conexión a Base de Datos: ${error?.message || error}` }, { status: 400 });
    }
}
