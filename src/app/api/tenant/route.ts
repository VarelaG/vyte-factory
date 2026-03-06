import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/tenant?slug=...
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Falta parámetro slug' }, { status: 400 });
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { cliente_slug: slug },
            select: {
                id: true,
                cliente_slug: true,
                config: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
        }

        return NextResponse.json(tenant);
    } catch (error) {
        console.error('Error fetching tenant:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

// POST /api/tenant
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { cliente_slug, config, password } = body;

        const cookieSlug = request.cookies.get('vyte_session')?.value;

        if (!cliente_slug) {
            return NextResponse.json({ error: 'slug requerido' }, { status: 400 });
        }

        // Validar que exista sesión y que coincida con el tenant que se quiere modificar
        if (!cookieSlug || cookieSlug !== cliente_slug) {
            return NextResponse.json({ error: 'No autorizado / Sesión inválida' }, { status: 401 });
        }

        // Upsert: Si existe actualiza, si no, crea
        const tenantStringifiedConfig = typeof config === 'string' ? config : JSON.stringify(config || {});

        const tenant = await prisma.tenant.upsert({
            where: { cliente_slug },
            update: { config: tenantStringifiedConfig },
            create: { cliente_slug, config: tenantStringifiedConfig }
        });

        return NextResponse.json(tenant);
    } catch (error) {
        console.error('Error saving tenant:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
