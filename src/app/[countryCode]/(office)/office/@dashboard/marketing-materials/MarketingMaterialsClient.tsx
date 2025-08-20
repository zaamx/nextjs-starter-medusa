"use client";

import { useState } from "react"

interface MarketingMaterialsClientProps {
  netmeProfileId: number;
}

export default function MarketingMaterialsClient({ netmeProfileId }: MarketingMaterialsClientProps) {
  const [copied, setCopied] = useState(false);

  const referralLink = `https://store.wenow.global/?mystore=${netmeProfileId}`;
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" + encodeURIComponent(referralLink);
  
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

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = (platform: string) => {
    const message = `¡Únete a mi negocio! Usa mi enlace de referido: ${referralLink}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('¡Únete a mi negocio!')}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=Invitación a mi negocio&body=${encodeURIComponent(message)}`, '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative p-8 ">
      {/* Overlay */}
      {/* <div className="absolute inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center pointer-events-auto">
        <span className="text-3xl font-bold text-gray-700">Próximamente</span>
      </div> */}
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
              value={referralLink}
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
          <p className="text-xs text-gray-400 mb-3">Comparte este enlace para invitar a nuevos socios.</p>
          
          {/* Share Options */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              WhatsApp
            </button>
            
            <button
              onClick={() => handleShare('telegram')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </button>
            
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2 px-3 py-2 bg-sky-500 text-white rounded-md text-sm hover:bg-sky-600 transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </button>
            
            <button
              onClick={() => handleShare('email')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M0 3v18h24V3H0zm21.518 2L12 12.713 2.482 5h19.036zM2 19V7.183l10 8.104 10-8.104V19H2z"/>
              </svg>
              Email
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <img src={qrUrl} alt="QR de referido" className="rounded-md border border-gray-200" />
          <span className="text-xs text-gray-500 mt-2">QR dinámico</span>
        </div>
      </div>

      {/* Templates, Videos, PDFs */}
      {/* <div className="mb-8">
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
      </div> */}

      {/* Stats */}
      {/* <div className="bg-white rounded-lg shadow p-6">
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
      </div> */}
    </div>
  );
}
