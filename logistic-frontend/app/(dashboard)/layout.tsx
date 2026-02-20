import Link from 'next/link';
import {
  Home,
  Users,
  PanelLeft,
  Settings,
  Package,
  Link2,
  Warehouse,
  Truck,
  BarChart3
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import { User } from './users/user';
import Providers from './providers';
import { NavItem } from './nav-item';
import { PageTitle } from './page-title';
import { AppLauncher } from '@/components/app-launcher';
import { NotificationBell } from '@/components/notifications/notification-bell';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-background">
        <DesktopNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav />
            <PageTitle />
            <div className="flex-1" />
            <NotificationBell />
            <AppLauncher />
            <User />
          </header>
          <main className="grid flex-1 items-start gap-1 p-2 sm:px-6 sm:py-0 md:gap-2 bg-background">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
    </Providers>
  );
}

function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <NavItem href="/" label="Home">
          <Home className="h-5 w-5" />
        </NavItem>

        <NavItem href="/catalog" label="Catálogo">
          <Package className="h-5 w-5" />
        </NavItem>

        <NavItem href="/warehouses" label="Almacenes">
          <Warehouse className="h-5 w-5" />
        </NavItem>

        <NavItem href="/stock" label="Stock">
          <BarChart3 className="h-5 w-5" />
        </NavItem>

        <NavItem href="/mappings" label="Mapeos">
          <Link2 className="h-5 w-5" />
        </NavItem>

        <NavItem href="/shipments" label="Embarques">
          <Truck className="h-5 w-5" />
        </NavItem>

        <NavItem href="/users" label="Usuarios">
          <Users className="h-5 w-5" />
        </NavItem>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <NavItem href="/settings" label="Configuración">
          <Settings className="h-5 w-5" />
        </NavItem>
      </nav>
    </aside>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
          <Link
            href="/catalog"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Package className="h-5 w-5" />
            Catálogo
          </Link>
          <Link
            href="/warehouses"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Warehouse className="h-5 w-5" />
            Almacenes
          </Link>
          <Link
            href="/stock"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <BarChart3 className="h-5 w-5" />
            Stock
          </Link>
          <Link
            href="/mappings"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Link2 className="h-5 w-5" />
            Mapeos
          </Link>
          <Link
            href="/shipments"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Truck className="h-5 w-5" />
            Embarques
          </Link>
          <Link
            href="/users"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Users className="h-5 w-5" />
            Usuarios
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
            Configuración
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

