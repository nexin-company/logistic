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
import { StockLevel as StockLevelType, type Warehouse, type ExternalProduct } from '@/lib/api';
import { TableCell } from '@/components/ui/table';
import { TableSkeleton } from '@/components/table-skeleton';

interface StockLevelsTableProps {
  stockLevels: StockLevelType[];
  warehouses: Warehouse[];
  externalProducts: ExternalProduct[];
  isLoading: boolean;
}

export function StockLevelsTable({
  stockLevels,
  warehouses,
  externalProducts,
  isLoading,
}: StockLevelsTableProps) {
  const getWarehouseName = (id: number) => {
    const warehouse = warehouses.find(w => w.id === id);
    return warehouse ? `${warehouse.code} - ${warehouse.name}` : `Almacén ${id}`;
  };

  const getExternalProductName = (id: number) => {
    const product = externalProducts.find(p => p.id === id);
    return product ? `${product.sku} - ${product.name}` : `Producto ${id}`;
  };

  if (isLoading) {
    return <TableSkeleton columns={5} rows={5} />;
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Almacén</TableHead>
              <TableHead>Producto Externo</TableHead>
              <TableHead className="hidden md:table-cell">En Mano</TableHead>
              <TableHead className="hidden md:table-cell">Reservado</TableHead>
              <TableHead className="hidden md:table-cell">Disponible</TableHead>
              <TableHead className="hidden md:table-cell">Actualizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockLevels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No se encontraron niveles de stock
                </TableCell>
              </TableRow>
            ) : (
              stockLevels.map((level) => (
                <TableRow key={level.id}>
                  <TableCell className="font-medium">
                    {getWarehouseName(level.warehouseId)}
                  </TableCell>
                  <TableCell>
                    {getExternalProductName(level.externalProductId)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {level.onHand}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {level.reserved}
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-semibold">
                    {level.onHand - level.reserved}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(level.updatedAt).toLocaleDateString('es-ES')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

