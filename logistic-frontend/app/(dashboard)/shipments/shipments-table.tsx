'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Shipment } from '@/lib/api';
import { ShipmentRow } from './shipment-row';
import { TableCell } from '@/components/ui/table';

interface ShipmentsTableProps {
  shipments: Shipment[];
  onRefresh: () => void;
}

export function ShipmentsTable({
  shipments,
  onRefresh,
}: ShipmentsTableProps) {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Carrier</TableHead>
              <TableHead className="hidden md:table-cell">Tracking</TableHead>
              <TableHead className="hidden md:table-cell">Creado</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No se encontraron shipments
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((shipment) => (
                <ShipmentRow
                  key={shipment.id}
                  shipment={shipment}
                  onRefresh={onRefresh}
                />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

