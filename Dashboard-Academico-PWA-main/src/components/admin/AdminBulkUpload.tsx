import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';

export default function AdminBulkUpload() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    setProgress(0);

    // Simulate upload
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setUploadStatus('processing');
          processFile();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const processFile = () => {
    // Simulate processing
    setTimeout(() => {
      setUploadStatus('complete');
      setResults({
        total: 150,
        successful: 142,
        failed: 8,
        details: [
          { row: 5, name: 'Juan Pérez', email: 'juan@email.com', status: 'error', reason: 'Email duplicado' },
          { row: 12, name: 'María López', email: 'maria@invalid', status: 'error', reason: 'Email inválido' },
          { row: 23, name: 'Carlos Ruiz', email: '', status: 'error', reason: 'Campo email vacío' },
          { row: 45, name: 'Ana Torres', email: 'ana@email.com', status: 'error', reason: 'Rol inválido' },
          { row: 67, name: '', email: 'pedro@email.com', status: 'error', reason: 'Campo nombre vacío' },
          { row: 89, name: 'Laura Gómez', email: 'laura@email.com', status: 'error', reason: 'Programa no existe' },
          { row: 103, name: 'Roberto Díaz', email: 'roberto@email.com', status: 'error', reason: 'Formato incorrecto' },
          { row: 128, name: 'Sofia Martínez', email: 'sofia@email.com', status: 'error', reason: 'Email duplicado' },
        ]
      });
      toast.success('Carga masiva completada');
    }, 2000);
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setProgress(0);
    setResults(null);
  };

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

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Cargar Archivo</CardTitle>
        </CardHeader>
        <CardContent>
          {uploadStatus === 'idle' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 mb-2">Arrastra tu archivo aquí o haz clic para seleccionar</p>
              <p className="text-sm text-gray-600 mb-4">Soporta archivos CSV y Excel (.xlsx) hasta 10MB</p>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
                  <span>Seleccionar Archivo</span>
                </Button>
              </label>
            </div>
          )}

          {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-900">
                  {uploadStatus === 'uploading' ? 'Subiendo archivo...' : 'Procesando datos...'}
                </p>
                <span className="text-sm text-gray-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {uploadStatus === 'complete' && results && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-blue-700 mb-1">Total Procesados</p>
                    <p className="text-blue-900">{results.total}</p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-green-700">Exitosos</p>
                    </div>
                    <p className="text-green-900">{results.successful}</p>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-red-700">Fallidos</p>
                    </div>
                    <p className="text-red-900">{results.failed}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Error Details */}
              {results.details.length > 0 && (
                <div>
                  <h3 className="text-gray-900 mb-3">Errores Detectados</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.details.map((detail: any, index: number) => (
                      <div key={index} className="flex items-start justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-red-100 text-red-700">
                              Fila {detail.row}
                            </Badge>
                            <p className="text-sm text-gray-900">{detail.name || '(Sin nombre)'}</p>
                          </div>
                          <p className="text-sm text-gray-600">{detail.email || '(Sin email)'}</p>
                          <p className="text-xs text-red-600 mt-1">{detail.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={resetUpload} variant="outline">
                  Cargar Otro Archivo
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Errores
                </Button>
              </div>
            </div>
          )}
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
