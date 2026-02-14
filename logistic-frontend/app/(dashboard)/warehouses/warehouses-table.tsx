'use client';

import { type Warehouse } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface WarehousesTableProps {
  warehouses: Warehouse[];
  onRefresh: () => void;
}

export function WarehousesTable({ warehouses, onRefresh }: WarehousesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Creado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No hay almacenes registrados
              </TableCell>
            </TableRow>
          ) : (
            warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell>{warehouse.id}</TableCell>
                <TableCell className="font-medium">{warehouse.code}</TableCell>
                <TableCell>{warehouse.name}</TableCell>
                <TableCell>
                  {new Date(warehouse.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

