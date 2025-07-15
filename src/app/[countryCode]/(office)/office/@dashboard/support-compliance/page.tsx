"use client";

const mockFaqs = [
  { q: "¿Cómo abro un ticket de soporte?", a: "Envía un correo a customer-care@wenow.odoo.com con los detalles de tu solicitud." },
  { q: "¿Dónde veo el historial de mis tickets?", a: "Actualmente, el historial se gestiona por correo. Recibirás respuesta en tu email registrado." },
  { q: "¿Hay chat en vivo?", a: "Por ahora, solo soporte por correo electrónico." },
];

const mockDocs = [
  { name: "Política de Ética", url: "#" },
  { name: "Términos y Condiciones", url: "#" },
  { name: "KYC/AML (Conozca a su Cliente)", url: "#" },
];

const mockAlerts = [
  { type: "KYC Pendiente", message: "Por favor, completa tu verificación de identidad para cumplir con las regulaciones." },
  { type: "Actualización de Políticas", message: "Revisa las nuevas políticas de ética y cumplimiento." },
];

export default function SupportCompliancePage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Soporte & Cumplimiento</h1>
      <p className="text-sm text-gray-500 mb-8">
        Servicio y gobernanza: tickets, documentos legales y alertas de cumplimiento.
      </p>

      {/* Compliance Alerts */}
      {mockAlerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Alertas de Cumplimiento</h2>
          <div className="space-y-2">
            {mockAlerts.map((alert, idx) => (
              <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded flex items-center gap-2">
                <span className="text-yellow-600 font-bold">⚠️ {alert.type}:</span>
                <span className="text-sm text-gray-700">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket System */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Sistema de Tickets</h2>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <p className="mb-2 text-sm text-gray-700">
            Para soporte, envía un correo a:
            <a href="mailto:customer-care@wenow.odoo.com" className="text-blue-600 font-semibold ml-1">customer-care@wenow.odoo.com</a>
          </p>
          <ul className="list-disc pl-5 text-xs text-gray-500">
            <li>Incluye tu nombre, ID de usuario y descripción clara del problema.</li>
            <li>Recibirás respuesta en tu correo registrado.</li>
            <li>No hay chat ni historial en la plataforma por ahora.</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2 text-sm">Preguntas Frecuentes</h3>
          <ul className="divide-y divide-gray-100">
            {mockFaqs.map((faq, idx) => (
              <li key={idx} className="py-2">
                <span className="font-medium text-gray-800">{faq.q}</span>
                <br />
                <span className="text-xs text-gray-600">{faq.a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Legal Documents */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Documentos Legales y Políticas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {mockDocs.map((doc, idx) => (
            <a
              key={idx}
              href={doc.url}
              className="block bg-white rounded-lg shadow p-4 text-center hover:shadow-lg transition border border-gray-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="text-lg">📄</span>
              <div className="mt-2 text-xs font-medium text-gray-700">{doc.name}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
} 