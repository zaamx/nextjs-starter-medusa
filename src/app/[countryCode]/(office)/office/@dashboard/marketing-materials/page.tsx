"use client";

import { useState } from "react"


const mockReferralLink = "https://store.wenow.global/ref/1";
const mockQrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://store.wenow.global/ref/1";
const mockTemplates = [
  { type: "Instagram Story", url: "#", preview: "/marketing/ig-story.png" },
  { type: "Facebook Post", url: "#", preview: "/marketing/fb-post.png" },
  { type: "Video Promo", url: "#", preview: "/marketing/video-thumb.png" },
  { type: "PDF Producto", url: "#", preview: "/marketing/pdf-thumb.png" },
];
const mockStats = {
  clicks: 128,
  conversions: 12,
  last30: [5, 8, 12, 7, 10, 15, 9, 14, 8, 12, 11, 17, 13, 10, 8, 9, 7, 12, 14, 13, 11, 10, 9, 8, 7, 6, 8, 10, 12, 13],
};

export default function MarketingMaterialsPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(mockReferralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative p-8 ">
      {/* Overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center pointer-events-auto">
        <span className="text-3xl font-bold text-gray-700">Próximamente</span>
      </div>
      {/* Page content below (will be covered by overlay) */}
      <h1 className="text-2xl font-bold mb-2">Materiales de Marketing</h1>
      <p className="text-sm text-gray-500 mb-8">
        Herramientas para duplicación y crecimiento de tu negocio.
      </p>

      {/* Referral Links & QR */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">Enlace de referido</h2>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={mockReferralLink}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
            >
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
          <p className="text-xs text-gray-400">Comparte este enlace para invitar a nuevos socios.</p>
        </div>
        <div className="flex flex-col items-center">
          <img src={mockQrUrl} alt="QR de referido" className="rounded-md border border-gray-200" />
          <span className="text-xs text-gray-500 mt-2">QR dinámico</span>
        </div>
      </div>

      {/* Templates, Videos, PDFs */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Plantillas y Recursos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {mockTemplates.map((tpl, idx) => (
            <a
              key={idx}
              href={tpl.url}
              className="group block bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden border border-gray-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100 flex items-center justify-center">
                <img
                  src={tpl.preview}
                  alt={tpl.type}
                  className="object-contain w-full h-24 group-hover:scale-105 transition"
                />
              </div>
              <div className="p-2 text-center text-xs font-medium text-gray-700">
                {tpl.type}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Estadísticas de Referidos</h2>
        <div className="flex gap-8 items-end mb-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">{mockStats.clicks}</div>
            <div className="text-xs text-gray-500">Clics</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{mockStats.conversions}</div>
            <div className="text-xs text-gray-500">Conversiones</div>
          </div>
        </div>
        {/* Simple bar chart mock */}
        <div className="flex items-end gap-1 h-16">
          {mockStats.last30.map((val, idx) => (
            <div
              key={idx}
              className="bg-blue-200 rounded"
              style={{ height: `${val * 6}px`, width: '4px' }}
              title={`Día ${idx + 1}: ${val} clics`}
            />
          ))}
        </div>
        <div className="text-xs text-gray-400 mt-2">Últimos 30 días</div>
      </div>
    </div>
  );
} 