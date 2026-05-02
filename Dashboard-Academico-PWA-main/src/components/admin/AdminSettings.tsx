import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Settings, Bell, Shield, Database, Mail } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function AdminSettings() {
  const [riskThresholdLow, setRiskThresholdLow] = useState([3.5]);
  const [riskThresholdHigh, setRiskThresholdHigh] = useState([3.0]);
  const [attendanceThreshold, setAttendanceThreshold] = useState([75]);
  const [participationThreshold, setParticipationThreshold] = useState([60]);
  const [updateFrequency, setUpdateFrequency] = useState('daily');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  const handleSave = () => {
    toast.success('Configuración guardada exitosamente');
  };

  const handleReset = () => {
    setRiskThresholdLow([3.5]);
    setRiskThresholdHigh([3.0]);
    setAttendanceThreshold([75]);
    setParticipationThreshold([60]);
    setUpdateFrequency('daily');
    setEmailNotifications(true);
    setAlertsEnabled(true);
    setAutoBackup(true);
    toast.info('Configuración restablecida a valores predeterminados');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Configuración del Sistema</h1>
        <p className="text-gray-600">Ajusta los parámetros y umbrales del sistema de seguimiento</p>
      </div>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Umbrales de Alerta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Umbral de Riesgo Medio</Label>
                <p className="text-sm text-gray-600">Promedio mínimo antes de generar alerta media</p>
              </div>
              <span className="text-lg text-yellow-600">{riskThresholdLow[0].toFixed(1)}</span>
            </div>
            <Slider
              value={riskThresholdLow}
              onValueChange={setRiskThresholdLow}
              min={2.0}
              max={4.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>2.0</span>
              <span>3.0</span>
              <span>4.0</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Umbral de Riesgo Alto</Label>
                <p className="text-sm text-gray-600">Promedio mínimo antes de generar alerta crítica</p>
              </div>
              <span className="text-lg text-red-600">{riskThresholdHigh[0].toFixed(1)}</span>
            </div>
            <Slider
              value={riskThresholdHigh}
              onValueChange={setRiskThresholdHigh}
              min={1.5}
              max={3.5}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1.5</span>
              <span>2.5</span>
              <span>3.5</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Umbral de Asistencia</Label>
                <p className="text-sm text-gray-600">Porcentaje mínimo de asistencia requerido</p>
              </div>
              <span className="text-lg text-indigo-600">{attendanceThreshold[0]}%</span>
            </div>
            <Slider
              value={attendanceThreshold}
              onValueChange={setAttendanceThreshold}
              min={50}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Umbral de Participación</Label>
                <p className="text-sm text-gray-600">Porcentaje mínimo de participación esperado</p>
              </div>
              <span className="text-lg text-green-600">{participationThreshold[0]}%</span>
            </div>
            <Slider
              value={participationThreshold}
              onValueChange={setParticipationThreshold}
              min={30}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>30%</span>
              <span>65%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            Parámetros del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="update-frequency">Frecuencia de Actualización de Datos</Label>
            <Select value={updateFrequency} onValueChange={setUpdateFrequency}>
              <SelectTrigger id="update-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Tiempo Real</SelectItem>
                <SelectItem value="hourly">Cada Hora</SelectItem>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              {updateFrequency === 'realtime' && 'Los datos se actualizan instantáneamente'}
              {updateFrequency === 'hourly' && 'Los datos se actualizan cada hora'}
              {updateFrequency === 'daily' && 'Los datos se actualizan una vez al día'}
              {updateFrequency === 'weekly' && 'Los datos se actualizan semanalmente'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retention">Período de Retención de Datos</Label>
            <Select defaultValue="1year">
              <SelectTrigger id="retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">3 Meses</SelectItem>
                <SelectItem value="6months">6 Meses</SelectItem>
                <SelectItem value="1year">1 Año</SelectItem>
                <SelectItem value="2years">2 Años</SelectItem>
                <SelectItem value="indefinite">Indefinido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-students">Máximo de Estudiantes por Curso</Label>
            <Input id="max-students" type="number" defaultValue="50" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Notificaciones por Email</Label>
              <p className="text-sm text-gray-600">Enviar alertas y actualizaciones por correo electrónico</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Alertas Automáticas</Label>
              <p className="text-sm text-gray-600">Generar alertas automáticas basadas en umbrales</p>
            </div>
            <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-frequency">Frecuencia de Reportes por Email</Label>
            <Select defaultValue="weekly">
              <SelectTrigger id="email-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="never">Nunca</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security & Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Seguridad y Respaldo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Respaldo Automático</Label>
              <p className="text-sm text-gray-600">Realizar copias de seguridad automáticas de la base de datos</p>
            </div>
            <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backup-frequency">Frecuencia de Respaldo</Label>
            <Select defaultValue="daily">
              <SelectTrigger id="backup-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Cada Hora</SelectItem>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-timeout">Tiempo de Sesión (minutos)</Label>
            <Input id="session-timeout" type="number" defaultValue="60" />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
          Guardar Configuración
        </Button>
        <Button onClick={handleReset} variant="outline">
          Restablecer Valores Predeterminados
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <p className="text-sm text-gray-700">
            <strong>Nota:</strong> Los cambios en los umbrales de alerta afectarán la clasificación de riesgo de los estudiantes. 
            Se recomienda realizar ajustes graduales y monitorear los resultados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
