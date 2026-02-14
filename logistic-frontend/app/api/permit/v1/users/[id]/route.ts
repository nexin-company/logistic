import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { usersApi } from '@/lib/api-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const user = await usersApi.getById(Number(id));
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error en GET /api/permit/v1/users/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener usuario' },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const user = await usersApi.update(Number(id), body);
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error en PUT /api/permit/v1/users/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar usuario' },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const result = await usersApi.delete(Number(id));
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en DELETE /api/permit/v1/users/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar usuario' },
      { status: error.status || 500 }
    );
  }
}

