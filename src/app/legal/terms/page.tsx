import { Metadata } from 'next';
import { FileText, AlertTriangle, Check, X, CreditCard, Ban, Scale } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Términos de Servicio - MediControl',
  description: 'Términos de Servicio de MediControl. Condiciones de uso y descargo de responsabilidad médica.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Términos de Servicio</h1>
              <p className="text-gray-500">Última actualización: Enero 2025</p>
            </div>
          </div>
          
          {/* Important disclaimer */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-800 mb-1">DESCARGO DE RESPONSABILIDAD MÉDICA</h3>
                <p className="text-red-700 text-sm">
                  MediControl NO es un dispositivo médico ni sustituye el consejo médico profesional. 
                  NO nos hacemos responsables si un usuario olvida tomar su medicación o si las alertas fallan. 
                  Esta aplicación es una herramienta de organización personal, no un sistema médico certificado.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Section 1 - Acceptance */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p className="text-gray-600">
              Al descargar, instalar o usar MediControl ("la Aplicación"), aceptas estos Términos de Servicio. 
              Si no estás de acuerdo con alguna parte, no debes usar la Aplicación.
            </p>
            <p className="text-gray-600 mt-2">
              Estos términos aplican tanto a usuarios gratuitos como a suscriptores Premium.
            </p>
          </section>

          {/* Section 2 - Description */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Descripción del Servicio</h2>
            <p className="text-gray-600 mb-4">MediControl proporciona:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Gestión de lista de medicamentos personales</li>
              <li>Recordatorios de horarios de medicación</li>
              <li>Alertas de posibles interacciones (basadas en base de datos estática)</li>
              <li>Historial y reportes de dosis tomadas/omitidas</li>
              <li>Compartición de datos con cuidadores designados</li>
              <li>Envío de SMS de alerta (servicio de pago vía Twilio)</li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-amber-800 text-sm">
                <strong>Importante:</strong> Las alertas de interacciones son orientativas y no reemplazan 
                la consulta con un farmacéutico o médico. La base de datos puede no estar completa o actualizada.
              </p>
            </div>
          </section>

          {/* Section 3 - Medical Disclaimer */}
          <section className="border-2 border-red-100 rounded-xl p-6 bg-red-50/50">
            <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              3. Descargo de Responsabilidad Médica (MUY IMPORTANTE)
            </h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>MediControl NO es un dispositivo médico certificado.</strong></p>
              
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">NO sustituye el consejo, diagnóstico o tratamiento médico profesional</p>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">NO garantiza que recibirás todas las alertas (fallas técnicas pueden ocurrir)</p>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">NO garantiza que los cuidadores recibirán los SMS (depende de cobertura móvil)</p>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">NO es responsable si olvidas tomar tu medicación</p>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">NO es responsable de consecuencias médicas por dosis omitidas</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                Al usar esta app, reconoces que eres el único responsable de tu medicación. 
                Debes consultar siempre con tu médico o farmacéutico ante cualquier duda.
              </p>
            </div>
          </section>

          {/* Section 4 - User Responsibilities */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Responsabilidades del Usuario</h2>
            <p className="text-gray-600 mb-4">Te comprometes a:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm">Proporcionar información veraz sobre tus medicamentos</p>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm">No usar la app como única fuente de información médica</p>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm">Mantener la confidencialidad de tu cuenta</p>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm">Tener un plan de respaldo para medicamentos críticos</p>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm">Informar a tus cuidadores que pueden recibir alertas</p>
              </div>
            </div>
          </section>

          {/* Section 5 - Subscriptions */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-purple-600" />
              5. Suscripciones y Pagos
            </h2>
            <div className="space-y-4 text-gray-600">
              <p><strong>Plan Gratuito:</strong> Funciones básicas de gestión, 3 SMS de bienvenida, anuncios no intrusivos.</p>
              <p><strong>Plan Premium (Escudo Familiar):</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>SMS ilimitados de alerta</li>
                <li>Sin publicidad</li>
                <li>Backup automático en la nube</li>
                <li>Soporte prioritario</li>
              </ul>
              
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Condiciones de Suscripción:</h4>
                <ul className="text-sm space-y-1">
                  <li>• El cargo se procesa al inicio del período</li>
                  <li>• Puedes cancelar en cualquier momento desde la app</li>
                  <li>• Al cancelar, mantienes acceso hasta fin de período</li>
                  <li>• No hay reembolsos por períodos parciales</li>
                  <li>• Los SMS no utilizados no son reembolsables</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6 - Limitation of Liability */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Ban className="w-6 h-6 text-red-600" />
              6. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-600 mb-4">
              EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-gray-700 text-sm">
              <p>
                <strong>a)</strong> MediControl no se hace responsable de daños directos, indirectos, incidentales 
                o consecuentes derivados del uso o imposibilidad de uso de la aplicación.
              </p>
              <p>
                <strong>b)</strong> No garantizamos que el servicio esté disponible sin interrupciones. 
                Mantenimientos, actualizaciones o fallos pueden causar indisponibilidad temporal.
              </p>
              <p>
                <strong>c)</strong> Las alertas por SMS dependen de terceros (Twilio, operadoras móviles) 
                y pueden fallar por causas fuera de nuestro control.
              </p>
              <p>
                <strong>d)</strong> La responsabilidad total está limitada al importe pagado por el usuario 
                en los últimos 12 meses.
              </p>
            </div>
            <p className="text-gray-600 mt-4 text-sm">
              Algunas jurisdicciones no permiten limitaciones de responsabilidad, por lo que algunas 
              de las anteriores pueden no aplicarte.
            </p>
          </section>

          {/* Section 7 - Termination */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Terminación</h2>
            <p className="text-gray-600">
              <strong>Por tu parte:</strong> Puedes eliminar tu cuenta en cualquier momento desde Configuración. 
              Tus datos se eliminarán en 30 días.
            </p>
            <p className="text-gray-600 mt-2">
              <strong>Por nuestra parte:</strong> Podemos suspender o terminar tu cuenta si violas estos términos, 
              con previo aviso salvo en casos graves (fraude, abuso del servicio).
            </p>
          </section>

          {/* Section 8 - Disputes */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-blue-600" />
              8. Resolución de Disputas y Ley Aplicable
            </h2>
            <div className="text-gray-600 space-y-2">
              <p><strong>Ley aplicable:</strong> Legislación española y normativa europea de protección de datos.</p>
              <p><strong>Jurisdicción:</strong> Los Juzgados y Tribunales de [Tu ciudad], España.</p>
              <p><strong>Resolución alternativa:</strong> Antes de litigar, te invitamos a contactarnos para 
              buscar una solución amistosa.</p>
            </div>
          </section>

          {/* Section 9 - Changes */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Modificaciones</h2>
            <p className="text-gray-600">
              Podemos modificar estos términos. Para cambios significativos, te notificaremos con 30 días 
              de antelación mediante un aviso en la app. El uso continuado después de los cambios implica aceptación.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Contacto</h2>
            <p className="text-gray-600 mb-4">
              Para cualquier pregunta sobre estos términos:
            </p>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700"><strong>Email:</strong> legal@medicontrol.app</p>
              <p className="text-gray-700"><strong>Soporte:</strong> soporte@medicontrol.app</p>
            </div>
          </section>

          {/* Back link */}
          <div className="pt-8 border-t">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Volver a MediControl
            </Link>
            <span className="mx-4 text-gray-300">|</span>
            <Link href="/legal/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
              Política de Privacidad →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
