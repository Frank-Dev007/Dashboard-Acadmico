import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { FileSpreadsheet, AlertCircle, Download } from 'lucide-react';

export default function AdminBulkUpload() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Carga Masiva de Usuarios</h1>
        <p className="text-gray-600">Importa múltiples usuarios desde archivos CSV o Excel</p>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Instrucciones de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-blue-900">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 shrink-0">1.</span>
              <span>Descarga la plantilla CSV o Excel haciendo clic en el botón de descarga</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 shrink-0">2.</span>
              <span>Completa la información de los usuarios en las columnas: Nombre, Email, Rol, Programa</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 shrink-0">3.</span>
              <span>Guarda el archivo y súbelo usando el botón de carga</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 shrink-0">4.</span>
              <span>Revisa los resultados y corrige los errores si los hay</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Download Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Descargar Plantillas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileSpreadsheet className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-900">Plantilla Excel</p>
                  <p className="text-sm text-gray-600">Formato .xlsx</p>
                </div>
              </div>
              <Button variant="outline" className="text-green-600 border-green-300">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-900">Plantilla CSV</p>
                  <p className="text-sm text-gray-600">Formato .csv</p>
                </div>
              </div>
              <Button variant="outline" className="text-blue-600 border-blue-300">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Format Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Requisitos del Archivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="text-gray-900 mb-2">Columnas Requeridas:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <strong>Nombre:</strong> Nombre completo del usuario</li>
                <li>• <strong>Email:</strong> Correo electrónico válido</li>
                <li>• <strong>Rol:</strong> student, teacher, o admin</li>
                <li>• <strong>Programa:</strong> Programa académico</li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 mb-2">Validaciones:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Emails deben ser únicos</li>
                <li>• Formato de email válido</li>
                <li>• Todos los campos son obligatorios</li>
                <li>• Rol debe ser válido</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
