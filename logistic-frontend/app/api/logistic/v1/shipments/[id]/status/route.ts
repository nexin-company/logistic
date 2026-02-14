import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { applyRateLimit, addRateLimitHeaders } from '@/lib/rate-limit-helper';

const LOGISTIC_API_URL = process.env.LOGISTIC_API_URL || 'http://localhost:8004';
const LOGISTIC_API_KEY = process.env.LOGISTIC_API_KEY || '';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { response: rateLimitResponse, rateLimitResult } = await applyRateLimit(request, 'mutation');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${LOGISTIC_API_URL}/v1/shipments/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LOGISTIC_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Error al actualizar status del shipment' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return addRateLimitHeaders(NextResponse.json(data), rateLimitResult);
  } catch (error: any) {
    console.error('Error en PUT /api/logistic/v1/shipments/[id]/status:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar status del shipment' },
      { status: 500 }
    );
  }
}
