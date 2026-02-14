'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  User, 
  Shield, 
  Key, 
  Database, 
  Bell, 
  Palette,
  Globe,
  Lock,
  BellRing
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });

  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">

      <div className="grid gap-6 md:grid-cols-2">
        {/* Perfil */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Perfil</CardTitle>
            </div>
            <CardDescription>
              Gestiona tu información personal y preferencias de cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Nombre</Label>
                <p className="text-sm text-muted-foreground">Tu nombre completo</p>
              </div>
              <Button variant="outline" size="sm">Editar</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">Dirección de correo electrónico</p>
              </div>
              <Button variant="outline" size="sm">Editar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              <CardTitle>Notificaciones</CardTitle>
            </div>
            <CardDescription>
              Configura cómo y cuándo recibes notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificaciones por email</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones importantes por correo
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Notificaciones push</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones en tiempo real
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.push}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, push: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">Notificaciones SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe alertas críticas por SMS
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={notifications.sms}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, sms: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Apariencia */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Apariencia</CardTitle>
            </div>
            <CardDescription>
              Personaliza la apariencia de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                >
                  Claro
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  Oscuro
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                >
                  Sistema
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Seguridad</CardTitle>
            </div>
            <CardDescription>
              Gestiona la seguridad de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Cambiar contraseña</Label>
                <p className="text-sm text-muted-foreground">
                  Actualiza tu contraseña regularmente
                </p>
              </div>
              <Button variant="outline" size="sm">Cambiar</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Autenticación de dos factores</Label>
                <p className="text-sm text-muted-foreground">
                  Añade una capa extra de seguridad
                </p>
              </div>
              <Button variant="outline" size="sm">Configurar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Información del Sistema</CardTitle>
            </div>
            <CardDescription>
              Detalles sobre la configuración del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Versión</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">API Backend</span>
                <Badge variant="outline">Conectado</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Base de datos</span>
                <Badge variant="outline">Neon PostgreSQL</Badge>
              </div>
            </div>
            <Separator />
            <Button variant="outline" className="w-full" asChild>
              <a href="/docs" target="_blank">Ver documentación</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

