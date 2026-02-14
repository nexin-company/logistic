import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package,
  Link2,
  Warehouse,
  Users,
  Truck
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { catalogApi, mappingsApi, stockApi, shipmentsApi, usersApi } from '@/lib/api-server';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let counts = {
    externalProducts: 0,
    externalProductsActive: 0,
    mappings: 0,
    stockLevels: 0,
    shipments: 0,
    users: 0,
  };

  try {
    const [externalProductsResult, mappings, stockLevels, shipments, users] = await Promise.all([
      catalogApi.getAll().catch(() => ({ externalProducts: [], total: 0, offset: null })),
      mappingsApi.getAll().catch(() => []),
      stockApi.getAll().catch(() => []),
      shipmentsApi.getAll().catch(() => []),
      usersApi.getAll().catch(() => []),
    ]);

    const externalProducts = externalProductsResult.externalProducts || [];
    
    counts = {
      externalProducts: externalProductsResult.total || 0,
      externalProductsActive: externalProducts.filter((p: any) => p.status === 'active').length,
      mappings: Array.isArray(mappings) ? mappings.length : 0,
      stockLevels: Array.isArray(stockLevels) ? stockLevels.length : 0,
      shipments: Array.isArray(shipments) ? shipments.length : 0,
      users: Array.isArray(users) ? users.length : 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }

  const stats = [
    {
      title: 'Catálogo',
      value: counts.externalProducts,
      icon: Package,
      href: '/catalog',
      description: `${counts.externalProductsActive} activos`,
      color: 'text-blue-600'
    },
    {
      title: 'Stock',
      value: counts.stockLevels,
      icon: Warehouse,
      href: '/stock',
      description: 'Niveles de stock',
      color: 'text-purple-600'
    },
    {
      title: 'Mapeos',
      value: counts.mappings,
      icon: Link2,
      href: '/mappings',
      description: 'Mapeos interno-externo',
      color: 'text-green-600'
    },
    {
      title: 'Embarques',
      value: counts.shipments,
      icon: Truck,
      href: '/shipments',
      description: 'Shipments activos',
      color: 'text-indigo-600'
    },
    {
      title: 'Usuarios',
      value: counts.users,
      icon: Users,
      href: '/users',
      description: 'Usuarios del sistema',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accesos directos a las funcionalidades principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/catalog">
                <Package className="h-4 w-4 mr-2" />
                Gestionar Catálogo
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/stock">
                <Warehouse className="h-4 w-4 mr-2" />
                Ver Stock
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/mappings">
                <Link2 className="h-4 w-4 mr-2" />
                Gestionar Mapeos
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/shipments">
                <Truck className="h-4 w-4 mr-2" />
                Gestionar Embarques
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/users">
                <Users className="h-4 w-4 mr-2" />
                Gestionar Usuarios
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Resumen General</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

