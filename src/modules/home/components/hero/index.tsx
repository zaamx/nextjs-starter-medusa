import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

const trustBadges = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    label: "Respaldado por Ciencia",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    label: "Garantía 30 Días",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    label: "Envío Gratis",
  },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-brand-dark flex items-center overflow-hidden">
      <Image
        src="/wenow-hero.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />

      <div className="relative z-10 content-container w-full">
        <div className="flex items-center py-32 min-h-screen">
          <div className="flex flex-col gap-6 max-w-xl">
            <p className="text-xs tracking-[0.3em] text-white/50 uppercase">
              Club WeNow — Nutracéuticos
            </p>
            <h1
              className="font-display text-white leading-none"
              style={{ fontSize: "clamp(52px, 7vw, 100px)" }}
            >
              EL SUPLEMENTO QUE TU CUERPO NECESITA
            </h1>
            <p className="text-white/70 text-lg max-w-md leading-relaxed">
              Formulado con propósito, respaldado por ciencia. Nutrición diaria diseñada para tu etapa de vida.
            </p>
            <div>
              <LocalizedClientLink
                href="/store"
                className="inline-block bg-brand-magenta text-white font-display text-sm tracking-widest px-8 py-4 hover:bg-opacity-90 transition-colors"
              >
                ENCUENTRA TU FÓRMULA
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="absolute bottom-0 inset-x-0 border-t border-white/10">
        <div className="content-container">
          <div className="flex flex-wrap justify-center small:justify-start gap-8 py-6">
            {trustBadges.map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/60">
                {icon}
                <span className="text-xs tracking-widest uppercase">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
