'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Shipment } from '@/lib/api';
import Link from 'next/link';

interface ShipmentRowProps {
  shipment: Shipment;
  onRefresh: () => void;
}

export function ShipmentRow({ shipment, onRefresh }: ShipmentRowProps) {
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
      year: 'numeric'
    });
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{shipment.id}</TableCell>
      <TableCell>{shipment.orderId}</TableCell>
      <TableCell>
        {getStatusBadge(shipment.status)}
      </TableCell>
      <TableCell className="hidden md:table-cell">{shipment.carrier || '-'}</TableCell>
      <TableCell className="hidden md:table-cell">
        {shipment.trackingNumber ? (
          shipment.trackingUrl ? (
            <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
              {shipment.trackingNumber}
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span>{shipment.trackingNumber}</span>
          )
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {formatDate(shipment.createdAt)}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Menú de acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/shipments/${shipment.id}`}>Ver Detalle</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

