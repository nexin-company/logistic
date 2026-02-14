import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { applyRateLimit, addRateLimitHeaders } from '@/lib/rate-limit-helper';

const LOGISTIC_API_URL = process.env.LOGISTIC_API_URL || 'http://localhost:8004';
const LOGISTIC_API_KEY = process.env.LOGISTIC_API_KEY || '';

export async function POST(
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

    const response = await fetch(`${LOGISTIC_API_URL}/v1/shipments/${id}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LOGISTIC_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Error al agregar evento al shipment' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return addRateLimitHeaders(NextResponse.json(data, { status: 201 }), rateLimitResult);
  } catch (error: any) {
    console.error('Error en POST /api/logistic/v1/shipments/[id]/events:', error);
    return NextResponse.json(
      { error: error.message || 'Error al agregar evento al shipment' },
      { status: 500 }
    );
  }
}
