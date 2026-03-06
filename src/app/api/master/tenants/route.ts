import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// API para Vyte Master Dashboard
export async function GET(request: NextRequest) {
    try {
        // En V1, confiamos que el Master llego aca, o podemos leer la cookie vyte_master_session si existiera
        const cookie = request.cookies.get('vyte_master_session');
        if (!cookie || cookie.value !== 'true') {
            return NextResponse.json({ error: 'Acceso Denegado' }, { status: 401 });
        }

        const tenants = await prisma.tenant.findMany({
            select: {
                id: true,
                cliente_slug: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ success: true, tenants });
    } catch (error) {
        console.error('Master Fetch Error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookie = request.cookies.get('vyte_master_session');
        if (!cookie || cookie.value !== 'true') {
            return NextResponse.json({ error: 'Acceso Denegado' }, { status: 401 });
        }

        const { slug, password } = await request.json();

        if (!slug || !password) {
            return NextResponse.json({ error: 'Slug y Password son requeridos' }, { status: 400 });
        }

        // Check if exists
        const exists = await prisma.tenant.findUnique({
            where: { cliente_slug: slug.toLowerCase() }
        });

        if (exists) {
            return NextResponse.json({ error: 'El cliente ya existe.' }, { status: 400 });
        }

        const tenant = await prisma.tenant.create({
            data: {
                cliente_slug: slug.toLowerCase(),
                password: password,
                config: JSON.stringify({ fields: [] })
            }
        });

        return NextResponse.json({ success: true, tenant });
    } catch (error) {
        console.error('Master Create Error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
