import { shipmentsApi, type Shipment } from '@/lib/api-server';
import { ShipmentDetailPageClient } from './shipment-detail-page-client';

export const dynamic = 'force-dynamic';

export default async function ShipmentDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);

  let shipment: Shipment | null = null;

  try {
    shipment = await shipmentsApi.getById(id).catch(() => null);
  } catch (error) {
    console.error('Error fetching shipment:', error);
  }

  if (!shipment) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-muted-foreground">Shipment no encontrado</p>
      </div>
    );
  }

  return <ShipmentDetailPageClient shipment={shipment} />;
}

