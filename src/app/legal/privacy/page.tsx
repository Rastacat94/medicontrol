import { Metadata } from 'next';
import { Shield, Lock, Database, Users, Mail, FileText } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidad - MediControl',
  description: 'Política de Privacidad de MediControl. Información sobre cómo tratamos y protegemos tus datos personales y de salud.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Política de Privacidad</h1>
              <p className="text-gray-500">Última actualización: Enero 2025</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm">
              <strong>Resumen:</strong> Tus datos son tuyos. Solo los usamos para brindarte el servicio de gestión de medicamentos. 
              Nunca vendemos tu información. Puedes eliminar todos tus datos en cualquier momento desde la configuración de la app.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">1. Datos que Recopilamos</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-4">
                MediControl recopila únicamente los datos necesarios para proporcionarte el servicio de gestión de medicamentos:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Datos de identificación:</strong> Nombre, correo electrónico, teléfono (opcional)</li>
                <li><strong>Datos de salud:</strong> Lista de medicamentos, dosis, horarios, historial de tomas</li>
                <li><strong>Datos de contacto:</strong> Información de cuidadores designados por ti</li>
                <li><strong>Datos técnicos:</strong> ID de dispositivo, versión de la app, registros de errores</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">2. Cómo Usamos tus Datos</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-4">
                Utilizamos tus datos exclusivamente para:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Mostrar tus medicamentos y recordatorios en la aplicación</li>
                <li>Alertarte sobre posibles interacciones entre medicamentos</li>
                <li>Enviar alertas a tus cuidadores cuando lo configures</li>
                <li>Generar reportes para compartir con tu médico</li>
                <li>Enviar SMS de alerta (solo si compras créditos)</li>
                <li>Mejorar nuestros servicios y corregir errores</li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 text-sm">
                  <strong>NO hacemos:</strong> No vendemos tus datos a terceros. No compartimos tu información con aseguradoras. 
                  No usamos tus datos de salud para publicidad.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">3. Compartición con Terceros</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-4">
                Solo compartimos datos en estas circunstancias limitadas:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Cuidadores:</strong> Solo los que tú autorices pueden ver tus medicamentos y recibir alertas</li>
                <li><strong>Twilio:</strong> Solo el número de teléfono y mensaje necesario para enviar SMS de alerta</li>
                <li><strong>Supabase:</strong> Base de datos encriptada donde se almacenan tus datos</li>
                <li><strong>Autoridades:</strong> Solo si somos requeridos por ley</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold text-gray-900">4. Seguridad de los Datos</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-4">
                Implementamos medidas de seguridad técnicas y organizativas:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Encriptación SSL/TLS en todas las comunicaciones</li>
                <li>Encriptación de base de datos en reposo</li>
                <li>Autenticación segura con contraseñas hasheadas</li>
                <li>Row Level Security (RLS) para aislamiento de datos por usuario</li>
                <li>Acceso limitado del personal a datos sensibles</li>
                <li>Auditoría de accesos y cambios</li>
              </ul>
            </div>
          </section>

          {/* Section 5 - GDPR */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">5. Tus Derechos (RGPD / LOPD-GDD)</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-4">
                Como usuario europeo, tienes los siguientes derechos:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Derecho de Acceso</h4>
                  <p className="text-sm text-gray-600">Puedes ver todos tus datos en cualquier momento desde la app</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Derecho de Rectificación</h4>
                  <p className="text-sm text-gray-600">Puedes corregir cualquier dato incorrecto</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Derecho de Supresión</h4>
                  <p className="text-sm text-gray-600">Puedes eliminar todos tus datos desde Configuración → Eliminar todo</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Derecho de Portabilidad</h4>
                  <p className="text-sm text-gray-600">Puedes exportar tus datos en formato JSON</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Derecho de Oposición</h4>
                  <p className="text-sm text-gray-600">Puedes oponerte al procesamiento de tus datos</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Derecho a Reclamación</h4>
                  <p className="text-sm text-gray-600">Puedes reclamar ante la AEPD si consideras que violamos tus derechos</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 - Retention */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Conservación de Datos</h2>
            <div className="prose prose-gray max-w-none">
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Cuenta activa:</strong> Los datos se mantienen mientras la cuenta esté activa</li>
                <li><strong>Cuenta eliminada:</strong> Todos los datos se eliminan en un plazo de 30 días</li>
                <li><strong>Historial de dosis:</strong> Se mantiene hasta 2 años para reportes médicos</li>
                <li><strong>Logs de alertas:</strong> Se conservan 1 año para auditoría</li>
              </ul>
            </div>
          </section>

          {/* Section 7 - Children */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Menores de Edad</h2>
            <p className="text-gray-600">
              MediControl no está destinado a menores de 16 años. Si eres padre/madre y deseas que un menor use la app, 
              debes crear la cuenta a tu nombre y supervisar su uso. No recopilamos intencionadamente datos de menores.
            </p>
          </section>

          {/* Section 8 - Changes */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Cambios en la Política</h2>
            <p className="text-gray-600">
              Podemos actualizar esta política ocasionalmente. Te notificaremos mediante un aviso en la aplicación 
              cuando haya cambios significativos. Te recomendamos revisar esta página periódicamente.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t pt-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Contacto</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Si tienes preguntas sobre esta política o quieres ejercer tus derechos:
            </p>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700"><strong>Email:</strong> privacidad@medicontrol.app</p>
              <p className="text-gray-700"><strong>Delegado de Protección de Datos:</strong> dpo@medicontrol.app</p>
              <p className="text-gray-700"><strong>Dirección:</strong> [Tu dirección comercial]</p>
            </div>
          </section>

          {/* Back link */}
          <div className="pt-8 border-t">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Volver a MediControl
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
