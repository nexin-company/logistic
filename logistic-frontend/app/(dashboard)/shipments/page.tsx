import { shipmentsApi, type Shipment } from '@/lib/api-server';
import { ShipmentsPageClient } from './shipments-page-client';

export const dynamic = 'force-dynamic';

export default async function ShipmentsPage(props: {
  searchParams?: Promise<{ orderId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const orderId = searchParams?.orderId ? Number(searchParams.orderId) : undefined;

  let shipments: Shipment[] = [];
  
  try {
    shipments = await shipmentsApi.getAll({
      orderId,
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
  }

  return (
    <ShipmentsPageClient
      initialShipments={shipments}
      initialOrderId={orderId}
    />
  );
}

