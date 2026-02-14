'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shipment, shipmentsApi } from '@/lib/api';
import { ShipmentStatusDialog } from '../shipment-status-dialog';
import { AddEventDialog } from '../add-event-dialog';
import { useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ShipmentDetailPageClientProps {
  shipment: Shipment;
}

export function ShipmentDetailPageClient({
  shipment: initialShipment,
}: ShipmentDetailPageClientProps) {
  const router = useRouter();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [currentShipment, setCurrentShipment] = useState(initialShipment);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 capitalize">Pendiente</Badge>;
      case 'packed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">Empacado</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 capitalize">Enviado</Badge>;
      case 'in_transit':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 capitalize">En Tránsito</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 capitalize">Entregado</Badge>;
      case 'exception':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 capitalize">Excepción</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 capitalize">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShipmentUpdate = async (updatedShipment: Shipment) => {
    setCurrentShipment(updatedShipment);
    router.refresh();
  };

  const events = currentShipment.events || [];
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.occurredAt).getTime();
    const dateB = new Date(b.occurredAt).getTime();
    return dateB - dateA; // Más recientes primero
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/shipments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Shipment #{currentShipment.id}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="font-medium">{currentShipment.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-medium">{currentShipment.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <div className="mt-1">{getStatusBadge(currentShipment.status)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Carrier</p>
                <p className="font-medium">{currentShipment.carrier || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tracking Number</p>
                <p className="font-medium">{currentShipment.trackingNumber || '-'}</p>
              </div>
              {currentShipment.trackingUrl && (
                <div>
                  <p className="text-sm text-muted-foreground">Tracking URL</p>
                  <a href={currentShipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    Ver tracking
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Creado</p>
                <p className="font-medium">{formatDate(currentShipment.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actualizado</p>
                <p className="font-medium">{formatDate(currentShipment.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
            <CardDescription>Gestiona el estado y eventos del shipment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => setShowStatusDialog(true)} className="w-full">
              Actualizar Estado
            </Button>
            <Button onClick={() => setShowEventDialog(true)} variant="outline" className="w-full">
              Agregar Evento
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline de Eventos</CardTitle>
          <CardDescription>Historial de eventos de tracking</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay eventos registrados</p>
          ) : (
            <div className="space-y-4">
              {sortedEvents.map((event) => (
                <div key={event.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium capitalize">{event.type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(event.occurredAt)}</p>
                    </div>
                    {event.location && (
                      <p className="text-sm text-muted-foreground mt-1">📍 {event.location}</p>
                    )}
                    {event.message && (
                      <p className="text-sm mt-1">{event.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ShipmentStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        shipment={currentShipment}
        onSuccess={handleShipmentUpdate}
      />

      <AddEventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        shipmentId={currentShipment.id}
        onSuccess={handleShipmentUpdate}
      />
    </div>
  );
}

